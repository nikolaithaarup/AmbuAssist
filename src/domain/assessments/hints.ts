export type HintsStepId = "red_flags" | "pattern" | "dix_hallpike" | "hints_plus";
export type HintsResultId = "imaging" | "bppv" | "other" | "central" | "peripheral" | "indeterminate";
export type HintsOptionId =
  | "rf_yes" | "rf_no"
  | "pattern_bppv" | "pattern_avs" | "pattern_unclear"
  | "dh_positive" | "dh_negative"
  | "hints_central_any" | "hints_peripheral_all" | "hints_unclear";

export const HINTS_STEP_IDS: readonly HintsStepId[] = ["red_flags", "pattern", "dix_hallpike", "hints_plus"];

export function getHintsTransition(step: HintsStepId, option: HintsOptionId): HintsStepId | HintsResultId {
  const transitions: Record<HintsStepId, Partial<Record<HintsOptionId, HintsStepId | HintsResultId>>> = {
    red_flags: { rf_yes: "imaging", rf_no: "pattern" },
    pattern: { pattern_bppv: "dix_hallpike", pattern_avs: "hints_plus", pattern_unclear: "indeterminate" },
    dix_hallpike: { dh_positive: "bppv", dh_negative: "other" },
    hints_plus: { hints_central_any: "central", hints_peripheral_all: "peripheral", hints_unclear: "indeterminate" },
  };
  const next = transitions[step][option];
  if (!next) throw new Error(`Invalid HINTS option ${option} for ${step}`);
  return next;
}

export function isHintsStep(value: HintsStepId | HintsResultId): value is HintsStepId {
  return HINTS_STEP_IDS.includes(value as HintsStepId);
}

