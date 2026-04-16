type Inputs = {
  pH?: number;
  pCO2?: number;
  HCO3?: number;
  glucose?: number;
  lactate?: number;
  crp?: number;
  nitrite?: boolean;
  leukocytes?: boolean;
};

type Output = {
  acidBase?: string;
  patterns: string[];
  suggestions: string[];
};

export function analyzeBloodGas(input: Inputs): Output {
  const { pH, pCO2, HCO3, glucose, lactate, crp, nitrite, leukocytes } = input;

  let acidBase = "";
  const patterns: string[] = [];
  const suggestions: string[] = [];

  // 🔬 ACID-BASE
  if (pH !== undefined) {
    if (pH < 7.35) acidBase = "Acidosis";
    else if (pH > 7.45) acidBase = "Alkalosis";
    else acidBase = "Normal pH";
  }

  // 🧪 DKA
  if (
    pH !== undefined &&
    HCO3 !== undefined &&
    glucose !== undefined &&
    pH < 7.3 &&
    HCO3 < 18 &&
    glucose > 11
  ) {
    patterns.push("DKA pattern");
    suggestions.push("Consider ketoacidosis");
  }

  // 🧪 Lactate / shock
  if (lactate !== undefined && lactate > 2) {
    patterns.push("Elevated lactate");
    suggestions.push("Consider sepsis or hypoperfusion");
  }

  if (lactate !== undefined && lactate > 4) {
    suggestions.push("Urgent evaluation for shock");
  }

  // 🚽 UTI
  if (nitrite && leukocytes) {
    patterns.push("UTI pattern");
    suggestions.push("Consider urinary tract infection");
  }

  // 🧫 CRP
  if (crp !== undefined && crp > 100) {
    patterns.push("High CRP");
    suggestions.push("Consider significant infection");
  }

  return {
    acidBase,
    patterns,
    suggestions,
  };
}
