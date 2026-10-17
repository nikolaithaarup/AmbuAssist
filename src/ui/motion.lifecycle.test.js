import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Animated } from "react-native";
import { useWebRouteTransition, WEB_ROUTE_MOTION } from "./motion";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("web route animation lifecycle", () => {
  let latestStyle;
  let nextFrame;
  let frameId;
  let originalRequestAnimationFrame;
  let originalCancelAnimationFrame;
  let originalHistory;

  function Harness({ pathname }) {
    latestStyle = useWebRouteTransition(pathname, true);
    return null;
  }

  beforeEach(() => {
    latestStyle = undefined;
    nextFrame = undefined;
    frameId = 0;
    originalRequestAnimationFrame = global.requestAnimationFrame;
    originalCancelAnimationFrame = global.cancelAnimationFrame;
    originalHistory = global.window.history;
    Object.defineProperty(global.window, "history", {
      configurable: true,
      value: { state: { id: "motion-test-home" } },
    });
    global.requestAnimationFrame = jest.fn((callback) => {
      nextFrame = callback;
      frameId += 1;
      return frameId;
    });
    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    global.requestAnimationFrame = originalRequestAnimationFrame;
    global.cancelAnimationFrame = originalCancelAnimationFrame;
    Object.defineProperty(global.window, "history", {
      configurable: true,
      value: originalHistory,
    });
    jest.restoreAllMocks();
  });

  test("commits a perceptible start state for one frame before timing begins", () => {
    const animation = {
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    };
    const timing = jest.spyOn(Animated, "timing").mockReturnValue(animation);
    let renderer;

    act(() => {
      renderer = TestRenderer.create(<Harness pathname="/home" />);
    });
    expect(timing).not.toHaveBeenCalled();

    act(() => {
      renderer.update(<Harness pathname="/tools/destination" />);
    });

    expect(latestStyle.opacity.__getValue()).toBe(
      WEB_ROUTE_MOTION.initialOpacity,
    );
    expect(latestStyle.transform[0].translateX.__getValue()).toBe(
      WEB_ROUTE_MOTION.distance,
    );
    expect(timing).not.toHaveBeenCalled();
    expect(nextFrame).toEqual(expect.any(Function));

    act(() => {
      nextFrame(16);
    });

    expect(timing).toHaveBeenCalledTimes(2);
    expect(timing.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        toValue: 1,
        duration: WEB_ROUTE_MOTION.duration,
        isInteraction: false,
      }),
    );
    expect(timing.mock.calls[1][1]).toEqual(
      expect.objectContaining({
        toValue: 0,
        duration: WEB_ROUTE_MOTION.duration,
        isInteraction: false,
      }),
    );

    act(() => renderer.unmount());
  });
});
