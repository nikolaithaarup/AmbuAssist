import { toNum } from "./parsing";

describe("weight/joule/dose parsing", () => {
  test.each([
    ["1", 1],
    ["1,5", 1.5],
    ["1.5", 1.5],
    [" 1 000,5 ", 1000.5],
    ["-2,5", -2.5],
  ])("parses %p as %s", (input, expected) => {
    expect(toNum(input)).toBe(expected);
  });

  test.each(["", "   ", "not-a-number", "Infinity", "1,2,3"])(
    "returns NaN for %p",
    (input) => {
      expect(toNum(input)).toBeNaN();
    },
  );
});
