import { deleteQuickbooksTransfer } from "../handlers/delete-quickbooks-transfer.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "delete_transfer";
const toolDescription = "Delete a transfer in QuickBooks Online.";
const toolSchema = z.object({ idOrEntity: z.any() });

const toolHandler = async (args: any) => {
  const response = await deleteQuickbooksTransfer(args.params.idOrEntity);
  if (response.isError) return { content: [{ type: "text" as const, text: `Error: ${response.error}` }] };
  return jsonResult(response.result);
};

export const DeleteTransferTool: ToolDefinition<typeof toolSchema> = { name: toolName, description: toolDescription, schema: toolSchema, handler: toolHandler };
