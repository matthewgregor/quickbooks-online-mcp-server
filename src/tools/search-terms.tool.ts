import { searchQuickbooksTerms } from "../handlers/search-quickbooks-terms.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { searchResult } from "../helpers/tool-result.js";
const toolName = "search_terms";
const toolDescription = "Search for payment terms in QuickBooks Online with optional filters.";
const toolSchema = z.object({
  name: z.string().optional().describe("Filter by term name"),
  active: z.boolean().optional().describe("Filter by active status"),
  limit: z.number().optional().describe("Maximum results to return"),
});

const toolHandler = async ({ params }: any) => {
  const response = await searchQuickbooksTerms(params);
  if (response.isError) return { content: [{ type: "text" as const, text: `Error: ${response.error}` }] };
  return searchResult("terms", response.result);
};

export const SearchTermsTool: ToolDefinition<typeof toolSchema> = { name: toolName, description: toolDescription, schema: toolSchema, handler: toolHandler };
