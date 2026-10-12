import { getQuickbooksPayment } from "../handlers/get-quickbooks-payment.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "get_payment";
const toolDescription = "Get a single payment by ID from QuickBooks Online.";
const toolSchema = z.object({
  id: z.string().min(1).describe("The QuickBooks Payment ID"),
});

const toolHandler = async ({ params }: any) => {
  const response = await getQuickbooksPayment(params.id);

  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error getting payment: ${response.error}` }] };
  }

  return jsonResult(response.result);
};

export const GetPaymentTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
