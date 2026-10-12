import { deleteQuickbooksEstimate } from "../handlers/delete-quickbooks-estimate.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "delete_estimate";
const toolDescription = "Delete (void) an estimate in QuickBooks Online.";
const toolSchema = z.object({ idOrEntity: z.any() });

const toolHandler = async (args: any) => {
  const response = await deleteQuickbooksEstimate(args.params.idOrEntity);
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error deleting estimate: ${response.error}` }] };
  }
  return jsonResult(response.result);
};

export const DeleteEstimateTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
}; 