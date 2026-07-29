import type { BloodGasFieldKey } from "./types";

export type BloodGasFieldConfig = {
  id: BloodGasFieldKey;
  labelKey: string;
  unit: string;
  plausible: { min: number; max: number };
  reference?: string;
  helperDa?: string;
  helperEn?: string;
};

/** Broad entry plausibility limits, not clinical escalation thresholds. */
export const VGAS_FIELD_CONFIG_VERSION = "1.0-local-draft";

export const VGAS_FIELDS: Record<BloodGasFieldKey, BloodGasFieldConfig> = {
  ph: { id: "ph", labelKey: "bg_label_ph", unit: "", plausible: { min: 6.5, max: 8 }, reference: "7.35–7.45" },
  pco2: { id: "pco2", labelKey: "bg_label_pco2", unit: "kPa", plausible: { min: 0.5, max: 20 }, reference: "4.6–6.0" },
  po2: { id: "po2", labelKey: "bg_label_po2", unit: "kPa", plausible: { min: 0.5, max: 30 }, helperDa: "Venøs pO₂ kan ikke bruges alene til sikker vurdering af iltning.", helperEn: "Venous pO₂ cannot assess oxygenation reliably on its own." },
  hco3: { id: "hco3", labelKey: "bg_label_hco3", unit: "mmol/L", plausible: { min: 2, max: 60 }, reference: "22–26" },
  be: { id: "be", labelKey: "bg_label_be", unit: "mmol/L", plausible: { min: -40, max: 40 }, reference: "−2 to +2" },
  so2: { id: "so2", labelKey: "bg_label_so2", unit: "%", plausible: { min: 0, max: 100 }, helperDa: "Venøs værdi; sammenhold med SpO₂ og klinik.", helperEn: "Venous value; compare with SpO₂ and clinical context." },
  na: { id: "na", labelKey: "bg_label_na", unit: "mmol/L", plausible: { min: 80, max: 200 }, reference: "137–145" },
  k: { id: "k", labelKey: "bg_label_k", unit: "mmol/L", plausible: { min: 0.5, max: 15 }, reference: "3.5–4.4" },
  ca: { id: "ca", labelKey: "bg_label_ca", unit: "mmol/L", plausible: { min: 0.2, max: 3 }, reference: "1.18–1.32" },
  cl: { id: "cl", labelKey: "bg_label_cl", unit: "mmol/L", plausible: { min: 50, max: 160 }, reference: "98–106" },
  glucose: { id: "glucose", labelKey: "bg_label_glucose", unit: "mmol/L", plausible: { min: 0, max: 100 } },
  lactate: { id: "lactate", labelKey: "bg_label_lactate", unit: "mmol/L", plausible: { min: 0, max: 30 }, reference: "<2" },
  urea: { id: "urea", labelKey: "bg_label_urea", unit: "mmol/L", plausible: { min: 0, max: 80 } },
  creatinine: { id: "creatinine", labelKey: "bg_label_creatinine", unit: "µmol/L", plausible: { min: 0, max: 2000 } },
  hct: { id: "hct", labelKey: "bg_label_hct", unit: "%", plausible: { min: 5, max: 80 } },
  hgb: { id: "hgb", labelKey: "bg_label_hgb", unit: "mmol/L", plausible: { min: 1, max: 15 } },
  crp: { id: "crp", labelKey: "bg_label_crp", unit: "mg/L", plausible: { min: 0, max: 600 } },
};
