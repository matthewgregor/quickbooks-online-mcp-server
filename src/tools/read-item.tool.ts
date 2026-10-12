import { readQuickbooksItem } from "../handlers/read-quickbooks-item.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "read_item";
const toolDescription = "Read a single item in QuickBooks Online by its ID.";

const toolSchema = z.object({
  item_id: z.string().min(1, { message: "Item ID is required" }),
});

const toolHandler = async ({ params }: any) => {
  const { item_id } = params;
  const response = await readQuickbooksItem(item_id);

  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error reading item ${item_id}: ${response.error}` }] };
  }

  return jsonResult(response.result);
};

export const ReadItemTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
}; 