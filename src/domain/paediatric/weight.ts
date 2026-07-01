export type WeightFormula = "APLS_1_5" | "APLS_6_12" | "CUSTOM_LINEAR";

export type WeightEstimationSettings = {
  formula: WeightFormula;
  customLinearA: number;
  customLinearB: number;
};

export function estimateWeightKg(ageYears: number, settings: WeightEstimationSettings) {
  if (!Number.isFinite(ageYears) || ageYears <= 0) return NaN;

  switch (settings.formula) {
    case "APLS_1_5":
      return (ageYears + 4) * 2;
    case "APLS_6_12":
      return ageYears * 3 + 7;
    case "CUSTOM_LINEAR":
      return ageYears * settings.customLinearA + settings.customLinearB;
    default:
      return NaN;
  }
}
