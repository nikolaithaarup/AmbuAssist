import { toMg, unitToMgFactor, type DoseUnit } from "./units";

export type MedicationCalculationInput = {
  weightKg: number;
  dosePerKg: number;
  doseUnit: DoseUnit;
  maxDose: number;
  concentration: number;
  concUnit: DoseUnit;
};

export type MedicationCalculationResult = {
  rawDoseDisplay: number;
  finalDoseDisplay: number;
  capped: boolean;
  ml: number;
};

function fromMg(valueMg: number, unit: DoseUnit): number {
  if (!Number.isFinite(valueMg)) return NaN;
  const factor = unitToMgFactor(unit);
  if (!Number.isFinite(factor) || factor <= 0) return NaN;
  return valueMg / factor;
}

export function calculateMedicationDose({
  weightKg,
  dosePerKg,
  doseUnit,
  maxDose,
  concentration,
  concUnit,
}: MedicationCalculationInput): MedicationCalculationResult {
  let rawDoseDisplay = NaN;
  let finalDoseDisplay = NaN;
  let capped = false;
  let ml = NaN;

  if (doseUnit === "IE") {
    const rawIE =
      Number.isFinite(weightKg) && Number.isFinite(dosePerKg)
        ? weightKg * dosePerKg
        : NaN;
    const hasMax = Number.isFinite(maxDose) && maxDose > 0;
    const finalIE =
      Number.isFinite(rawIE) && hasMax ? Math.min(rawIE, maxDose) : rawIE;

    capped = Number.isFinite(rawIE) && hasMax ? rawIE > maxDose : false;
    rawDoseDisplay = rawIE;
    finalDoseDisplay = finalIE;

    if (
      Number.isFinite(finalIE) &&
      Number.isFinite(concentration) &&
      concentration > 0 &&
      concUnit === "IE"
    ) {
      ml = finalIE / concentration;
    }
  } else {
    const rawDoseMg =
      Number.isFinite(weightKg) && Number.isFinite(dosePerKg)
        ? toMg(weightKg * dosePerKg, doseUnit)
        : NaN;
    const hasMax = Number.isFinite(maxDose) && maxDose > 0;
    const maxMg = hasMax ? toMg(maxDose, doseUnit) : NaN;
    const finalDoseMg =
      Number.isFinite(rawDoseMg) && hasMax
        ? Math.min(rawDoseMg, maxMg)
        : rawDoseMg;

    capped = Number.isFinite(rawDoseMg) && hasMax ? rawDoseMg > maxMg : false;

    const concMgPerMl =
      Number.isFinite(concentration) && concentration > 0
        ? toMg(concentration, concUnit)
        : NaN;
    ml =
      Number.isFinite(finalDoseMg) &&
      Number.isFinite(concMgPerMl) &&
      concMgPerMl > 0
        ? finalDoseMg / concMgPerMl
        : NaN;

    rawDoseDisplay = fromMg(rawDoseMg, doseUnit);
    finalDoseDisplay = fromMg(finalDoseMg, doseUnit);
  }

  return { rawDoseDisplay, finalDoseDisplay, capped, ml };
}
