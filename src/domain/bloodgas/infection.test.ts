import { findInfectionPatterns } from "./infection";

describe("infection patterns", () => {
  test("returns no findings with no input", () => {
    expect(findInfectionPatterns({}, false, false)).toEqual([]);
  });

  test.each([
    [50, []],
    [50.1, ["bg_infection_crp_moderate"]],
    [100, ["bg_infection_crp_moderate"]],
    [100.1, ["bg_infection_crp_high"]],
  ])("characterizes CRP threshold at %s", (crp, expected) => {
    expect(findInfectionPatterns({ crp }, false, false)).toEqual(expected);
  });

  test.each([
    [2, []],
    [2.1, ["bg_infection_lactate_elevated"]],
  ])("characterizes infection lactate threshold at %s", (lactate, expected) => {
    expect(findInfectionPatterns({ lactate }, false, false)).toEqual(expected);
  });

  test.each([
    [11, []],
    [11.1, ["bg_infection_stress_hyperglycemia"]],
  ])("characterizes glucose threshold at %s", (glucose, expected) => {
    expect(findInfectionPatterns({ glucose }, false, false)).toEqual(expected);
  });

  test.each([
    [false, false, []],
    [true, false, ["bg_infection_nitrite_only"]],
    [false, true, ["bg_infection_leukocytes_only"]],
    [true, true, ["bg_infection_uti_pattern"]],
  ] as const)("characterizes nitrite=%s leukocytes=%s", (nitrite, leukocytes, expected) => {
    expect(findInfectionPatterns({}, nitrite, leukocytes)).toEqual(expected);
  });

  test("preserves combined findings order", () => {
    expect(
      findInfectionPatterns(
        { crp: 101, lactate: 2.1, glucose: 11.1 },
        true,
        true,
      ),
    ).toEqual([
      "bg_infection_crp_high",
      "bg_infection_lactate_elevated",
      "bg_infection_stress_hyperglycemia",
      "bg_infection_uti_pattern",
    ]);
  });

  test("documents Infinity crossing the existing lactate threshold", () => {
    expect(
      findInfectionPatterns({ crp: NaN, lactate: Infinity, glucose: NaN }, false, false),
    ).toEqual(["bg_infection_lactate_elevated"]);
  });
});
