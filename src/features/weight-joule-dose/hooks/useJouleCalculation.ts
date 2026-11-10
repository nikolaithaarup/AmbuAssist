import { useMemo } from "react";
import { calculateJoules } from "../../../domain/paediatric/joules";

// Fixed ambulance quick-reference setting. The existing 120 J safety cap in
// calculateJoules is deliberately unchanged and indicated by the result UI.
export const AMBULANCE_DEFIB_JOULES_PER_KG = 4;

export function useJouleCalculation(weightKg: number) {
  return useMemo(() => ({
    jPerKg: AMBULANCE_DEFIB_JOULES_PER_KG,
    defaultJPerKg: AMBULANCE_DEFIB_JOULES_PER_KG,
    ...calculateJoules(weightKg, AMBULANCE_DEFIB_JOULES_PER_KG),
  }), [weightKg]);
}
