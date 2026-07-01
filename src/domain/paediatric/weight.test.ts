import {
  estimateWeightKg,
  type WeightEstimationSettings,
} from "./weight";

function settings(
  overrides: Partial<WeightEstimationSettings>,
): WeightEstimationSettings {
  return {
    formula: "APLS_1_5",
    customLinearA: 2,
    customLinearB: 8,
    ...overrides,
  };
}

describe("weight estimation", () => {
  test.each([
    [1, 10],
    [3, 14],
    [5, 18],
  ])("uses the existing APLS 1-5 formula at age %s", (age, expected) => {
    expect(estimateWeightKg(age, settings({ formula: "APLS_1_5" }))).toBe(expected);
  });

  test.each([
    [6, 25],
    [8, 31],
    [12, 43],
  ])("uses the existing APLS 6-12 formula at age %s", (age, expected) => {
    expect(estimateWeightKg(age, settings({ formula: "APLS_6_12" }))).toBe(expected);
  });

  test("uses the configured custom linear coefficients", () => {
    expect(
      estimateWeightKg(
        4,
        settings({ formula: "CUSTOM_LINEAR", customLinearA: 3, customLinearB: 5 }),
      ),
    ).toBe(17);
  });

  test.each([0, -1, NaN, Infinity, -Infinity])("rejects invalid age %s", (age) => {
    expect(estimateWeightKg(age, settings({}))).toBeNaN();
  });

  test("returns NaN for an unsupported formula at runtime", () => {
    const invalidSettings = {
      ...settings({}),
      formula: "UNSUPPORTED",
    } as unknown as WeightEstimationSettings;
    expect(estimateWeightKg(4, invalidSettings)).toBeNaN();
  });
});
