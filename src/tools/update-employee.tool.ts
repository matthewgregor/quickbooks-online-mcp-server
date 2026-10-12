import { updateQuickbooksEmployee } from "../handlers/update-quickbooks-employee.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
// Define the tool metadata
const toolName = "update_employee";
const toolDescription = "Update an employee in QuickBooks Online.";

// Define the expected input schema for updating an employee
const toolSchema = z.object({
  employee: z.any(),
});

type ToolParams = z.infer<typeof toolSchema>;

// Define the tool handler
const toolHandler = async (args: any) => {
  const response = await updateQuickbooksEmployee(args.params.employee);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error updating employee: ${response.error}` },
      ],
    };
  }

  return jsonResult(response.result);
};

export const UpdateEmployeeTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
}; 