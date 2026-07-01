import { BYEN_MAP, STREET_SAMPLE } from "../../features/destination/data/byen";
import { REGION_BYEN_MAP } from "../../features/destination/data/regionByen";
import { REGION_MIDT_MAP } from "../../features/destination/data/regionMidt";
import { REGION_NORD_MAP } from "../../features/destination/data/regionNord";
import { REGION_SYD_MAP } from "../../features/destination/data/regionSyd";
import { resolveHospitalCode } from "./resolution";
import type { HospitalCode } from "./types";

describe("destination hospital resolution", () => {
  test("resolves a known Byen district and category", () => {
    expect(
      resolveHospitalCode({
        area: "byen",
        bydel: "Amager (2300, 2770 og 2791)",
        category: "hospital",
        map: BYEN_MAP,
      }),
    ).toBe("AMH");
  });

  test("preserves an explicit UNKNOWN assignment", () => {
    expect(
      resolveHospitalCode({
        area: "byen",
        bydel: "Amager (2300, 2770 og 2791)",
        category: "uro",
        map: BYEN_MAP,
      }),
    ).toBe("UNKNOWN");
  });

  test("resolves a known regional municipality and category", () => {
    expect(
      resolveHospitalCode({
        area: "region",
        kommune: "Hillerød",
        category: "akutmodtagelse",
        map: REGION_NORD_MAP,
      }),
    ).toBe("NOH");
  });

  test("returns null until the required area selection exists", () => {
    expect(
      resolveHospitalCode({
        area: "byen",
        bydel: "",
        category: "hospital",
        map: BYEN_MAP,
      }),
    ).toBeNull();
    expect(
      resolveHospitalCode({
        area: "region",
        kommune: "",
        category: "akutmodtagelse",
        map: REGION_NORD_MAP,
      }),
    ).toBeNull();
  });

  test("keeps unsupported entries in partial regional maps explicit", () => {
    expect(
      resolveHospitalCode({
        area: "region",
        kommune: "Amager",
        category: "akutmodtagelse",
        map: REGION_BYEN_MAP,
      }),
    ).toBe("UNKNOWN");
  });

  test("falls back to UNKNOWN when a category is absent", () => {
    expect(
      resolveHospitalCode({
        area: "byen",
        bydel: "Bispebjerg",
        category: "uro",
        map: { Bispebjerg: { hospital: "BBH" } },
      }),
    ).toBe("UNKNOWN");
  });
});

describe("bundled destination data integrity", () => {
  const knownCodes = new Set<HospitalCode>([
    "AMH", "BBH", "BOH", "FRH", "GEH", "GLO", "HEH", "HVH", "NOH",
    "NOH_F", "RH", "UNKNOWN", "GLO_RH", "RH_GLO", "HEH_GEH", "AMH_HVH",
    "HGH_RH", "GLO_NOH", "BBH_FRH", "RH_BBH", "BBH_RH", "BOH_RH",
  ]);

  test("all bundled category assignments use a known code or UNKNOWN", () => {
    const regionMap = {
      ...REGION_NORD_MAP,
      ...REGION_MIDT_MAP,
      ...REGION_SYD_MAP,
      ...REGION_BYEN_MAP,
    };
    const assignments = [
      ...Object.values(BYEN_MAP).flatMap((categories) => Object.values(categories)),
      ...Object.values(regionMap).flatMap((categories) =>
        Object.values(categories ?? {}),
      ),
    ];

    expect(assignments.length).toBeGreaterThan(0);
    for (const code of assignments) expect(knownCodes.has(code)).toBe(true);
  });

  test("every bundled street row points to a district with explicit assignments", () => {
    expect(STREET_SAMPLE.length).toBeGreaterThan(0);
    for (const row of STREET_SAMPLE) {
      const assignments = BYEN_MAP[row.bydel];
      expect(assignments).toBeDefined();
      for (const code of Object.values(assignments)) {
        expect(knownCodes.has(code)).toBe(true);
      }
    }
  });
});
