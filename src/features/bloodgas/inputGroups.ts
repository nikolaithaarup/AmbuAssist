import type { BloodGasFieldKey, BloodGasFormValues } from "./types";
import { validateBloodGasField } from "./helpers";

export type BloodGasInputGroup = {
  id: "acidBase" | "oxygenation" | "electrolytes" | "metabolic" | "renalBlood" | "infection";
  titleDa: string;
  titleEn: string;
  fields: BloodGasFieldKey[];
  defaultOpen?: boolean;
};

export const VGAS_INPUT_GROUPS: BloodGasInputGroup[] = [
  { id: "acidBase", titleDa: "Syre-base", titleEn: "Acid-base", fields: ["ph", "pco2", "hco3", "be"], defaultOpen: true },
  { id: "oxygenation", titleDa: "Iltning på VGAS", titleEn: "Oxygenation on VGAS", fields: ["po2", "so2"] },
  { id: "electrolytes", titleDa: "Elektrolytter", titleEn: "Electrolytes", fields: ["na", "k", "ca", "cl"] },
  { id: "metabolic", titleDa: "Metabolisk", titleEn: "Metabolic", fields: ["glucose", "lactate"] },
  { id: "renalBlood", titleDa: "Nyretal og blod", titleEn: "Renal markers and blood", fields: ["urea", "creatinine", "hct", "hgb"] },
  { id: "infection", titleDa: "Infektion", titleEn: "Infection", fields: ["crp"] },
];

export function getGroupSummary(fields: BloodGasFieldKey[], values: BloodGasFormValues) {
  const states = fields.map((field) => validateBloodGasField(field, values[field]));
  return {
    entered: states.filter((state) => state !== "empty").length,
    issues: states.filter((state) => state === "invalid" || state === "implausible").length,
    total: fields.length,
  };
}

export function getFormSummary(values: BloodGasFormValues) {
  return getGroupSummary(Object.keys(values) as BloodGasFieldKey[], values);
}
