import {
  calculateMedicationDose,
  type MedicationCalculationInput,
} from "./calculations";

function input(
  overrides: Partial<MedicationCalculationInput>,
): MedicationCalculationInput {
  return {
    weightKg: 20,
    dosePerKg: 0.25,
    doseUnit: "mg",
    maxDose: NaN,
    concentration: NaN,
    concUnit: "mg",
    ...overrides,
  };
}

describe("medication dose calculations", () => {
  test.each([
    [20, 0.25, "mg", 5],
    [10, 1, "ug", 10],
    [2, 0.5, "g", 1],
  ] as const)(
    "calculates %s kg × %s %s/kg in the configured display unit",
    (weightKg, dosePerKg, doseUnit, expected) => {
      const result = calculateMedicationDose(
        input({ weightKg, dosePerKg, doseUnit, concUnit: doseUnit }),
      );
      expect(result.rawDoseDisplay).toBe(expected);
      expect(result.finalDoseDisplay).toBe(expected);
      expect(result.capped).toBe(false);
    },
  );

  test.each([
    [20, 0.25, 5, 5, false],
    [120, 0.25, 25, 25, true],
    [120, 0.25, 0, 30, false],
    [120, 0.25, NaN, 30, false],
  ])(
    "applies the existing maximum-dose behavior",
    (weightKg, dosePerKg, maxDose, expectedDose, expectedCapped) => {
      const result = calculateMedicationDose(
        input({ weightKg, dosePerKg, maxDose }),
      );
      expect(result.finalDoseDisplay).toBe(expectedDose);
      expect(result.capped).toBe(expectedCapped);
    },
  );

  test.each([
    [5, "mg", 25, "mg", 0.2],
    [10, "ug", 50, "ug", 0.2],
    [1, "g", 500, "mg", 2],
  ] as const)(
    "calculates volume across compatible mass units",
    (dose, doseUnit, concentration, concUnit, expectedMl) => {
      const result = calculateMedicationDose(
        input({
          weightKg: 1,
          dosePerKg: dose,
          doseUnit,
          concentration,
          concUnit,
        }),
      );
      expect(result.ml).toBeCloseTo(expectedMl);
    },
  );

  test("calculates and caps IE without mass conversion", () => {
    expect(
      calculateMedicationDose(
        input({
          weightKg: 80,
          dosePerKg: 100,
          doseUnit: "IE",
          maxDose: 10000,
          concentration: 1000,
          concUnit: "IE",
        }),
      ),
    ).toEqual({
      rawDoseDisplay: 8000,
      finalDoseDisplay: 8000,
      capped: false,
      ml: 8,
    });

    expect(
      calculateMedicationDose(
        input({
          weightKg: 120,
          dosePerKg: 100,
          doseUnit: "IE",
          maxDose: 10000,
          concentration: 1000,
          concUnit: "IE",
        }),
      ),
    ).toEqual({
      rawDoseDisplay: 12000,
      finalDoseDisplay: 10000,
      capped: true,
      ml: 10,
    });
  });

  test.each([
    { weightKg: NaN },
    { weightKg: Infinity },
    { dosePerKg: NaN },
    { dosePerKg: Infinity },
  ])("returns invalid dose outputs for non-finite dosing input: %o", (override) => {
    const result = calculateMedicationDose(input(override));
    expect(result.rawDoseDisplay).toBeNaN();
    expect(result.finalDoseDisplay).toBeNaN();
    expect(result.capped).toBe(false);
    expect(result.ml).toBeNaN();
  });

  test.each([0, -1, NaN, Infinity])(
    "keeps dose valid but returns invalid volume for concentration %s",
    (concentration) => {
      const result = calculateMedicationDose(input({ concentration }));
      expect(result.finalDoseDisplay).toBe(5);
      expect(result.ml).toBeNaN();
    },
  );

  test("requires IE concentration units for an IE volume", () => {
    const result = calculateMedicationDose(
      input({
        weightKg: 80,
        dosePerKg: 100,
        doseUnit: "IE",
        concentration: 1000,
        concUnit: "mg",
      }),
    );
    expect(result.finalDoseDisplay).toBe(8000);
    expect(result.ml).toBeNaN();
  });
});
