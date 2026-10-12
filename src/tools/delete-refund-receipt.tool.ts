import { deleteQuickbooksRefundReceipt } from "../handlers/delete-quickbooks-refund-receipt.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "delete_refund_receipt";
const toolDescription = "Delete (void) a refund receipt in QuickBooks Online.";
const toolSchema = z.object({ idOrEntity: z.any() });

const toolHandler = async (args: any) => {
  const response = await deleteQuickbooksRefundReceipt(args.params.idOrEntity);
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error deleting refund receipt: ${response.error}` }] };
  }
  return jsonResult(response.result);
};

export const DeleteRefundReceiptTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
