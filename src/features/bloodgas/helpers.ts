import type { BloodGasFormValues, ParsedBloodGasValues } from "./types";

export function parseNumber(value: string): number | undefined {
  const n = parseFloat(String(value).replace(",", ".").trim());
  return Number.isNaN(n) ? undefined : n;
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
  return {
    ph: parseNumber(values.ph),
    pco2: parseNumber(values.pco2),
    po2: parseNumber(values.po2),
    hco3: parseNumber(values.hco3),
    be: parseNumber(values.be),
    so2: parseNumber(values.so2),

    na: parseNumber(values.na),
    k: parseNumber(values.k),
    ca: parseNumber(values.ca),
    cl: parseNumber(values.cl),

    glucose: parseNumber(values.glucose),
    lactate: parseNumber(values.lactate),
    urea: parseNumber(values.urea),
    creatinine: parseNumber(values.creatinine),

    hct: parseNumber(values.hct),
    hgb: parseNumber(values.hgb),

    crp: parseNumber(values.crp),
  };
}
