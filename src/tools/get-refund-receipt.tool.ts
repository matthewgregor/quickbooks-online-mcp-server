import { getQuickbooksRefundReceipt } from "../handlers/get-quickbooks-refund-receipt.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "get_refund_receipt";
const toolDescription = "Get a single refund receipt by ID from QuickBooks Online.";
const toolSchema = z.object({
  id: z.string().min(1).describe("The QuickBooks Refund Receipt ID"),
});

const toolHandler = async ({ params }: any) => {
  const response = await getQuickbooksRefundReceipt(params.id);
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error getting refund receipt: ${response.error}` }] };
  }
  return jsonResult(response.result);
};

export const GetRefundReceiptTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
