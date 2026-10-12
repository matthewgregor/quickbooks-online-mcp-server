import { searchQuickbooksBudgets } from "../handlers/search-quickbooks-budgets.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { searchResult } from "../helpers/tool-result.js";
const toolName = "search_budgets";
const toolDescription = "Search for budgets in QuickBooks Online. Returns Budget records with nested BudgetDetail line items (Amount, BudgetDate, AccountRef, ClassRef, CustomerRef, DepartmentRef, LocationRef). Budget is read-only in the QBO v3 API.";
const toolSchema = z.object({
  name: z.string().optional().describe("Filter by budget name"),
  active: z.boolean().optional().describe("Filter by active status"),
  limit: z.number().optional().describe("Maximum results to return"),
});

const toolHandler = async ({ params }: any) => {
  const response = await searchQuickbooksBudgets(params);
  if (response.isError) return { content: [{ type: "text" as const, text: `Error: ${response.error}` }] };
  return searchResult("budgets", response.result);
};

export const SearchBudgetsTool: ToolDefinition<typeof toolSchema> = { name: toolName, description: toolDescription, schema: toolSchema, handler: toolHandler };
