import { parseNumber } from "./helpers";

describe("parseNumber", () => {
  it("parses a decimal comma", () => {
    expect(parseNumber("7,4")).toBe(7.4);
  });
});
