import type { DoseUnit, MedConfig } from "../../../state/settings";
import type { Translate } from "../types";

const UNITS: DoseUnit[] = ["ug", "mg", "g", "IE"];

export function nextUnit(unit: DoseUnit): DoseUnit {
  const index = UNITS.indexOf(unit);
  return UNITS[(index + 1) % UNITS.length];
}

export function tOr(t: Translate, key: string, fallback: string): string {
  const value = t(key);
  return value === key ? fallback : value;
}

export function newMed(): MedConfig {
  return {
    id: `med_${Math.random().toString(16).slice(2)}`,
    name: "",
    enabled: true,
    dosePerKg: 0.1,
    doseUnit: "mg",
    maxDose: undefined,
    concentration: undefined,
    concUnit: "mg",
  };
}
