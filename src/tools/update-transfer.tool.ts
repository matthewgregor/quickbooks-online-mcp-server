import { updateQuickbooksTransfer } from "../handlers/update-quickbooks-transfer.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "update_transfer";
const toolDescription = "Update a transfer in QuickBooks Online.";
const toolSchema = z.object({
  id: z.string().min(1).describe("Transfer ID"),
  sync_token: z.string().min(1).describe("Sync token"),
  from_account_ref: z.string().optional().describe("Source account ID"),
  to_account_ref: z.string().optional().describe("Destination account ID"),
  amount: z.number().optional().describe("Transfer amount"),
  private_note: z.string().optional().describe("Private note"),
});

const toolHandler = async ({ params }: any) => {
  const response = await updateQuickbooksTransfer(params);
  if (response.isError) return { content: [{ type: "text" as const, text: `Error: ${response.error}` }] };
  return jsonResult(response.result);
};

export const UpdateTransferTool: ToolDefinition<typeof toolSchema> = { name: toolName, description: toolDescription, schema: toolSchema, handler: toolHandler };
