import { getQuickbooksVendorCredit } from "../handlers/get-quickbooks-vendor-credit.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "get_vendor_credit";
const toolDescription = "Get a vendor credit by ID from QuickBooks Online.";
const toolSchema = z.object({ id: z.string().min(1).describe("Vendor Credit ID") });

const toolHandler = async ({ params }: any) => {
  const response = await getQuickbooksVendorCredit(params.id);
  if (response.isError) return { content: [{ type: "text" as const, text: `Error: ${response.error}` }] };
  return jsonResult(response.result);
};

export const GetVendorCreditTool: ToolDefinition<typeof toolSchema> = { name: toolName, description: toolDescription, schema: toolSchema, handler: toolHandler };
