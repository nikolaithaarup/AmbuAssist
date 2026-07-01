import type { BloodGasValues } from "./types";

export type AcidBaseInterpretation = {
  summaryCode: string;
  detailCode: string;
  compensationCode: string;
  severityCode: string;
};

export function interpretAcidBase(
  values: BloodGasValues,
): AcidBaseInterpretation | null {
  const { ph: pH, pco2: pCO2, hco3: HCO3, be: BE } = values;
  if (pH === undefined || pCO2 === undefined || HCO3 === undefined) return null;

  const acidotic = pH < 7.35;
  const alkalotic = pH > 7.45;
  let summaryCode = "";
  let detailCode = "";
  let compensationCode = "";
  let severityCode = "";

  if (acidotic) {
    if (pCO2 > 6 && HCO3 >= 22) {
      summaryCode = "bg_acidbase_resp_acidosis_title";
      detailCode = "bg_acidbase_resp_acidosis_body";
      compensationCode =
        HCO3 > 26 || (BE !== undefined && BE > 2)
          ? "bg_acidbase_comp_metabolic_present"
          : "bg_acidbase_comp_metabolic_limited";
    } else if (HCO3 < 22 || (BE !== undefined && BE < -3)) {
      if (pCO2 > 6) {
        summaryCode = "bg_acidbase_mixed_acidosis_title";
        detailCode = "bg_acidbase_mixed_acidosis_body";
        compensationCode = "bg_acidbase_mixed_compensation";
      } else {
        summaryCode = "bg_acidbase_met_acidosis_title";
        detailCode = "bg_acidbase_met_acidosis_body";
        compensationCode =
          pCO2 < 4.5
            ? "bg_acidbase_comp_respiratory_present"
            : "bg_acidbase_comp_respiratory_limited";
      }
    } else {
      summaryCode = "bg_acidbase_unclear_acidosis_title";
      detailCode = "bg_acidbase_unclear_acidosis_body";
      compensationCode = "bg_acidbase_verify_context";
    }
  } else if (alkalotic) {
    if (pCO2 < 4.5 && HCO3 <= 26) {
      summaryCode = "bg_acidbase_resp_alkalosis_title";
      detailCode = "bg_acidbase_resp_alkalosis_body";
      compensationCode =
        HCO3 < 22 || (BE !== undefined && BE < -3)
          ? "bg_acidbase_comp_metabolic_present"
          : "bg_acidbase_comp_metabolic_limited";
    } else if (HCO3 > 26 || (BE !== undefined && BE > 3)) {
      if (pCO2 < 4.5) {
        summaryCode = "bg_acidbase_mixed_alkalosis_title";
        detailCode = "bg_acidbase_mixed_alkalosis_body";
        compensationCode = "bg_acidbase_mixed_compensation";
      } else {
        summaryCode = "bg_acidbase_met_alkalosis_title";
        detailCode = "bg_acidbase_met_alkalosis_body";
        compensationCode =
          pCO2 > 6
            ? "bg_acidbase_comp_respiratory_present"
            : "bg_acidbase_comp_respiratory_limited";
      }
    } else {
      summaryCode = "bg_acidbase_unclear_alkalosis_title";
      detailCode = "bg_acidbase_unclear_alkalosis_body";
      compensationCode = "bg_acidbase_verify_context";
    }
  } else if (pCO2 > 6 && (HCO3 > 26 || (BE !== undefined && BE > 2))) {
    summaryCode = "bg_acidbase_comp_resp_acidosis_title";
    detailCode = "bg_acidbase_comp_resp_acidosis_body";
    compensationCode = "bg_acidbase_compensated_note";
  } else if (pCO2 < 4.5 && (HCO3 < 22 || (BE !== undefined && BE < -3))) {
    summaryCode = "bg_acidbase_comp_resp_alkalosis_title";
    detailCode = "bg_acidbase_comp_resp_alkalosis_body";
    compensationCode = "bg_acidbase_compensated_note";
  } else {
    summaryCode = "bg_acidbase_near_normal_title";
    detailCode = "bg_acidbase_near_normal_body";
    compensationCode = "bg_acidbase_verify_context";
  }

  if (pH < 7.2) severityCode = "bg_acidbase_severe_acidemia";
  if (pH > 7.55) severityCode = "bg_acidbase_severe_alkalemia";

  return { summaryCode, detailCode, compensationCode, severityCode };
}
