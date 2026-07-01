import { useMemo } from "react";
import { calculateMedicationDose } from "../../../domain/medication/calculations";
import type { DoseUnit, MedConfig } from "../../../state/settings";
import type { CalculatedMedicationRow } from "../types";
import { toNum } from "../utils/parsing";

export function useDoseCalculation(weightKg: number, meds: MedConfig[]) {
  return useMemo<CalculatedMedicationRow[]>(
    () =>
      (Array.isArray(meds) ? meds : [])
        .filter((med) => med.enabled !== false)
        .map((med) => {
          const dosePerKg = toNum(String(med.dosePerKg));
          const doseUnit = (med.doseUnit ?? "mg") as DoseUnit;
          const maxDose = toNum(String(med.maxDose));
          const concentration = toNum(String(med.concentration));
          const concUnit = ((med.concUnit ?? doseUnit) as DoseUnit) ?? doseUnit;
          const calculation = calculateMedicationDose({
            weightKg,
            dosePerKg,
            doseUnit,
            maxDose,
            concentration,
            concUnit,
          });

          return {
            ...med,
            dosePerKg,
            doseUnit,
            maxDose: Number.isFinite(maxDose) ? maxDose : undefined,
            concentration: Number.isFinite(concentration)
              ? concentration
              : undefined,
            concUnit,
            ...calculation,
          };
        }),
    [weightKg, meds],
  );
}
