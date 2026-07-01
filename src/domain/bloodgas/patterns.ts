import type { BloodGasValues } from "./types";

export function findBloodGasPatterns(values: BloodGasValues): string[] {
  const findings: string[] = [];
  const { ph, pco2, po2, hco3, be, so2, na, glucose, lactate, urea, creatinine } = values;
  if (!Object.values(values).some((value) => value !== undefined)) return findings;

  if (ph !== undefined && hco3 !== undefined && glucose !== undefined && ph < 7.3 && hco3 < 18 && glucose > 11) findings.push("bg_pattern_dka");
  if (glucose !== undefined && glucose > 30 && (ph === undefined || ph >= 7.3) && (hco3 === undefined || hco3 >= 18)) findings.push("bg_pattern_hhs");
  if (lactate !== undefined && lactate > 2) findings.push("bg_pattern_lactate_elevated");
  if (lactate !== undefined && lactate > 4) findings.push("bg_pattern_lactate_high");
  if (lactate !== undefined && glucose !== undefined && lactate > 2 && glucose > 7 && (ph === undefined || ph >= 7.35)) findings.push("bg_pattern_dehydration");
  if (ph !== undefined && pco2 !== undefined && ph < 7.35 && pco2 > 6) findings.push("bg_pattern_respiratory_acidosis");
  if (ph !== undefined && hco3 !== undefined && (hco3 < 22 || (be !== undefined && be < -3)) && ph < 7.35) findings.push("bg_pattern_metabolic_acidosis");
  if (na !== undefined && na < 130) findings.push("bg_pattern_hyponatremia");
  if (po2 !== undefined && po2 < 8) findings.push("bg_pattern_hypoxemia");
  if (so2 !== undefined && so2 < 90) findings.push("bg_pattern_low_so2");
  if (creatinine !== undefined && creatinine > 110 && urea !== undefined && urea > 8) findings.push("bg_pattern_renal_impairment");

  return findings;
}
