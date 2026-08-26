import { calculatePressResult, type PressAnswers } from "./press";

describe("PreSS scoring regression", () => {
  test("all negative remains negative", () => {
    const answers: PressAnswers = {
      p1_face: 0, p1_arm: 0, p1_speech: 0, p1_other: 0,
      p2_armDrift: 0, p2_loc: 0, p2_gaze: 0,
    };
    expect(calculatePressResult(answers)).toEqual({
      part1Score: 0, part2Score: 0, answeredCount: 7, complete: true, part1Positive: false,
    });
  });

  test("part 1 threshold remains one positive finding", () => {
    const answers: PressAnswers = {
      p1_face: 1, p1_arm: 0, p1_speech: 0, p1_other: 0,
      p2_armDrift: 1, p2_loc: 1, p2_gaze: 1,
    };
    expect(calculatePressResult(answers)).toMatchObject({
      part1Score: 1, part2Score: 3, complete: true, part1Positive: true,
    });
  });

  test("incomplete answers do not masquerade as complete", () => {
    expect(calculatePressResult({ p1_face: 1 })).toMatchObject({
      part1Score: 1, answeredCount: 1, complete: false,
    });
  });
});

