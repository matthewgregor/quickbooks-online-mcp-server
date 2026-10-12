import { deleteQuickbooksCustomer } from "../handlers/delete-quickbooks-customer.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "delete_customer";
const toolDescription = "Delete (make inactive) a customer in QuickBooks Online.";
const toolSchema = z.object({ idOrEntity: z.any() });

const toolHandler = async (args: any) => {
  const response = await deleteQuickbooksCustomer(args.params.idOrEntity);

  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error deleting customer: ${response.error}` }] };
  }

  return jsonResult(response.result);
};

export const DeleteCustomerTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
}; 