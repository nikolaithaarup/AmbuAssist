import type { ToolId } from "../navigation/toolRegistry";
import {
  MAX_RECENT_TOOLS,
  addFavourite,
  normalizeToolIds,
  recordRecentTool,
  removeFavourite,
} from "./toolPreferencesHelpers";

describe("tool preference helpers", () => {
  test("normalizes stored IDs by removing unknown values and duplicates", () => {
    expect(normalizeToolIds(["destination", "unknown", "destination", 42, "about"])).toEqual([
      "destination",
      "about",
    ]);
  });

  test("adds and removes favourites without duplicates", () => {
    expect(addFavourite(["destination"], "destination")).toEqual(["destination"]);
    expect(addFavourite(["destination"], "about")).toEqual(["destination", "about"]);
    expect(removeFavourite(["destination", "about"], "destination")).toEqual(["about"]);
  });

  test("moves an opened tool to the front and deduplicates it", () => {
    expect(recordRecentTool(["destination", "about", "contact"], "about")).toEqual([
      "about",
      "destination",
      "contact",
    ]);
  });

  test("keeps at most eight recently used tools", () => {
    const existing: ToolId[] = [
      "destination",
      "weight-joule-dose",
      "thrombolysis",
      "burns",
      "support-numbers",
      "exams",
      "assessment-tools",
      "medical-disclaimer",
    ];
    const result = recordRecentTool(existing, "contact");

    expect(result).toHaveLength(MAX_RECENT_TOOLS);
    expect(result[0]).toBe("contact");
    expect(result).not.toContain("medical-disclaimer");
  });
});
