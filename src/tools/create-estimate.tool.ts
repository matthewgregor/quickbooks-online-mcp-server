import { createQuickbooksEstimate } from "../handlers/create-quickbooks-estimate.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "create_estimate";
const toolDescription =
  "Create an estimate in QuickBooks Online. Accepts a raw QBO Estimate object; per-line tax codes go in Line[].SalesItemLineDetail.TaxCodeRef ({ value: <TaxCode Id> } for non-US companies, 'TAX'/'NON' for US).";
const toolSchema = z.object({ estimate: z.any() });

const toolHandler = async (args: any) => {
  const response = await createQuickbooksEstimate(args.params.estimate);
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error creating estimate: ${response.error}` }] };
  }
  return jsonResult(response.result);
};

export const CreateEstimateTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
}; 