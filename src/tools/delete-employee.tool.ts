import { deleteQuickbooksEmployee } from "../handlers/delete-quickbooks-employee.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "delete_employee";
const toolDescription = "Delete (make inactive) an employee in QuickBooks Online.";
const toolSchema = z.object({ idOrEntity: z.any() });

const toolHandler = async (args: any) => {
  const response = await deleteQuickbooksEmployee(args.params.idOrEntity);

  if (response.isError) {
    return { content: [{ type: "text" as const, text: `Error deleting employee: ${response.error}` }] };
  }

  return jsonResult(response.result);
};

export const DeleteEmployeeTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: toolHandler,
};
