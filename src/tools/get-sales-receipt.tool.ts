import { getQuickbooksSalesReceipt } from "../handlers/get-quickbooks-sales-receipt.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "get_sales_receipt";
const toolDescription = "Get a single sales receipt by ID from QuickBooks Online.";
const toolSchema = z.object({
  id: z.string().min(1).describe("The QuickBooks Sales Receipt ID"),
});

const toolHandler = async ({ params }: any) => {
  const response = await getQuickbooksSalesReceipt(params.id);
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error getting sales receipt: ${response.error}` }] };
  }
  return jsonResult(response.result);
};

export const GetSalesReceiptTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
