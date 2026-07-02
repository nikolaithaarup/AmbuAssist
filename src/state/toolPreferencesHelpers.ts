import { isToolId, type ToolId } from "../navigation/toolRegistry";

export const MAX_RECENT_TOOLS = 8;

export function normalizeToolIds(value: unknown): ToolId[] {
  if (!Array.isArray(value)) return [];

  const result: ToolId[] = [];
  for (const item of value) {
    if (isToolId(item) && !result.includes(item)) result.push(item);
  }
  return result;
}

export function addFavourite(ids: ToolId[], id: ToolId): ToolId[] {
  return ids.includes(id) ? ids : [...ids, id];
}

export function removeFavourite(ids: ToolId[], id: ToolId): ToolId[] {
  return ids.filter((candidate) => candidate !== id);
}

export function recordRecentTool(
  ids: ToolId[],
  id: ToolId,
  maximum = MAX_RECENT_TOOLS,
): ToolId[] {
  return [id, ...ids.filter((candidate) => candidate !== id)].slice(0, maximum);
}
