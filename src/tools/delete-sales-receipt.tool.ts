import { deleteQuickbooksSalesReceipt } from "../handlers/delete-quickbooks-sales-receipt.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "delete_sales_receipt";
const toolDescription = "Delete (void) a sales receipt in QuickBooks Online.";
const toolSchema = z.object({ idOrEntity: z.any() });

const toolHandler = async (args: any) => {
  const response = await deleteQuickbooksSalesReceipt(args.params.idOrEntity);
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error deleting sales receipt: ${response.error}` }] };
  }
  return jsonResult(response.result);
};

export const DeleteSalesReceiptTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
