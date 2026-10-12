import { updateQuickbooksInvoice } from "../handlers/update-quickbooks-invoice.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "update_invoice";
const toolDescription = "Update an existing invoice in Quickbooks by ID (sparse update).";

const toolSchema = z.object({
  invoice_id: z.string().min(1),
  patch: z.record(z.any()),
});

const toolHandler = async ({ params }: any) => {
  const response = await updateQuickbooksInvoice(params);
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error updating invoice: ${response.error}` }] };
  }
  return jsonResult(response.result);
};

export const UpdateInvoiceTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
}; 