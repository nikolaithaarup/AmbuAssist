import { calculateJoules } from "./joules";

describe("joule calculations", () => {
  test.each([
    [10, 4, 40],
    [20, 4, 80],
    [30, 4, 120],
  ])("calculates %s kg × %s J/kg", (weightKg, joulesPerKg, expected) => {
    expect(calculateJoules(weightKg, joulesPerKg)).toEqual({
      rawJoules: expected,
      joules: expected,
      joulesCapped: false,
    });
  });

  test.each([
    [30, 4, 120, false],
    [40, 4, 160, true],
    [100, 2, 200, true],
  ])(
    "caps raw joules %s × %s at the existing maximum",
    (weightKg, joulesPerKg, rawJoules, joulesCapped) => {
      expect(calculateJoules(weightKg, joulesPerKg)).toEqual({
        rawJoules,
        joules: Math.min(rawJoules, 120),
        joulesCapped,
      });
    },
  );

  test.each([
    [NaN, 4],
    [Infinity, 4],
    [20, NaN],
    [20, Infinity],
  ])("returns invalid output for non-finite input", (weightKg, joulesPerKg) => {
    const result = calculateJoules(weightKg, joulesPerKg);
    expect(result.rawJoules).toBeNaN();
    expect(result.joules).toBeNaN();
    expect(result.joulesCapped).toBe(false);
  });
});
