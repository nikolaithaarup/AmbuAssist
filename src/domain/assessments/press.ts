export const PRESS_PART_1_IDS = ["p1_face", "p1_arm", "p1_speech", "p1_other"] as const;
export const PRESS_PART_2_IDS = ["p2_armDrift", "p2_loc", "p2_gaze"] as const;
export type PressItemId = (typeof PRESS_PART_1_IDS)[number] | (typeof PRESS_PART_2_IDS)[number];
export type PressAnswers = Partial<Record<PressItemId, number>>;

export function calculatePressResult(answers: PressAnswers) {
  const sum = (ids: readonly PressItemId[]) =>
    ids.reduce((total, id) => total + (Number.isFinite(answers[id]) ? answers[id]! : 0), 0);
  const part1Score = sum(PRESS_PART_1_IDS);
  const part2Score = sum(PRESS_PART_2_IDS);
  const answeredCount = [...PRESS_PART_1_IDS, ...PRESS_PART_2_IDS].filter(
    (id) => Number.isFinite(answers[id]),
  ).length;
  return {
    part1Score,
    part2Score,
    answeredCount,
    complete: answeredCount === PRESS_PART_1_IDS.length + PRESS_PART_2_IDS.length,
    part1Positive: part1Score >= 1,
  };
}

