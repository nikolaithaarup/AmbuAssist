export const WELLS_DVT_CRITERION_POINTS = {
  cancer: 1,
  paralysis: 1,
  bedridden: 1,
  tenderness: 1,
  swollen_leg: 1,
  calf_3cm: 1,
  pitting: 1,
  collateral: 1,
  previous: 1,
  alt_dx: -2,
} as const;

export type WellsDvtCriterion = keyof typeof WELLS_DVT_CRITERION_POINTS;
export type WellsDvtSelections = Partial<Record<WellsDvtCriterion, boolean>>;
export type WellsDvtThreeTier = "low" | "moderate" | "high";

export function scoreWellsDvtCriterion(criterion: WellsDvtCriterion): number {
  return WELLS_DVT_CRITERION_POINTS[criterion];
}

export function calculateWellsDvtScore(
  selections: WellsDvtSelections,
): number {
  return (Object.keys(WELLS_DVT_CRITERION_POINTS) as WellsDvtCriterion[])
    .reduce(
      (total, criterion) =>
        total + (selections[criterion] ? scoreWellsDvtCriterion(criterion) : 0),
      0,
    );
}

export function classifyWellsDvtTwoTier(score: number): boolean {
  return score >= 2;
}

export function classifyWellsDvtThreeTier(
  score: number,
): WellsDvtThreeTier {
  if (score <= 0) return "low";
  if (score <= 2) return "moderate";
  return "high";
}

export function classifyWellsDvt(score: number) {
  return {
    likely: classifyWellsDvtTwoTier(score),
    three: classifyWellsDvtThreeTier(score),
  };
}
