import type { DoseUnit, MedConfig } from "../../state/settings";

export type MedFieldText = {
  dosePerKg?: string;
  maxDose?: string;
  concentration?: string;
};

export type CalculatedMedicationRow = MedConfig & {
  dosePerKg: number;
  doseUnit: DoseUnit;
  maxDose: number | undefined;
  concentration: number | undefined;
  concUnit: DoseUnit;
  rawDoseDisplay: number;
  finalDoseDisplay: number;
  capped: boolean;
  ml: number;
};

export type Translate = (key: any) => string;
