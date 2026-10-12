import { searchQuickbooksRefundReceipts } from "../handlers/search-quickbooks-refund-receipts.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { searchResult } from "../helpers/tool-result.js";
const toolName = "search_refund_receipts";
const toolDescription = "Search for refund receipts in QuickBooks Online.";

const toolSchema = z.object({
  customer_ref: z.string().optional().describe("Filter by customer ID"),
  txn_date_from: z.string().optional().describe("Filter by date from (YYYY-MM-DD)"),
  txn_date_to: z.string().optional().describe("Filter by date to (YYYY-MM-DD)"),
  limit: z.number().optional().describe("Maximum results to return"),
});

const toolHandler = async ({ params }: any) => {
  const response = await searchQuickbooksRefundReceipts(params);
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error searching refund receipts: ${response.error}` }] };
  }
  return searchResult("refundReceipts", response.result);
};

export const SearchRefundReceiptsTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
