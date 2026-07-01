import {
  WELLS_DVT_CRITERION_POINTS,
  calculateWellsDvtScore,
  classifyWellsDvt,
  classifyWellsDvtThreeTier,
  classifyWellsDvtTwoTier,
  scoreWellsDvtCriterion,
  type WellsDvtCriterion,
} from "./scoring";

describe("Wells DVT scoring", () => {
  test("scores each individual criterion", () => {
    const expected = Object.entries(WELLS_DVT_CRITERION_POINTS) as Array<
      [WellsDvtCriterion, number]
    >;

    expected.forEach(([criterion, points]) => {
      expect(scoreWellsDvtCriterion(criterion)).toBe(points);
      expect(calculateWellsDvtScore({ [criterion]: true })).toBe(points);
    });
  });

  test("subtracts 2 for an alternative diagnosis", () => {
    expect(scoreWellsDvtCriterion("alt_dx")).toBe(-2);
    expect(
      calculateWellsDvtScore({ cancer: true, tenderness: true, alt_dx: true }),
    ).toBe(0);
  });

  test("calculates the total from selected criteria only", () => {
    expect(
      calculateWellsDvtScore({
        cancer: true,
        paralysis: false,
        bedridden: true,
        tenderness: true,
        previous: true,
        alt_dx: true,
      }),
    ).toBe(2);
    expect(calculateWellsDvtScore({})).toBe(0);
  });

  test.each([
    [-2, false],
    [0, false],
    [1, false],
    [2, true],
    [3, true],
  ])("classifies two-tier score %i as likely=%s", (score, expected) => {
    expect(classifyWellsDvtTwoTier(score)).toBe(expected);
  });

  test.each([
    [-2, "low"],
    [0, "low"],
    [1, "moderate"],
    [2, "moderate"],
    [3, "high"],
  ] as const)("classifies three-tier score %i as %s", (score, expected) => {
    expect(classifyWellsDvtThreeTier(score)).toBe(expected);
  });

  test("preserves the score 2 boundary difference between classifications", () => {
    expect(classifyWellsDvt(2)).toEqual({
      likely: true,
      three: "moderate",
    });
  });
});
