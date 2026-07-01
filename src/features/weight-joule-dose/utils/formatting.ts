import type { DoseUnit } from "../../../state/settings";

export function fmtInt(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return String(Math.round(value));
}

export function fmtNum(value: number | string): string {
  return String(value).replace(".", ",");
}

export function trimTrailingZeros(value: string): string {
  return value.replace(/\.?0+$/, "");
}

export function fmtSmartDose(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  if (Math.round(Math.abs(value)) >= 1) return String(Math.round(value));

  for (let decimals = 1; decimals <= 4; decimals++) {
    const rounded = Number(value.toFixed(decimals));
    if (rounded !== 0) return fmtNum(trimTrailingZeros(rounded.toFixed(decimals)));
  }
  return fmtNum(value.toFixed(4));
}

export function fmtSmartMl(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (Number.isInteger(value)) return String(value);
  if (abs >= 1) return fmtNum(trimTrailingZeros(value.toFixed(1)));
  if (abs >= 0.1) return fmtNum(trimTrailingZeros(value.toFixed(2)));
  return fmtNum(trimTrailingZeros(value.toFixed(3)));
}

export function unitLabel(unit: DoseUnit, language: "en" | "da"): string {
  if (unit === "IE") return language === "en" ? "IU" : "IE";
  return unit;
}
