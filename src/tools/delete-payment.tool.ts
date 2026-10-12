import { deleteQuickbooksPayment } from "../handlers/delete-quickbooks-payment.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "delete_payment";
const toolDescription = "Delete (void) a payment in QuickBooks Online.";
const toolSchema = z.object({ idOrEntity: z.any() });

const toolHandler = async (args: any) => {
  const response = await deleteQuickbooksPayment(args.params.idOrEntity);

  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error deleting payment: ${response.error}` }] };
  }

  return jsonResult(response.result);
};

export const DeletePaymentTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
