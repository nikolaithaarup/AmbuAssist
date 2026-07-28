import { normalizeStreetName, parseHouseNumber, parseStreetName } from "./address";

describe("Danish address parsing", () => {
  test.each([
    [" Nørre   Voldgade ", "nørre voldgade"],
    ["Frederiksberg Allé (Nr. 1–13B)", "frederiksberg allé"],
    ["Frederik V’s Vej", "frederik v's vej"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeStreetName(input)).toBe(expected);
  });

  test("extracts a number and suffix", () => {
    expect(parseHouseNumber("Frederiksberg Allé 13B, 1621 København V")).toEqual({
      number: 13,
      suffix: "B",
    });
  });

  test("falls back to a formatted address when street is missing", () => {
    expect(parseStreetName(undefined, "Nørre Voldgade 12, 1358 København K")).toBe(
      "Nørre Voldgade",
    );
  });
});

