import { toNum } from "./parsing";

/** A visual scale, not an age-based weight formula. */
export const AGE_RULER_MONTHS: readonly number[] = [
  ...Array.from({ length: 12 }, (_, month) => month),
  ...Array.from({ length: 12 }, (_, year) => (year + 1) * 12),
];

/** Finer control for small children; manual input remains available for exact kg. */
export const WEIGHT_RULER_KG: readonly number[] = [
  ...Array.from({ length: 40 }, (_, index) => (index + 1) / 2),
  ...Array.from({ length: 30 }, (_, index) => index + 21),
  ...Array.from({ length: 15 }, (_, index) => (index + 26) * 2),
];

export function parseAgeYears(input: string): number {
  const value = String(input ?? "").trim();
  const months = value.match(/^(\d+(?:[,.]\d+)?)\s*(?:mdr?\.?|måneder|maaneder|mo\.?|months?)$/iu);
  if (months) return toNum(months[1]) / 12;
  return toNum(value);
}

/** Only offer the local (age × 2) + 8 estimate for children aged 1–12 years. */
export function canEstimateWeightFromAge(ageYears: number): boolean {
  return Number.isFinite(ageYears) && ageYears >= 1 && ageYears <= 12;
}

export function nearestRulerIndex(values: readonly number[], target: number, fallback = 0): number {
  if (!Number.isFinite(target) || values.length === 0) {
    return Math.max(0, Math.min(fallback, values.length - 1));
  }
  let nearest = 0;
  for (let index = 1; index < values.length; index++) {
    if (Math.abs(values[index] - target) < Math.abs(values[nearest] - target)) nearest = index;
  }
  return nearest;
}

export function formatAgeRulerInput(months: number, language: "da" | "en"): string {
  if (months < 12) return `${months} ${language === "da" ? "mdr" : "mo"}`;
  return String(months / 12);
}

export function ageRulerLabel(months: number, language: "da" | "en"): string {
  if (months < 12) return `${months} ${language === "da" ? "mdr" : "mo"}`;
  return `${months / 12} ${language === "da" ? "år" : (months === 12 ? "yr" : "yrs")}`;
}

export function formatWeightRulerInput(kg: number): string {
  return String(kg).replace(".", ",");
}
