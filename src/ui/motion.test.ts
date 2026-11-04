import {
  resolveWebRouteDirection,
  runWebRouteTransition,
  PRESS_MOTION,
  shouldAnimateWebRoute,
  WEB_ROUTE_MOTION,
} from "./motion";

describe("Synapse web route motion", () => {
  test("uses a perceptible, clinically quick transition", () => {
    expect(WEB_ROUTE_MOTION.distance).toBeGreaterThanOrEqual(4);
    expect(WEB_ROUTE_MOTION.distance).toBeLessThanOrEqual(8);
    expect(WEB_ROUTE_MOTION.duration).toBeGreaterThanOrEqual(180);
    expect(WEB_ROUTE_MOTION.totalDuration).toBeLessThanOrEqual(300);
    expect(WEB_ROUTE_MOTION.initialOpacity).toBeLessThanOrEqual(0.1);
  });

  test("uses visible but restrained tactile press feedback", () => {
    expect(PRESS_MOTION.minimumScale).toBeGreaterThanOrEqual(0.96);
    expect(PRESS_MOTION.maximumScale).toBeLessThanOrEqual(0.97);
    expect(PRESS_MOTION.defaultScale).toBeGreaterThanOrEqual(0.96);
    expect(PRESS_MOTION.defaultScale).toBeLessThanOrEqual(0.97);
    expect(PRESS_MOTION.pressDuration).toBeLessThanOrEqual(70);
  });

  test("disables route motion when reduced motion is enabled", () => {
    expect(shouldAnimateWebRoute(true, false)).toBe(true);
    expect(shouldAnimateWebRoute(true, true)).toBe(false);
    expect(shouldAnimateWebRoute(false, false)).toBe(false);
  });

  test("executes navigation synchronously and exactly once", () => {
    const events: string[] = [];

    runWebRouteTransition("forward", () => events.push("assessment"));

    expect(events).toEqual(["assessment"]);
  });

  test("never replays stale navigation when a newer interaction interrupts motion", () => {
    const pathStack = ["/home"];

    runWebRouteTransition("forward", () =>
      pathStack.push("/tools/assessment-tools"),
    );
    runWebRouteTransition("forward", () =>
      pathStack.push("/tools/assessment-tools/news2"),
    );
    runWebRouteTransition("back", () => {
      pathStack.pop();
    });

    expect(pathStack).toEqual(["/home", "/tools/assessment-tools"]);
  });

  test("prefers explicit interaction intent for card and header navigation", () => {
    expect(
      resolveWebRouteDirection("/home", "/tools/destination", "back", "forward"),
    ).toBe("forward");
    expect(
      resolveWebRouteDirection("/tools/destination", "/home", "forward", "back"),
    ).toBe("back");
  });

  test("uses browser history direction for Back and Forward", () => {
    expect(
      resolveWebRouteDirection(
        "/tools/destination",
        "/tools/trombolysis",
        "back",
        null,
      ),
    ).toBe("back");
    expect(
      resolveWebRouteDirection(
        "/tools/trombolysis",
        "/tools/destination",
        "forward",
        null,
      ),
    ).toBe("forward");
  });

  test("falls back to route depth without changing navigation semantics", () => {
    expect(
      resolveWebRouteDirection("/home", "/tools/destination", null, null),
    ).toBe("forward");
    expect(
      resolveWebRouteDirection("/tools/destination", "/home", null, null),
    ).toBe("back");
  });
});
