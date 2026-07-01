import { findBloodGasPatterns } from "./patterns";

describe("blood-gas patterns", () => {
  test("returns no findings for missing or non-finite-only values", () => {
    expect(findBloodGasPatterns({})).toEqual([]);
    expect(findBloodGasPatterns({ ph: NaN, lactate: NaN })).toEqual([]);
  });

  test("documents Infinity crossing the existing lactate thresholds", () => {
    expect(findBloodGasPatterns({ lactate: Infinity })).toEqual([
      "bg_pattern_lactate_elevated",
      "bg_pattern_lactate_high",
    ]);
  });

  test.each([
    [
      { ph: 7.29, hco3: 17, glucose: 12 },
      ["bg_pattern_dka", "bg_pattern_metabolic_acidosis"],
    ],
    [{ ph: 7.3, hco3: 17, glucose: 12 }, ["bg_pattern_metabolic_acidosis"]],
    [{ ph: 7.29, hco3: 18, glucose: 12 }, ["bg_pattern_metabolic_acidosis"]],
    [{ ph: 7.29, hco3: 17, glucose: 11 }, ["bg_pattern_metabolic_acidosis"]],
    [
      { ph: 7.3, hco3: 18, glucose: 30.1 },
      ["bg_pattern_hhs", "bg_pattern_metabolic_acidosis"],
    ],
  ])("characterizes DKA/HHS thresholds for %o", (values, expected) => {
    expect(findBloodGasPatterns(values)).toEqual(expected);
  });

  test.each([
    [2, []],
    [2.1, ["bg_pattern_lactate_elevated"]],
    [4, ["bg_pattern_lactate_elevated"]],
    [4.1, ["bg_pattern_lactate_elevated", "bg_pattern_lactate_high"]],
  ])("characterizes lactate %s", (lactate, expected) => {
    expect(findBloodGasPatterns({ lactate })).toEqual(expected);
  });

  test.each([
    [{ ph: 7.34, pco2: 6.1 }, ["bg_pattern_respiratory_acidosis"]],
    [{ ph: 7.35, pco2: 6.1 }, []],
    [{ ph: 7.34, pco2: 6 }, []],
    [{ ph: 7.34, hco3: 21 }, ["bg_pattern_metabolic_acidosis"]],
    [{ ph: 7.34, hco3: 22, be: -3.1 }, ["bg_pattern_metabolic_acidosis"]],
    [{ ph: 7.35, hco3: 21 }, []],
  ])("characterizes CO2/HCO3 pattern boundaries for %o", (values, expected) => {
    expect(findBloodGasPatterns(values)).toEqual(expected);
  });

  test("preserves combined finding order", () => {
    expect(
      findBloodGasPatterns({
        ph: 7.29,
        pco2: 6.1,
        po2: 7.9,
        hco3: 17,
        be: -4,
        so2: 89,
        na: 129,
        glucose: 12,
        lactate: 4.1,
        urea: 8.1,
        creatinine: 111,
      }),
    ).toEqual([
      "bg_pattern_dka",
      "bg_pattern_lactate_elevated",
      "bg_pattern_lactate_high",
      "bg_pattern_respiratory_acidosis",
      "bg_pattern_metabolic_acidosis",
      "bg_pattern_hyponatremia",
      "bg_pattern_hypoxemia",
      "bg_pattern_low_so2",
      "bg_pattern_renal_impairment",
    ]);
  });
});
