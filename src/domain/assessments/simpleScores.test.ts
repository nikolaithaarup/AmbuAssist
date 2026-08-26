import { classifyApgar, classifyBvc, classifyFlacc, classifyNihss, sumAssessmentAnswers } from "./simpleScores";

describe("migrated score regressions", () => {
  test("sum includes zero and ignores missing answers", () => {
    expect(sumAssessmentAnswers(["a", "b", "c"], { a: 0, b: 2 })).toBe(2);
  });
  test.each([[3, "critical"], [4, "moderate"], [6, "moderate"], [7, "ok"]] as const)("APGAR %s remains %s", (score, expected) => expect(classifyApgar(score)).toBe(expected));
  test.each([[0, "none"], [1, "mild"], [3, "mild"], [4, "moderate"], [6, "moderate"], [7, "severe"]] as const)("FLACC %s remains %s", (score, expected) => expect(classifyFlacc(score)).toBe(expected));
  test.each([[0, "low"], [1, "moderate"], [2, "moderate"], [3, "high"]] as const)("BVC %s remains %s", (score, expected) => expect(classifyBvc(score)).toBe(expected));
  test.each([[0, "none"], [1, "minor"], [4, "minor"], [5, "moderate"], [15, "moderate"], [16, "moderate-severe"], [20, "moderate-severe"], [21, "severe"]] as const)("NIHSS %s remains %s", (score, expected) => expect(classifyNihss(score)).toBe(expected));
});
