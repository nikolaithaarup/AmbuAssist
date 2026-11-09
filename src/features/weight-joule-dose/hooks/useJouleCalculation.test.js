import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import {
  AMBULANCE_DEFIB_JOULES_PER_KG,
  useJouleCalculation,
} from "./useJouleCalculation";

function Probe({ weightKg, result }) {
  result.current = useJouleCalculation(weightKg);
  return null;
}

describe("fixed 4 J/kg defibrillation calculator", () => {
  let renderer;
  afterEach(() => {
    if (renderer) act(() => renderer.unmount());
    renderer = null;
  });
  function calculate(weightKg) {
    const result = { current: null };
    act(() => {
      renderer = TestRenderer.create(<Probe weightKg={weightKg} result={result} />);
    });
    return result.current;
  }

  test("always uses 4 J/kg", () => {
    expect(AMBULANCE_DEFIB_JOULES_PER_KG).toBe(4);
    expect(calculate(10).joules).toBe(40);
    expect(calculate(20).joules).toBe(80);
    expect(calculate(30).joules).toBe(120);
  });

  test("keeps the pre-existing 120 J cap visible in the calculation state", () => {
    const result = calculate(40);
    expect(result.rawJoules).toBe(160);
    expect(result.joules).toBe(120);
    expect(result.joulesCapped).toBe(true);
  });

  test("does not emit joules without a valid measured or estimated weight", () => {
    expect(calculate(NaN).joules).toBeNaN();
  });
});
