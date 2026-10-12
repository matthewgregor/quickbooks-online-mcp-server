import { getQuickbooksCreditMemo } from "../handlers/get-quickbooks-credit-memo.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "get_credit_memo";
const toolDescription = "Get a single credit memo by ID from QuickBooks Online.";
const toolSchema = z.object({
  id: z.string().min(1).describe("The QuickBooks Credit Memo ID"),
});

const toolHandler = async ({ params }: any) => {
  const response = await getQuickbooksCreditMemo(params.id);
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error getting credit memo: ${response.error}` }] };
  }
  return jsonResult(response.result);
};

export const GetCreditMemoTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
