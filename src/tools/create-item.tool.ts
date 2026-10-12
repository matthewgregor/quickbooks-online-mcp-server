import { createQuickbooksItem } from "../handlers/create-quickbooks-item.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "create_item";
const toolDescription = "Create an item in QuickBooks Online.";

const toolSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  income_account_ref: z.string().min(1),
  expense_account_ref: z.string().optional(),
  unit_price: z.number().optional(),
  description: z.string().optional(),
});

const toolHandler = async ({ params }: any) => {
  const response = await createQuickbooksItem(params);
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error creating item: ${response.error}` }] };
  }
  return jsonResult(response.result);
};

export const CreateItemTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
}; 