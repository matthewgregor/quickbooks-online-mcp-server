import { getQuickbooksDepartment } from "../handlers/get-quickbooks-department.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

import { jsonResult } from "../helpers/tool-result.js";
const toolName = "get_department";
const toolDescription = "Retrieve a specific department from QuickBooks Online by ID.";
const toolSchema = z.object({
  id: z.string().min(1).describe("Department ID"),
});

const toolHandler = async ({ params }: any) => {
  const response = await getQuickbooksDepartment(params.id);
  if (response.isError) return { content: [{ type: "text" as const, text: `Error: ${response.error}` }] };
  return jsonResult(response.result);
};

export const GetDepartmentTool: ToolDefinition<typeof toolSchema> = { name: toolName, description: toolDescription, schema: toolSchema, handler: toolHandler };
