import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { WeightCalculatorCard } from "./WeightCalculatorCard";
import { useWeightCalculation } from "../hooks/useWeightCalculation";

// Exercise the component contract without depending on scroll physics in Jest.
// The real ruler's tick callbacks are wired to these two handlers.
jest.mock("./AgeWeightRuler", () => {
  const R = require("react");
  const { Pressable } = require("react-native");
  return {
    AgeWeightRuler: ({ onAgeChange, onWeightChange }) => R.createElement(
      R.Fragment, null,
      R.createElement(Pressable, { testID: "mock-ruler-choose-age", onPress: () => onAgeChange("4") }),
      R.createElement(Pressable, { testID: "mock-ruler-choose-weight", onPress: () => onWeightChange("23") }),
    ),
  };
});
const t = (key) => key;
const legacy = { formula: "APLS_6_12", customLinearA: 99, customLinearB: 99 };
function Harness({ result }) {
  const [age, setAge] = React.useState("3");
  const [weight, setWeight] = React.useState("19");
  const values = useWeightCalculation(age, weight, legacy);
  result.current = { age, weight, ...values };
  return <WeightCalculatorCard
    t={t}
    language="da"
    ageYears={age}
    setAgeYears={setAge}
    weightKgOverride={weight}
    setWeightKgOverride={setWeight}
  />;
}
describe("weight calculator age/weight selection precedence", () => {
  let renderer;
  let result;
  beforeEach(() => {
    result = { current: null };
    act(() => { renderer = TestRenderer.create(<Harness result={result} />); });
  });
  afterEach(() => { if (renderer) act(() => renderer.unmount()); renderer = null; });
  function target(testID, method) {
    const match = renderer.root.findAllByProps({ testID }).find((node) => typeof node.props[method] === "function");
    expect(match).toBeDefined();
    return match;
  }
  test("selecting an age clears measured weight and reactivates (age x 2) + 8", () => {
    expect(result.current.weightKg).toBe(19);
    act(() => target("mock-ruler-choose-age", "onPress").props.onPress());
    expect(result.current).toMatchObject({ age: "4", weight: "", estKg: 16, weightKg: 16 });
  });
  test("the weight ruler explicitly overrides the age-derived weight", () => {
    act(() => target("mock-ruler-choose-age", "onPress").props.onPress());
    act(() => target("mock-ruler-choose-weight", "onPress").props.onPress());
    expect(result.current).toMatchObject({ age: "4", weight: "23", estKg: 16, weightKg: 23 });
  });
  test("typing an age clears a stale weight override; typing a precise weight still works", () => {
    act(() => target("wjd-input-age", "onChangeText").props.onChangeText("5"));
    expect(result.current).toMatchObject({ age: "5", weight: "", estKg: 18, weightKg: 18 });
    act(() => target("wjd-input-weight", "onChangeText").props.onChangeText("18,5"));
    expect(result.current).toMatchObject({ age: "5", weight: "18,5", estKg: 18, weightKg: 18.5 });
  });
});
