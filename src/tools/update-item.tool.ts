import { updateQuickbooksItem } from "../handlers/update-quickbooks-item.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "update_item";
const toolDescription = "Update an existing item in Quickbooks by ID (sparse update).";

const toolSchema = z.object({
  item_id: z.string().min(1),
  patch: z.record(z.any()),
});

const toolHandler = async ({ params }: any) => {
  const response = await updateQuickbooksItem(params);
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error updating item: ${response.error}` }] };
  }
  return jsonResult(response.result);
};

export const UpdateItemTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
}; 