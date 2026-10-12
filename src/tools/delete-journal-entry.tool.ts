import { deleteQuickbooksJournalEntry } from "../handlers/delete-quickbooks-journal-entry.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
// Define the tool metadata
const toolName = "delete_journal_entry";
const toolDescription = "Delete (make inactive) a journal entry in QuickBooks Online.";

// Define the expected input schema for deleting a journal entry
const toolSchema = z.object({
  idOrEntity: z.any(),
});

type ToolParams = z.infer<typeof toolSchema>;

// Define the tool handler
const toolHandler = async (args: any) => {
  const response = await deleteQuickbooksJournalEntry(args.params.idOrEntity);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error deleting journal entry: ${response.error}` },
      ],
    };
  }

  return jsonResult(response.result);
};

export const DeleteJournalEntryTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
}; 