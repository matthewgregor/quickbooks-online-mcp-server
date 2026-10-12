import { getQuickbooksAccount } from "../handlers/get-quickbooks-account.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "get_account";
const toolDescription = "Get a single account by ID from QuickBooks Online.";
const toolSchema = z.object({
  id: z.string().min(1).describe("The QuickBooks Account ID"),
});

const toolHandler = async ({ params }: any) => {
  const response = await getQuickbooksAccount(params.id);

  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error getting account: ${response.error}` }] };
  }

  return jsonResult(response.result);
};

export const GetAccountTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
