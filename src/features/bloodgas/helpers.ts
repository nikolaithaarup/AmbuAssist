import type { BloodGasFormValues, ParsedBloodGasValues } from "./types";
import { VGAS_FIELDS } from "./fieldConfig";

export function parseNumber(value: string): number | undefined {
  const normalized = String(value).trim().replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return undefined;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

export type FieldValidation = "empty" | "invalid" | "implausible" | "valid";

export function validateBloodGasField(key: keyof BloodGasFormValues, raw: string): FieldValidation {
  if (!raw.trim()) return "empty";
  const value = parseNumber(raw);
  if (value === undefined) return "invalid";
  const { min, max } = VGAS_FIELDS[key].plausible;
  return value < min || value > max ? "implausible" : "valid";
}

export function makeEmptyBloodGasFormValues(): BloodGasFormValues {
  return {
    ph: "",
    pco2: "",
    po2: "",
    hco3: "",
    be: "",
    so2: "",

    na: "",
    k: "",
    ca: "",
    cl: "",

    glucose: "",
    lactate: "",
    urea: "",
    creatinine: "",

    hct: "",
    hgb: "",

    crp: "",
  };
}

export function parseBloodGasFormValues(
  values: BloodGasFormValues,
): ParsedBloodGasValues {
  const safe = (key: keyof BloodGasFormValues) =>
    validateBloodGasField(key, values[key]) === "valid" ? parseNumber(values[key]) : undefined;
  return {
    ph: safe("ph"), pco2: safe("pco2"), po2: safe("po2"), hco3: safe("hco3"), be: safe("be"), so2: safe("so2"),

    na: safe("na"), k: safe("k"), ca: safe("ca"), cl: safe("cl"),

    glucose: safe("glucose"), lactate: safe("lactate"), urea: safe("urea"), creatinine: safe("creatinine"),

    hct: safe("hct"), hgb: safe("hgb"),

    crp: safe("crp"),
  };
}
