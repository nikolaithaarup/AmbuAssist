import {
  AGE_RULER_MONTHS,
  WEIGHT_RULER_KG,
  ageRulerLabel,
  canEstimateWeightFromAge,
  formatAgeRulerInput,
  formatWeightRulerInput,
  nearestRulerIndex,
  parseAgeYears,
} from "./ageRuler";

describe("compact age and weight ruler", () => {
  it("uses monthly stops up to 11 months, then annual stops from 1 to 12 years", () => {
    expect(AGE_RULER_MONTHS.slice(0, 13)).toEqual([0,1,2,3,4,5,6,7,8,9,10,11,12]);
    expect(AGE_RULER_MONTHS.slice(13)).toEqual([24,36,48,60,72,84,96,108,120,132,144]);
    expect(new Set(AGE_RULER_MONTHS).size).toBe(AGE_RULER_MONTHS.length);
  });

  it("shows each whole kilogram from 1 to 80, with every fifth as a visual landmark", () => {
    expect(WEIGHT_RULER_KG).toEqual(Array.from({ length: 80 }, (_, index) => index + 1));
    expect(WEIGHT_RULER_KG.every(Number.isInteger)).toBe(true);
    expect(WEIGHT_RULER_KG.filter((value) => value % 5 === 0)).toHaveLength(16);
  });

  it("understands month selections while preserving manual decimal years", () => {
    expect(parseAgeYears("6 mdr")).toBeCloseTo(0.5);
    expect(parseAgeYears("11 mo")).toBeCloseTo(11 / 12);
    expect(parseAgeYears("1,5")).toBe(1.5);
    expect(parseAgeYears("")).toBeNaN();
    expect(parseAgeYears("nonsense")).toBeNaN();
    expect(formatAgeRulerInput(3, "da")).toBe("3 mdr");
    expect(formatAgeRulerInput(24, "da")).toBe("2");
    expect(ageRulerLabel(1, "en")).toBe("1 mo");
    expect(formatWeightRulerInput(3.5)).toBe("3,5");
  });

  it("never estimates age-based weight for infants or beyond 12 years", () => {
    expect(canEstimateWeightFromAge(0)).toBe(false);
    expect(canEstimateWeightFromAge(parseAgeYears("11 mdr"))).toBe(false);
    expect(canEstimateWeightFromAge(parseAgeYears("1"))).toBe(true);
    expect(canEstimateWeightFromAge(parseAgeYears("12"))).toBe(true);
    expect(canEstimateWeightFromAge(parseAgeYears("13"))).toBe(false);
    expect(canEstimateWeightFromAge(NaN)).toBe(false);
  });

  it("can find the nearest visual stop without changing the manually entered value", () => {
    expect(nearestRulerIndex(AGE_RULER_MONTHS, 6)).toBe(6);
    expect(nearestRulerIndex(AGE_RULER_MONTHS, 19)).toBe(13); // nearest is 2 years / 24 months
    expect(nearestRulerIndex(WEIGHT_RULER_KG, 13.2)).toBe(12); // 13 kg on 1-based whole-kg scale
    expect(nearestRulerIndex(AGE_RULER_MONTHS, NaN, 12)).toBe(12);
  });
});
