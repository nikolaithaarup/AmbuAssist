import { interpretAcidBase } from "./acidBase";

describe("acid-base interpretation", () => {
  test.each([
    {},
    { ph: 7.4 },
    { ph: 7.4, pco2: 5 },
  ])("returns no result when a required value is missing: %o", (values) => {
    expect(interpretAcidBase(values)).toBeNull();
  });

  test.each([
    [7.35, "bg_acidbase_near_normal_title"],
    [7.45, "bg_acidbase_near_normal_title"],
  ])("treats pH boundary %s as normal-range", (ph, summaryCode) => {
    expect(interpretAcidBase({ ph, pco2: 5, hco3: 24 })).toMatchObject({
      summaryCode,
    });
  });

  test.each([
    [
      { ph: 7.34, pco2: 6.1, hco3: 22 },
      "bg_acidbase_resp_acidosis_title",
      "bg_acidbase_comp_metabolic_limited",
    ],
    [
      { ph: 7.34, pco2: 6.1, hco3: 27 },
      "bg_acidbase_resp_acidosis_title",
      "bg_acidbase_comp_metabolic_present",
    ],
    [
      { ph: 7.34, pco2: 6.1, hco3: 21 },
      "bg_acidbase_mixed_acidosis_title",
      "bg_acidbase_mixed_compensation",
    ],
    [
      { ph: 7.34, pco2: 4.5, hco3: 21 },
      "bg_acidbase_met_acidosis_title",
      "bg_acidbase_comp_respiratory_limited",
    ],
    [
      { ph: 7.34, pco2: 4.4, hco3: 21 },
      "bg_acidbase_met_acidosis_title",
      "bg_acidbase_comp_respiratory_present",
    ],
  ])("preserves acidosis classification for %o", (values, summaryCode, compensationCode) => {
    expect(interpretAcidBase(values)).toMatchObject({ summaryCode, compensationCode });
  });

  test.each([
    [
      { ph: 7.46, pco2: 4.4, hco3: 26 },
      "bg_acidbase_resp_alkalosis_title",
      "bg_acidbase_comp_metabolic_limited",
    ],
    [
      { ph: 7.46, pco2: 4.4, hco3: 21 },
      "bg_acidbase_resp_alkalosis_title",
      "bg_acidbase_comp_metabolic_present",
    ],
    [
      { ph: 7.46, pco2: 4.4, hco3: 27 },
      "bg_acidbase_mixed_alkalosis_title",
      "bg_acidbase_mixed_compensation",
    ],
    [
      { ph: 7.46, pco2: 6, hco3: 27 },
      "bg_acidbase_met_alkalosis_title",
      "bg_acidbase_comp_respiratory_limited",
    ],
    [
      { ph: 7.46, pco2: 6.1, hco3: 27 },
      "bg_acidbase_met_alkalosis_title",
      "bg_acidbase_comp_respiratory_present",
    ],
  ])("preserves alkalosis classification for %o", (values, summaryCode, compensationCode) => {
    expect(interpretAcidBase(values)).toMatchObject({ summaryCode, compensationCode });
  });

  test.each([
    [{ ph: 7.4, pco2: 6.1, hco3: 27 }, "bg_acidbase_comp_resp_acidosis_title"],
    [{ ph: 7.4, pco2: 4.4, hco3: 21 }, "bg_acidbase_comp_resp_alkalosis_title"],
    [{ ph: 7.4, pco2: 5, hco3: 24 }, "bg_acidbase_near_normal_title"],
  ])("preserves normal-range compensation result for %o", (values, summaryCode) => {
    expect(interpretAcidBase(values)).toMatchObject({ summaryCode });
  });

  test.each([
    [7.2, ""],
    [7.19, "bg_acidbase_severe_acidemia"],
    [7.55, ""],
    [7.56, "bg_acidbase_severe_alkalemia"],
  ])("preserves strict severity threshold at pH %s", (ph, severityCode) => {
    expect(interpretAcidBase({ ph, pco2: 5, hco3: 24 })).toMatchObject({
      severityCode,
    });
  });

  test("documents non-finite required values falling through to near-normal", () => {
    expect(interpretAcidBase({ ph: NaN, pco2: NaN, hco3: NaN })).toMatchObject({
      summaryCode: "bg_acidbase_near_normal_title",
    });
  });
});
