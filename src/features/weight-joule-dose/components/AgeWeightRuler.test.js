import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { AgeWeightRuler } from "./AgeWeightRuler";
import { useWeightCalculation } from "../hooks/useWeightCalculation";

const settings = { formula: "APLS_6_12", customLinearA: 99, customLinearB: 99 };
const tick = 36;
function event(x) {
  return { nativeEvent: { contentOffset: { x, y: 0 } } };
}

function Harness({ reading }) {
  const [age, setAge] = React.useState("3");
  const [weight, setWeight] = React.useState("19");
  const result = useWeightCalculation(age, weight, settings);
  reading.current = { age, weight, ...result };
  return <AgeWeightRuler
    language="da"
    ageYears={age}
    weightKg={weight}
    onAgeChange={(value) => { setAge(value); setWeight(""); }}
    onWeightChange={setWeight}
  />;
}

describe("age and weight wheels auto-select the landed tick", () => {
  let renderer;
  let reading;
  beforeEach(() => {
    jest.useFakeTimers();
    reading = { current: null };
    act(() => { renderer = TestRenderer.create(<Harness reading={reading} />); });
  });
  afterEach(() => {
    if (renderer) act(() => renderer.unmount());
    renderer = null;
    jest.clearAllTimers();
    jest.useRealTimers();
  });
  function handler(testID, prop) {
    const match = renderer.root.findAllByProps({ testID }).find((node) => typeof node.props[prop] === "function");
    expect(match).toBeDefined();
    return match.props[prop];
  }
  function selectTab(mode) {
    act(() => handler(`wjd-ruler-tab-${mode}`, "onPress")());
  }
  function scroll(mode, index) {
    act(() => handler(`wjd-ruler-track-${mode}`, "onScroll")(event(index * tick)));
  }
  function elapsed(ms = 200) { act(() => { jest.advanceTimersByTime(ms); }); }

  test("age wheel automatically selects its final stop and recalculates age-estimated weight", () => {
    selectTab("age");
    scroll("age", 15); // 4 years
    elapsed(90);
    scroll("age", 16); // 5 years; must win after motion settles
    expect(reading.current).toMatchObject({ age: "3", weight: "19", weightKg: 19 });
    elapsed(200);
    expect(reading.current).toMatchObject({ age: "5", weight: "", estKg: 18, weightKg: 18 });
  });

  test("weight wheel automatically selects whole kilograms without another press", () => {
    scroll("weight", 24); // 25 kg: weight scale starts at 1 kg
    expect(reading.current.weight).toBe("19");
    elapsed();
    expect(reading.current).toMatchObject({ age: "3", weight: "25", weightKg: 25 });
  });

  test("drag end without momentum selects the settled age tick", () => {
    selectTab("age");
    act(() => handler("wjd-ruler-track-age", "onScrollBeginDrag")());
    scroll("age", 14);
    act(() => handler("wjd-ruler-track-age", "onScrollEndDrag")(event(17 * tick))); // 6 years
    elapsed();
    expect(reading.current).toMatchObject({ age: "6", weight: "", estKg: 20, weightKg: 20 });
  });

  test("native momentum end commits immediately and does not need a tap", () => {
    act(() => handler("wjd-ruler-track-weight", "onMomentumScrollBegin")());
    scroll("weight", 26);
    act(() => handler("wjd-ruler-track-weight", "onMomentumScrollEnd")(event(26 * tick)));
    expect(reading.current).toMatchObject({ weight: "27", weightKg: 27 });
    elapsed();
    expect(reading.current.weight).toBe("27");
  });
});