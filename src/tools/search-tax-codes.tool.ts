import { searchQuickbooksTaxCodes } from "../handlers/search-quickbooks-tax-codes.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { searchResult } from "../helpers/tool-result.js";
const toolName = "search_tax_codes";
const toolDescription = "Search for tax codes in QuickBooks Online with optional filters.";
const toolSchema = z.object({
  name: z.string().optional().describe("Filter by tax code name"),
  active: z.boolean().optional().describe("Filter by active status"),
  taxable: z.boolean().optional().describe("Filter by taxable status"),
  limit: z.number().optional().describe("Maximum results to return"),
});

const toolHandler = async ({ params }: any) => {
  const response = await searchQuickbooksTaxCodes(params);
  if (response.isError) return { content: [{ type: "text" as const, text: `Error: ${response.error}` }] };
  return searchResult("taxCodes", response.result);
};

export const SearchTaxCodesTool: ToolDefinition<typeof toolSchema> = { name: toolName, description: toolDescription, schema: toolSchema, handler: toolHandler };
