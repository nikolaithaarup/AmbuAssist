export type JouleCalculationResult = {
  rawJoules: number;
  joules: number;
  joulesCapped: boolean;
};

export function calculateJoules(
  weightKg: number,
  joulesPerKg: number,
): JouleCalculationResult {
  const rawJoules =
    Number.isFinite(weightKg) && Number.isFinite(joulesPerKg)
      ? weightKg * joulesPerKg
      : NaN;
  const joules = Number.isFinite(rawJoules) ? Math.min(rawJoules, 120) : NaN;
  const joulesCapped = Number.isFinite(rawJoules) ? rawJoules > 120 : false;

  return { rawJoules, joules, joulesCapped };
}
