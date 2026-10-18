import {
  resolveWebRouteDirection,
  runWebRouteTransition,
  shouldAnimateWebRoute,
  WEB_ROUTE_MOTION,
} from "./motion";

describe("Synapse web route motion", () => {
  test("uses a perceptible, clinically quick transition", () => {
    expect(WEB_ROUTE_MOTION.distance).toBeGreaterThanOrEqual(20);
    expect(WEB_ROUTE_MOTION.distance).toBeLessThanOrEqual(35);
    expect(WEB_ROUTE_MOTION.duration).toBeGreaterThanOrEqual(180);
    expect(WEB_ROUTE_MOTION.duration).toBeLessThanOrEqual(260);
    expect(WEB_ROUTE_MOTION.initialOpacity).toBeLessThanOrEqual(0.92);
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
