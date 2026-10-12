import { searchQuickbooksDeposits } from "../handlers/search-quickbooks-deposits.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { searchResult } from "../helpers/tool-result.js";
const toolName = "search_deposits";
const toolDescription = "Search for deposits in QuickBooks Online.";
const toolSchema = z.object({
  txn_date_from: z.string().optional().describe("Filter by date from"),
  txn_date_to: z.string().optional().describe("Filter by date to"),
  limit: z.number().optional().describe("Maximum results"),
});

const toolHandler = async ({ params }: any) => {
  const response = await searchQuickbooksDeposits(params);
  if (response.isError) return { content: [{ type: "text" as const, text: `Error: ${response.error}` }] };
  return searchResult("deposits", response.result);
};

export const SearchDepositsTool: ToolDefinition<typeof toolSchema> = { name: toolName, description: toolDescription, schema: toolSchema, handler: toolHandler };
