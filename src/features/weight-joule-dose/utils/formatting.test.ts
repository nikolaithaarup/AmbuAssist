import {
  fmtInt,
  fmtNum,
  fmtSmartDose,
  fmtSmartMl,
  trimTrailingZeros,
  unitLabel,
} from "./formatting";

describe("weight/joule/dose formatting", () => {
  test.each([
    [1.4, "1"],
    [1.5, "2"],
    [NaN, "—"],
  ])("formats integer display value %s", (value, expected) => {
    expect(fmtInt(value)).toBe(expected);
  });

  test("uses a decimal comma and trims fixed-point zeros", () => {
    expect(fmtNum("1.25")).toBe("1,25");
    expect(trimTrailingZeros("1.2500")).toBe("1.25");
  });

  test.each([
    [NaN, "—"],
    [0, "0"],
    [2.4, "2"],
    [0.25, "0,3"],
    [0.004, "0,004"],
  ])("preserves smart dose formatting for %s", (value, expected) => {
    expect(fmtSmartDose(value)).toBe(expected);
  });

  test.each([
    [NaN, "—"],
    [0, "0"],
    [2, "2"],
    [2.25, "2,3"],
    [0.25, "0,25"],
    [0.025, "0,025"],
  ])("preserves smart volume formatting for %s", (value, expected) => {
    expect(fmtSmartMl(value)).toBe(expected);
  });

  test("localizes only the IE display label", () => {
    expect(unitLabel("IE", "en")).toBe("IU");
    expect(unitLabel("IE", "da")).toBe("IE");
    expect(unitLabel("mg", "en")).toBe("mg");
  });
});
