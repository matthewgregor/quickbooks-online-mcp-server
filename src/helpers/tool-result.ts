/**
 * Builders for successful tool responses.
 *
 * Every successful tool call returns exactly ONE text content item holding
 * valid JSON, with no human-readable prefix line. MCP clients and gateways
 * that read only `content[0]`, or cap the number of content items, would
 * otherwise receive a label such as "Found 106 invoices" and none of the data.
 */

export interface JsonToolResult {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
}

/** Wrap any JSON-serialisable value as a single text content item. */
export function jsonResult(result: unknown): JsonToolResult {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result ?? null) }],
  };
}

/**
 * Wrap a search result as `{ count, <key>: [...] }`.
 *
 * Search handlers return an array of entities, or a number when the caller
 * asked for `count: true`. A count-only query returns `{ count }`. A few
 * handlers pass the raw `{ QueryResponse: { <Entity>: [...] } }` envelope
 * through, so that is unwrapped here to keep the shape the same everywhere.
 */
export function searchResult(key: string, result: unknown): JsonToolResult {
  const queryResponse = (result as any)?.QueryResponse;
  if (queryResponse && typeof queryResponse === "object") {
    const entities = Object.values(queryResponse).find(Array.isArray);
    if (entities) return searchResult(key, entities);
    if (typeof queryResponse.totalCount === "number") return searchResult(key, queryResponse.totalCount);
    return searchResult(key, []);
  }
  if (Array.isArray(result)) {
    return jsonResult({ count: result.length, [key]: result });
  }
  if (typeof result === "number") {
    return jsonResult({ count: result });
  }
  if (result === null || result === undefined) {
    return jsonResult({ count: 0, [key]: [] });
  }
  return jsonResult(result);
}
