import {
  normalizeStreetName,
  parseHouseNumber,
  parseReverseGeocodedHouseNumber,
  parseStreetName,
} from "./address";

describe("Danish address parsing", () => {
  test.each([
    [" Nørre   Voldgade ", "nørre voldgade"],
    ["Frederiksberg Allé (Nr. 1–13B)", "frederiksberg allé"],
    ["Frederik V’s Vej", "frederik v's vej"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeStreetName(input)).toBe(expected);
  });

  test.each(["13A", "13B"])("extracts number and suffix from %s", (house) => {
    expect(parseHouseNumber(`Frederiksberg Allé ${house}, 1621 København V`)).toEqual({
      number: 13,
      suffix: house.slice(-1),
    });
  });

  test("falls back to a formatted address when street is missing", () => {
    expect(parseStreetName(undefined, "Nørre Voldgade 12, 1358 København K")).toBe(
      "Nørre Voldgade",
    );
  });

  test("uses Expo streetNumber as the primary reverse-geocoder source and preserves suffixes", () => {
    expect(
      parseReverseGeocodedHouseNumber({
        street: "Frederiksberg Allé",
        streetNumber: "13A",
        name: "Frederiksberg Allé",
        formattedAddress: null,
      }),
    ).toEqual({ number: 13, suffix: "A" });
    expect(
      parseReverseGeocodedHouseNumber({
        street: "Testvej",
        streetNumber: "22B",
        name: "Testvej 999",
        formattedAddress: "Testvej 999, 2300 København S",
      }),
    ).toEqual({ number: 22, suffix: "B" });
  });

  test("does not interpret a postcode-only formatted-address segment as a house number", () => {
    expect(parseHouseNumber("Frederiksberg Allé, 1621 København V")).toEqual({});
    expect(
      parseReverseGeocodedHouseNumber({
        street: "Frederiksberg Allé",
        streetNumber: null,
        formattedAddress: "Frederiksberg Allé, 1621 København V",
      }),
    ).toEqual({});
  });

  test("accepts a legitimate house number in an Android formatted-address street segment", () => {
    expect(
      parseReverseGeocodedHouseNumber({
        street: "Frederiksberg Allé",
        streetNumber: null,
        formattedAddress: "Frederiksberg Allé 13A, 1621 København V",
      }),
    ).toEqual({ number: 13, suffix: "A" });
  });

  test("does not use placemark or intersection-style names as house-number evidence", () => {
    expect(
      parseReverseGeocodedHouseNumber({
        street: "Frederiksberg Allé",
        streetNumber: null,
        name: "7-Eleven ved Frederiksberg Allé 13",
        formattedAddress: null,
      }),
    ).toEqual({});
  });
});
