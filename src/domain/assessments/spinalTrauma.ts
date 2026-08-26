export type SpinalTraumaStepId = "penetrating" | "critical" | "tenderOrNeuro";
export type SpinalTraumaOutcomeId = "none" | "spinal" | "timeCritical";
export type SpinalTraumaAnswer = "yes" | "no";

export function getSpinalTraumaTransition(
  step: SpinalTraumaStepId,
  answer: SpinalTraumaAnswer,
): SpinalTraumaStepId | SpinalTraumaOutcomeId {
  if (step === "penetrating") return answer === "yes" ? "none" : "critical";
  if (step === "critical") return answer === "yes" ? "timeCritical" : "tenderOrNeuro";
  return answer === "yes" ? "spinal" : "none";
}

export function isSpinalTraumaStep(
  value: SpinalTraumaStepId | SpinalTraumaOutcomeId,
): value is SpinalTraumaStepId {
  return value === "penetrating" || value === "critical" || value === "tenderOrNeuro";
}

