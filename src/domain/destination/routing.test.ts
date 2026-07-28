import {
  hospitalLabel,
  isKommuneMidt,
  isKommuneNord,
  isKommuneSyd,
  mapByenGeocodeToOfficialBydel,
  mapKommuneByenToOfficialBydel,
  mapPostcodeToBydel,
  mapRegionCityToKommune,
  mapStreetBydelToKommuneByen,
  mapStreetBydelToOfficialBydel,
  norm,
  resolveStreetRoute,
} from "./routing";
import { STREET_SAMPLE } from "../../features/destination/data/byen";

describe("destination helpers", () => {
  test("normalizes casing and surrounding whitespace", () => {
    expect(norm("  VaLbY  ")).toBe("valby");
    expect(norm(null)).toBe("");
  });

  test.each([
    ["2300", "Amager"],
    ["2400", "Bispebjerg"],
    ["2200", "Nørrebro"],
    ["2000", "Frederiksberg"],
    ["2100", "Østerbro"],
    ["2450", "Kgs. Enghave"],
    ["2500", "Valby"],
    ["2720", "Vanløse"],
    ["3700", "Bornholm"],
    ["9999", ""],
  ])("maps postcode %s to %s", (postcode, expected) => {
    expect(mapPostcodeToBydel(postcode)).toBe(expected);
  });

  test.each([
    ["amager ost", "Amager"],
    ["kongens enghave", "Kgs. Enghave"],
    ["indre norrebro", "Nørrebro"],
    ["indre osterbro", "Østerbro"],
    ["unknown district", ""],
  ])("maps street district alias %s to municipality %s", (alias, expected) => {
    expect(mapStreetBydelToKommuneByen(alias)).toBe(expected);
  });

  test.each([
    ["amager ost", "Amager (2300, 2770 og 2791)"],
    ["sydhavnen", "Kgs. Enghave (2450)"],
    ["indre norrebro", "Nørrebro - indre"],
    ["ydre osterbro", "Østerbro - ydre"],
    ["unknown district", ""],
  ])("maps street district alias %s to official district %s", (alias, expected) => {
    expect(mapStreetBydelToOfficialBydel(alias)).toBe(expected);
  });

  test("prefers a recognized geocoder district over postcode fallback", () => {
    expect(
      mapByenGeocodeToOfficialBydel({ district: "Valby", postcode: "2300" }),
    ).toBe("Valby (2500)");
  });

  test("falls back from geocoder fields to postcode mapping", () => {
    expect(mapByenGeocodeToOfficialBydel({ postcode: "2720" })).toBe("Vanløse");
  });

  test.each([
    ["Nørrebro", "Nørrebro - indre"],
    ["Østerbro", "Østerbro - indre"],
    ["Bornholm", ""],
  ])("maps broad municipality %s to current official fallback %s", (area, expected) => {
    expect(mapKommuneByenToOfficialBydel(area as never)).toBe(expected);
  });

  test.each([
    ["Hillerod", undefined, "Hillerød"],
    ["Farum", undefined, "Furesø (Farum)"],
    ["Unknown", "Brondby", "Brøndby"],
    ["Unknown", "Unknown", ""],
  ])("maps region city/subregion text", (city, subregion, expected) => {
    expect(mapRegionCityToKommune(city, subregion)).toBe(expected);
  });

  test("recognizes municipalities only in their declared region", () => {
    expect(isKommuneNord("Hillerød")).toBe(true);
    expect(isKommuneNord("Herlev")).toBe(false);
    expect(isKommuneMidt("Herlev")).toBe(true);
    expect(isKommuneMidt("Hvidovre")).toBe(false);
    expect(isKommuneSyd("Hvidovre")).toBe(true);
    expect(isKommuneSyd("Hillerød")).toBe(false);
  });

  describe("street routing", () => {
    const rows = [
      { street: "Testvej", bydel: "Valby", side: "odd" as const },
      { street: "Testvej", bydel: "Vanløse", side: "even" as const },
    ];

    test("matches street names case-insensitively", () => {
      expect(
        resolveStreetRoute([{ street: "Testvej", bydel: "Valby" }], " testVEJ "),
      ).toEqual({
        status: "single",
        officialBydel: "Valby (2500)",
        message: "",
        matchType: "exact",
      });
    });

    test("routes a known bundled street", () => {
      expect(resolveStreetRoute(STREET_SAMPLE, "Ålekistevej")).toMatchObject({
        status: "single",
        officialBydel: "Vanløse",
      });
    });

    test("requests a side for a split street", () => {
      expect(resolveStreetRoute(rows, "Testvej")).toMatchObject({
        status: "needs_side",
      });
    });

    test.each([
      ["odd", "Valby (2500)"],
      ["even", "Vanløse"],
    ] as const)("uses the %s side", (side, expected) => {
      expect(resolveStreetRoute(rows, "Testvej", side)).toMatchObject({
        status: "single",
        officialBydel: expected,
      });
    });

    test("returns not_found for an unknown street", () => {
      expect(resolveStreetRoute(rows, "Missingvej")).toMatchObject({
        status: "not_found",
      });
    });

    test("characterizes an unmatched requested side as still_ambiguous", () => {
      const oddOnly = [{ street: "Testvej", bydel: "Valby", side: "odd" as const }];
      expect(resolveStreetRoute(oddOnly, "Testvej", "even")).toMatchObject({
        status: "still_ambiguous",
      });
    });

    test("routes explicit house-number ranges", () => {
      const rangedRows = [
        { street: "Rangevej", bydel: "Valby", from: 1, to: 49 },
        { street: "Rangevej", bydel: "Vanløse", from: 50, to: 100 },
      ];
      expect(resolveStreetRoute(rangedRows, "Rangevej")).toMatchObject({
        status: "needs_house_number",
      });
      expect(resolveStreetRoute(rangedRows, "Rangevej", "", 50)).toMatchObject({
        status: "single",
        officialBydel: "Vanløse",
      });
    });

    test.each([
      [1, "Vesterbro"],
      [13, "Vesterbro"],
      [14, "Frederiksberg (post-nr.)"],
      [15, "Frederiksberg (post-nr.)"],
      [101, "Frederiksberg (post-nr.)"],
    ] as const)("routes Frederiksberg Allé %i", (number, expected) => {
      expect(
        resolveStreetRoute(STREET_SAMPLE, "Frederiksberg Allé", "", number),
      ).toMatchObject({ status: "single", officialBydel: expected });
    });

    test.each([
      ["Bellahøjvej", 106, "Brønshøj/Husum"],
      ["Bellahøjvej", 107, "Vanløse"],
      ["Bellahøjvej", 108, "Vanløse"],
      ["Fanøgade", 24, "Østerbro - ydre"],
      ["Fanøgade", 26, "Ryvang øst"],
      ["Fanøgade", 27, "Østerbro - ydre"],
      ["Fanøgade", 29, "Ryvang øst"],
      ["Fuglsang Allé", 134, "Brønshøj/Husum"],
      ["Fuglsang Allé", 135, "Vanløse"],
      ["Fuglsang Allé", 136, "Vanløse"],
      ["Gammel Kongevej", 10, "Indre by"],
      ["Gammel Kongevej", 51, "Vesterbro"],
    ] as const)("routes PDF boundary %s %i", (street, number, expected) => {
      expect(resolveStreetRoute(STREET_SAMPLE, street, "", number)).toMatchObject({
        status: "single",
        officialBydel: expected,
      });
    });

    test("all structured rows have valid non-overlapping bounds", () => {
      for (const row of STREET_SAMPLE) {
        if (row.from !== undefined && row.to !== undefined) {
          expect(row.from).toBeLessThanOrEqual(row.to);
        }
        expect(mapStreetBydelToOfficialBydel(row.bydel)).not.toBe("");
      }
    });
  });

  test("formats combined and translated hospital labels", () => {
    const translate = (key: string) =>
      key === "dest_h_RH" ? "Rigshospitalet" : key;
    expect(hospitalLabel(translate, "RH_GLO")).toBe("GLO/RH");
    expect(hospitalLabel(translate, "RH")).toBe("Rigshospitalet");
    expect(hospitalLabel(translate, "AMH")).toBe("AMH");
  });
});
