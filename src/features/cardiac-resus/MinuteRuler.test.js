import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { MinuteRuler } from "./MinuteRuler";

function event(x) {
  return { nativeEvent: { contentOffset: { x, y: 0 } } };
}

function Harness({ reading }) {
  const [minute, setMinute] = React.useState(1);
  reading.current = minute;
  return <MinuteRuler label="Tid fra sessionstart" value={minute} maxMinutes={12} onChange={setMinute} relative />;
}

describe("horizontal whole-minute cardiac ruler", () => {
  let renderer;
  let reading;
  beforeEach(() => {
    jest.useFakeTimers();
    reading = { current: null };
    act(() => { renderer = TestRenderer.create(<Harness reading={reading} />); });
  });
  afterEach(() => {
    if (renderer) act(() => renderer.unmount());
    jest.clearAllTimers();
    jest.useRealTimers();
  });
  const handler = (renderer, prop) => renderer.root.findAllByProps({ testID: "cardiac-minute-ruler-track" }).find((node) => typeof node.props[prop] === "function").props[prop];

  test("scroll settle commits only the final whole-minute tick", () => {
    act(() => handler(renderer, "onScrollBeginDrag")());
    act(() => handler(renderer, "onScroll")(event(3 * 44)));
    act(() => { jest.advanceTimersByTime(90); });
    act(() => handler(renderer, "onScroll")(event(4 * 44)));
    expect(reading.current).toBe(1);
    act(() => { jest.advanceTimersByTime(180); });
    expect(reading.current).toBe(4);
  });

  test("desktop trackpad scroll selects a tick without drag events", () => {
    act(() => handler(renderer, "onScroll")(event(5 * 44)));
    act(() => { jest.advanceTimersByTime(180); });
    expect(reading.current).toBe(5);
  });

  test("selects the landed tick immediately at momentum end", () => {
    act(() => handler(renderer, "onMomentumScrollBegin")());
    act(() => handler(renderer, "onMomentumScrollEnd")(event(7 * 44)));
    expect(reading.current).toBe(7);
  });

  test("tapping a minute is available without dragging", () => {
    const tick = renderer.root.findByProps({ testID: "cardiac-minute-2" });
    act(() => tick.props.onPress());
    expect(reading.current).toBe(2);
  });
});
