export type DoseUnit = "ug" | "mg" | "g" | "IE";

// IE is not a mass unit, so it must not be converted to or from milligrams.
export function unitToMgFactor(unit: DoseUnit): number {
  switch (unit) {
    case "ug": return 0.001;
    case "mg": return 1;
    case "g": return 1000;
    case "IE": return NaN;
  }
}

export function toMg(value: number, unit: DoseUnit): number {
  if (!Number.isFinite(value)) return NaN;
  const factor = unitToMgFactor(unit);
  if (!Number.isFinite(factor)) return NaN;
  return value * factor;
}

export function convertDose(value: number, from: DoseUnit, to: DoseUnit): number {
  if (!Number.isFinite(value)) return NaN;
  const fromFactor = unitToMgFactor(from);
  const toFactor = unitToMgFactor(to);
  if (!Number.isFinite(fromFactor) || !Number.isFinite(toFactor)) return NaN;
  const milligrams = value * fromFactor;
  return milligrams / toFactor;
}
