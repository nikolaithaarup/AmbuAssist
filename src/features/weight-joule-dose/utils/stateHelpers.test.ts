import { nextUnit, tOr } from "./stateHelpers";

describe("weight/joule/dose state helpers", () => {
  test.each([
    ["ug", "mg"],
    ["mg", "g"],
    ["g", "IE"],
    ["IE", "ug"],
  ] as const)("cycles %s to %s", (unit, expected) => {
    expect(nextUnit(unit)).toBe(expected);
  });

  test("uses translated text or the existing fallback", () => {
    expect(tOr((key) => (key === "known" ? "Translated" : key), "known", "Fallback")).toBe("Translated");
    expect(tOr((key) => key, "missing", "Fallback")).toBe("Fallback");
  });
});
