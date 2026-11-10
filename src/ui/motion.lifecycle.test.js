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
  let originalAddEventListener;
  let originalRemoveEventListener;
  let mockHistory;
  let popStateHandler;

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
    originalAddEventListener = global.window.addEventListener;
    originalRemoveEventListener = global.window.removeEventListener;
    popStateHandler = undefined;
    mockHistory = { state: { id: "motion-test-home" } };
    Object.defineProperty(global.window, "history", {
      configurable: true,
      value: mockHistory,
    });
    global.requestAnimationFrame = jest.fn((callback) => {
      nextFrame = callback;
      frameId += 1;
      return frameId;
    });
    global.cancelAnimationFrame = jest.fn();
    global.window.addEventListener = jest.fn((type, handler) => {
      if (type === "popstate") popStateHandler = handler;
    });
    global.window.removeEventListener = jest.fn();
  });

  afterEach(() => {
    global.requestAnimationFrame = originalRequestAnimationFrame;
    global.cancelAnimationFrame = originalCancelAnimationFrame;
    Object.defineProperty(global.window, "history", {
      configurable: true,
      value: originalHistory,
    });
    global.window.addEventListener = originalAddEventListener;
    global.window.removeEventListener = originalRemoveEventListener;
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

  test("cancels an interrupted route frame before starting the latest route", () => {
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
    act(() => {
      mockHistory.state = { id: "motion-test-assessment" };
      renderer.update(<Harness pathname="/tools/assessment-tools" />);
    });
    expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);

    act(() => {
      mockHistory.state = { id: "motion-test-news2" };
      renderer.update(<Harness pathname="/tools/assessment-tools/news2" />);
    });

    expect(global.cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(timing).not.toHaveBeenCalled();

    act(() => {
      nextFrame(16);
    });
    expect(timing).toHaveBeenCalledTimes(2);

    act(() => renderer.unmount());
  });

  test("uses the actual browser history entry for Back and Forward direction", () => {
    let renderer;

    act(() => {
      renderer = TestRenderer.create(<Harness pathname="/home" />);
    });
    act(() => {
      mockHistory.state = { id: "motion-test-assessment" };
      renderer.update(<Harness pathname="/tools/assessment-tools" />);
    });
    expect(latestStyle.transform[0].translateX.__getValue()).toBe(
      WEB_ROUTE_MOTION.distance,
    );

    act(() => {
      mockHistory.state = { id: "motion-test-home" };
      popStateHandler();
      renderer.update(<Harness pathname="/home" />);
    });
    expect(latestStyle.transform[0].translateX.__getValue()).toBe(
      -WEB_ROUTE_MOTION.distance,
    );

    act(() => {
      mockHistory.state = { id: "motion-test-assessment" };
      popStateHandler();
      renderer.update(<Harness pathname="/tools/assessment-tools" />);
    });
    expect(latestStyle.transform[0].translateX.__getValue()).toBe(
      WEB_ROUTE_MOTION.distance,
    );

    act(() => renderer.unmount());
  });
});
