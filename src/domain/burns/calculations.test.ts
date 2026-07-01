import {
  calculateBurnFluids,
  calculateTbsa,
  getBurnZones,
  isBurnFluidRelevant,
} from "./calculations";
import {
  ADULT_FLUID_THRESHOLD_PERCENT,
  CHILD_FLUID_THRESHOLD_PERCENT,
  MODIFIED_PARKLAND_ML_PER_KG_PERCENT,
} from "./constants";

describe("burn calculations", () => {
  describe("TBSA", () => {
    test.each([
      ["adult", ["head"], 9],
      ["child", ["head"], 18],
      ["adult", ["head", "leftArm", "rightArm", "perineum"], 28],
      ["child", ["head", "leftLeg", "rightLeg"], 46],
    ] as const)("sums selected %s zones", (ageGroup, zoneIds, expected) => {
      expect(calculateTbsa(ageGroup, [...zoneIds])).toBe(expected);
    });

    test.each(["adult", "child"] as const)(
      "sums the full %s zone table to 100 percent",
      (ageGroup) => {
        const allZoneIds = getBurnZones(ageGroup).map((zone) => zone.id);
        expect(calculateTbsa(ageGroup, allZoneIds)).toBe(100);
      },
    );

    test("ignores unknown and duplicate selected IDs", () => {
      expect(calculateTbsa("adult", ["head", "head", "unknown"])).toBe(9);
    });

    test.each(["adult", "child"] as const)(
      "returns zero for no selected %s zones",
      (ageGroup) => {
        expect(calculateTbsa(ageGroup, [])).toBe(0);
      },
    );
  });

  describe("fluid thresholds", () => {
    test("preserves the configured threshold constants", () => {
      expect(ADULT_FLUID_THRESHOLD_PERCENT).toBe(20);
      expect(CHILD_FLUID_THRESHOLD_PERCENT).toBe(10);
      expect(MODIFIED_PARKLAND_ML_PER_KG_PERCENT).toBe(3);
    });

    test.each([
      ["adult", 19.9, false],
      ["adult", 20, true],
      ["adult", 20.1, true],
      ["child", 9.9, false],
      ["child", 10, true],
      ["child", 10.1, true],
    ] as const)(
      "evaluates the %s threshold at %s percent",
      (ageGroup, tbsa, expected) => {
        expect(isBurnFluidRelevant(ageGroup, tbsa)).toBe(expected);
      },
    );
  });

  describe("modified Parkland fluids", () => {
    test.each([
      [70, 20, 4200, 2100, 2100, 262.5, 131.25],
      [10, 10, 300, 150, 150, 18.75, 9.375],
      [80, 12.5, 3000, 1500, 1500, 187.5, 93.75],
    ])(
      "calculates fluids for %s kg and %s percent TBSA",
      (
        weight,
        tbsa,
        total,
        firstEight,
        nextSixteen,
        firstRate,
        laterRate,
      ) => {
        expect(calculateBurnFluids(weight, tbsa)).toEqual({
          modifiedParklandTotal: total,
          firstEightHours: firstEight,
          nextSixteenHours: nextSixteen,
          firstHourRate: firstRate,
          laterHourRate: laterRate,
        });
      },
    );

    test.each([
      [0, 20],
      [-1, 20],
      [70, 0],
      [70, -1],
      [NaN, 20],
      [70, NaN],
    ])("returns zero outputs for invalid or zero inputs", (weight, tbsa) => {
      expect(calculateBurnFluids(weight, tbsa)).toEqual({
        modifiedParklandTotal: 0,
        firstEightHours: 0,
        nextSixteenHours: 0,
        firstHourRate: 0,
        laterHourRate: 0,
      });
    });
  });
});
