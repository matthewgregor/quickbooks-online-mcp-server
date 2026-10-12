import { deleteQuickbooksPurchase } from "../handlers/delete-quickbooks-purchase.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
// Define the tool metadata
const toolName = "delete_purchase";
const toolDescription = "Delete (make inactive) a purchase in QuickBooks Online.";

// Define the expected input schema for deleting a purchase
const toolSchema = z.object({
  idOrEntity: z.any(),
});

type ToolParams = z.infer<typeof toolSchema>;

// Define the tool handler
const toolHandler = async (args: any) => {
  const response = await deleteQuickbooksPurchase(args.params.idOrEntity);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error deleting purchase: ${response.error}` },
      ],
    };
  }

  return jsonResult(response.result);
};

export const DeletePurchaseTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
}; 