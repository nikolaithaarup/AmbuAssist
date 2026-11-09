import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { useWeightCalculation } from "./useWeightCalculation";

// Legacy settings may still be persisted on users' devices. The ambulance
// quick calculator must not depend on the old configurable APLS setting.
const legacySettings = {
  formula: "APLS_6_12",
  customLinearA: 99,
  customLinearB: 99,
};

function Probe({ age, weight, result }) {
  result.current = useWeightCalculation(age, weight, legacySettings);
  return null;
}

describe("ambulance fixed age-based weight rule", () => {
  let renderer;
  afterEach(() => {
    if (renderer) act(() => renderer.unmount());
    renderer = null;
  });

  function calculate(age, weight = "") {
    const result = { current: null };
    act(() => {
      renderer = TestRenderer.create(<Probe age={age} weight={weight} result={result} />);
    });
    return result.current;
  }

  test.each([
    ["1", 10],
    ["2", 12],
    ["5", 18],
    ["12", 32],
  ])("%s years estimates %s kg using (age × 2) + 8", (age, expected) => {
    const result = calculate(age);
    expect(result.estKg).toBe(expected);
    expect(result.weightKg).toBe(expected);
  });

  test.each(["", "0", "6 mdr", "11 mdr", "13", "not an age"]) (
    "age %s requires a measured weight rather than extrapolation",
    (age) => {
      const result = calculate(age);
      expect(result.estKg).toBeNaN();
      expect(result.weightKg).toBeNaN();
    },
  );

  test("a measured weight overrides the estimated weight and accepts decimal comma", () => {
    const result = calculate("2", "7,2");
    expect(result.estKg).toBe(12);
    expect(result.weightKg).toBe(7.2);
  });

  test("an infant's measured weight is accepted without inventing an age estimate", () => {
    const result = calculate("6 mdr", "7,2");
    expect(result.estKg).toBeNaN();
    expect(result.weightKg).toBe(7.2);
  });
});
