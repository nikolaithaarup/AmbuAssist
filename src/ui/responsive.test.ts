import { getLayoutBand } from "./responsive";

describe("responsive layout bands", () => {
  it.each([
    [320, "compact"],
    [390, "compact"],
    [429, "compact"],
    [430, "standard"],
    [667, "standard"],
    [743, "standard"],
    [744, "expanded"],
    [768, "expanded"],
  ] as const)("maps %ipx to %s", (width, expected) => {
    expect(getLayoutBand(width)).toBe(expected);
  });
});
