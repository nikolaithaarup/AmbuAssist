import { convertDose, toMg, unitToMgFactor } from "./units";

describe("medication unit conversion", () => {
  test.each([
    ["ug", 0.001],
    ["mg", 1],
    ["g", 1000],
  ] as const)("uses the existing %s-to-mg factor", (unit, expected) => {
    expect(unitToMgFactor(unit)).toBe(expected);
  });

  test.each([
    [1000, "ug", 1],
    [1, "mg", 1],
    [1, "g", 1000],
  ] as const)("converts %s %s to %s mg", (value, unit, expected) => {
    expect(toMg(value, unit)).toBe(expected);
  });

  test.each([
    [1000, "ug", "mg", 1],
    [1, "mg", "ug", 1000],
    [1, "g", "mg", 1000],
    [1000, "mg", "g", 1],
  ] as const)("converts between mass units", (value, from, to, expected) => {
    expect(convertDose(value, from, to)).toBe(expected);
  });

  test.each([NaN, Infinity, -Infinity])("rejects non-finite input %s", (value) => {
    expect(toMg(value, "mg")).toBeNaN();
    expect(convertDose(value, "mg", "g")).toBeNaN();
  });

  test("does not convert IE as a mass unit", () => {
    expect(unitToMgFactor("IE")).toBeNaN();
    expect(toMg(1000, "IE")).toBeNaN();
    expect(convertDose(1000, "IE", "mg")).toBeNaN();
    expect(convertDose(1, "mg", "IE")).toBeNaN();
  });
});
