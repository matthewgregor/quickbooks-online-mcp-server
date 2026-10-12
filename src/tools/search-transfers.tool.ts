import { searchQuickbooksTransfers } from "../handlers/search-quickbooks-transfers.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { searchResult } from "../helpers/tool-result.js";
const toolName = "search_transfers";
const toolDescription = "Search for transfers in QuickBooks Online.";
const toolSchema = z.object({
  txn_date_from: z.string().optional().describe("Filter by date from"),
  txn_date_to: z.string().optional().describe("Filter by date to"),
  limit: z.number().optional().describe("Maximum results"),
});

const toolHandler = async ({ params }: any) => {
  const response = await searchQuickbooksTransfers(params);
  if (response.isError) return { content: [{ type: "text" as const, text: `Error: ${response.error}` }] };
  return searchResult("transfers", response.result);
};

export const SearchTransfersTool: ToolDefinition<typeof toolSchema> = { name: toolName, description: toolDescription, schema: toolSchema, handler: toolHandler };
