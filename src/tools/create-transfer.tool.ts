import { createQuickbooksTransfer } from "../handlers/create-quickbooks-transfer.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "create_transfer";
const toolDescription = "Create a bank transfer between accounts in QuickBooks Online.";
const toolSchema = z.object({
  from_account_ref: z.string().min(1).describe("Source bank account ID"),
  to_account_ref: z.string().min(1).describe("Destination bank account ID"),
  amount: z.number().positive().describe("Transfer amount"),
  txn_date: z.string().optional().describe("Transaction date (YYYY-MM-DD)"),
  private_note: z.string().optional().describe("Private note"),
});

const toolHandler = async ({ params }: any) => {
  const response = await createQuickbooksTransfer(params);
  if (response.isError) return { content: [{ type: "text" as const, text: `Error: ${response.error}` }] };
  return jsonResult(response.result);
};

export const CreateTransferTool: ToolDefinition<typeof toolSchema> = { name: toolName, description: toolDescription, schema: toolSchema, handler: toolHandler };
