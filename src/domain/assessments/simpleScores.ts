export function sumAssessmentAnswers(
  itemIds: readonly string[],
  answers: Partial<Record<string, number>>,
): number {
  return itemIds.reduce((sum, id) => sum + (Number.isFinite(answers[id]) ? answers[id]! : 0), 0);
}

export function classifyApgar(score: number): "ok" | "moderate" | "critical" {
  return score >= 7 ? "ok" : score >= 4 ? "moderate" : "critical";
}

export function classifyFlacc(score: number): "none" | "mild" | "moderate" | "severe" {
  return score === 0 ? "none" : score <= 3 ? "mild" : score <= 6 ? "moderate" : "severe";
}

export function classifyBvc(score: number): "low" | "moderate" | "high" {
  return score === 0 ? "low" : score <= 2 ? "moderate" : "high";
}

export function classifyNihss(score: number): "none" | "minor" | "moderate" | "moderate-severe" | "severe" {
  return score === 0 ? "none" : score <= 4 ? "minor" : score <= 15 ? "moderate" : score <= 20 ? "moderate-severe" : "severe";
}

