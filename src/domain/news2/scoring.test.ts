import {
  calculateNews2,
  calculateNews2Total,
  classifyNews2Escalation,
  hasAnyThree,
  scoreConsciousness,
  scoreHR,
  scoreRR,
  scoreSBP,
  scoreSpO2,
  scoreTemp,
} from "./scoring";

describe("NEWS2 scoring", () => {
  describe("respiratory rate boundaries", () => {
    test.each([
      [7.9, 3], [8, 3], [8.1, 1],
      [10.9, 1], [11, 1], [11.1, 0],
      [19.9, 0], [20, 0], [20.1, 2],
      [23.9, 2], [24, 2], [24.1, 3],
    ])("scores RR %s as %s", (value, expected) => {
      expect(scoreRR(value)).toBe(expected);
    });
  });

  describe("systolic blood pressure boundaries", () => {
    test.each([
      [89.9, 3], [90, 3], [90.1, 2],
      [99.9, 2], [100, 2], [100.1, 1],
      [109.9, 1], [110, 1], [110.1, 0],
      [218.9, 0], [219, 0], [219.1, 3],
    ])("scores SBP %s as %s", (value, expected) => {
      expect(scoreSBP(value)).toBe(expected);
    });
  });

  describe("heart rate boundaries", () => {
    test.each([
      [39.9, 3], [40, 3], [40.1, 1],
      [49.9, 1], [50, 1], [50.1, 0],
      [89.9, 0], [90, 0], [90.1, 1],
      [109.9, 1], [110, 1], [110.1, 2],
      [129.9, 2], [130, 2], [130.1, 3],
    ])("scores HR %s as %s", (value, expected) => {
      expect(scoreHR(value)).toBe(expected);
    });
  });

  describe("temperature boundaries", () => {
    test.each([
      [34.9, 3], [35, 3], [35.1, 1],
      [35.9, 1], [36, 1], [36.1, 0],
      [37.9, 0], [38, 0], [38.1, 1],
      [38.9, 1], [39, 1], [39.1, 2],
    ])("scores temperature %s as %s", (value, expected) => {
      expect(scoreTemp(value)).toBe(expected);
    });
  });

  describe("SpO2 scale 1 boundaries", () => {
    test.each([
      [90.9, 3], [91, 3], [91.1, 2],
      [92.9, 2], [93, 2], [93.1, 1],
      [94.9, 1], [95, 1], [95.1, 0],
    ])("scores SpO2 %s as %s", (value, expected) => {
      expect(scoreSpO2(1, value, false)).toEqual({
        spo2Points: expected,
        o2Points: 0,
      });
    });
  });

  describe("SpO2 scale 2 boundaries", () => {
    test.each([
      [82.9, 3], [83, 3], [83.1, 2],
      [84.9, 2], [85, 2], [85.1, 1],
      [86.9, 1], [87, 1], [87.1, 0],
      [91.9, 0], [92, 0], [92.1, 1],
      [93.9, 1], [94, 1], [94.1, 2],
      [95.9, 2], [96, 2], [96.1, 3],
    ])("scores SpO2 %s as %s", (value, expected) => {
      expect(scoreSpO2(2, value, false)).toEqual({
        spo2Points: expected,
        o2Points: 0,
      });
    });
  });

  test("adds two points for supplemental oxygen independently of SpO2", () => {
    expect(scoreSpO2(1, 96, true)).toEqual({ spo2Points: 0, o2Points: 2 });
    expect(scoreSpO2(2, 82, true)).toEqual({ spo2Points: 3, o2Points: 2 });
  });

  test.each([NaN, Infinity, -Infinity])(
    "scores non-finite observations as zero while preserving oxygen points",
    (value) => {
      expect(scoreRR(value)).toBe(0);
      expect(scoreSBP(value)).toBe(0);
      expect(scoreHR(value)).toBe(0);
      expect(scoreTemp(value)).toBe(0);
      expect(scoreSpO2(1, value, false)).toEqual({ spo2Points: 0, o2Points: 0 });
      expect(scoreSpO2(2, value, true)).toEqual({ spo2Points: 0, o2Points: 2 });
    },
  );

  test.each([
    ["A", 0],
    ["V", 3],
    ["P", 3],
    ["U", 3],
  ] as const)("scores consciousness %s as %s", (avpu, expected) => {
    expect(scoreConsciousness(avpu)).toBe(expected);
  });

  test("calculates total and anyThree from the same component points", () => {
    const parts = [1, 2, 2, 0, 1, 3, 0];
    expect(calculateNews2Total(parts)).toBe(9);
    expect(hasAnyThree(parts)).toBe(true);
    expect(hasAnyThree([1, 2, 2, 0, 1, 0, 0])).toBe(false);
  });

  test("aggregates the individual scores without UI state", () => {
    expect(
      calculateNews2({
        rr: 25,
        spo2: 93,
        sbp: 100,
        hr: 111,
        temp: 39.1,
        onO2: true,
        scale: 1,
        avpu: "V",
      }),
    ).toEqual({
      total: 16,
      anyThree: true,
      pRR: 3,
      spo2Points: 2,
      o2Points: 2,
      pSBP: 2,
      pHR: 2,
      pC: 3,
      pT: 2,
    });
  });

  describe("escalation classification", () => {
    test.each([
      [0, false, "news2_guidance_0"],
      [1, false, "news2_guidance_low"],
      [4, false, "news2_guidance_low"],
      [5, false, "news2_guidance_med"],
      [6, false, "news2_guidance_med"],
      [3, true, "news2_guidance_any3"],
      [5, true, "news2_guidance_any3"],
      [7, false, "news2_guidance_high"],
      [7, true, "news2_guidance_high"],
    ] as const)(
      "classifies total %s with anyThree=%s as %s",
      (total, anyThree, expected) => {
        expect(classifyNews2Escalation(total, anyThree)).toBe(expected);
      },
    );
  });
});
