import { deleteQuickbooksBill } from "../handlers/delete-quickbooks-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "delete-bill";
const toolDescription = "Delete a bill in QuickBooks Online.";
const toolSchema = z.object({
  bill: z.object({
    Id: z.string(),
    SyncToken: z.string(),
  }),
});

const toolHandler = async (args: { [x: string]: any }) => {
  const response = await deleteQuickbooksBill(args.params.bill);

  if (response.isError) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error deleting bill: ${response.error}`,
        },
      ],
    };
  }

  const bill = response.result;

  return jsonResult(bill);
};

export const DeleteBillTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
}; 