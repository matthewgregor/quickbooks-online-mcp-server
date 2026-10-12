import { getQuickbooksPurchaseOrder } from "../handlers/get-quickbooks-purchase-order.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "get_purchase_order";
const toolDescription = "Get a single purchase order by ID from QuickBooks Online.";
const toolSchema = z.object({ id: z.string().min(1).describe("Purchase Order ID") });

const toolHandler = async ({ params }: any) => {
  const response = await getQuickbooksPurchaseOrder(params.id);
  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error getting purchase order: ${response.error}` }] };
  }
  return jsonResult(response.result);
};

export const GetPurchaseOrderTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
