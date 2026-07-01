import { useMemo } from "react";
import { calculateJoules } from "../../../domain/paediatric/joules";
import { toNum } from "../utils/parsing";

export function useJouleCalculation(
  weightKg: number,
  jPerKgOverride: string,
  defaultJPerKgValue: number,
) {
  return useMemo(() => {
    const override = toNum(jPerKgOverride);
    const defaultJPerKg = toNum(String(defaultJPerKgValue));
    const jPerKg = Number.isFinite(override)
      ? override
      : Number.isFinite(defaultJPerKg)
        ? defaultJPerKg
        : NaN;
    return {
      jPerKg,
      defaultJPerKg,
      ...calculateJoules(weightKg, jPerKg),
    };
  }, [weightKg, jPerKgOverride, defaultJPerKgValue]);
}
