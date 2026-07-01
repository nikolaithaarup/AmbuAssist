import type { BloodGasValues } from "./types";

export function findInfectionPatterns(
  values: BloodGasValues,
  nitrite: boolean,
  leukocytes: boolean,
): string[] {
  const findings: string[] = [];
  const { crp, lactate, glucose } = values;
  const hasAnyInput = crp !== undefined || lactate !== undefined || glucose !== undefined || nitrite || leukocytes;
  if (!hasAnyInput) return findings;

  if (crp !== undefined) {
    if (crp > 100) findings.push("bg_infection_crp_high");
    else if (crp > 50) findings.push("bg_infection_crp_moderate");
  }
  if (lactate !== undefined && lactate > 2) findings.push("bg_infection_lactate_elevated");
  if (glucose !== undefined && glucose > 11) findings.push("bg_infection_stress_hyperglycemia");
  if (nitrite && leukocytes) findings.push("bg_infection_uti_pattern");
  else if (leukocytes) findings.push("bg_infection_leukocytes_only");
  else if (nitrite) findings.push("bg_infection_nitrite_only");

  return findings;
}
