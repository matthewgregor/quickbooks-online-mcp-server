import { getQuickbooksTaxAgency } from "../handlers/get-quickbooks-tax-agency.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "get_tax_agency";
const toolDescription = "Retrieve a specific tax agency from QuickBooks Online by ID.";
const toolSchema = z.object({
  id: z.string().min(1).describe("Tax agency ID"),
});

const toolHandler = async ({ params }: any) => {
  const response = await getQuickbooksTaxAgency(params.id);
  if (response.isError) return { content: [{ type: "text" as const, text: `Error: ${response.error}` }] };
  return jsonResult(response.result);
};

export const GetTaxAgencyTool: ToolDefinition<typeof toolSchema> = { name: toolName, description: toolDescription, schema: toolSchema, handler: toolHandler };
