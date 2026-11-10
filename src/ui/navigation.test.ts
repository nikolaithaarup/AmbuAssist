import {
  beginBackNavigation,
  navigateBackOrFallback,
  releaseBackNavigationOnRouteCommit,
  type BackNavigationGate,
  type BackRouter,
} from "./navigation";

class MemoryRouter implements BackRouter {
  private entries: string[];
  private index: number;

  constructor(initialEntries: string[]) {
    this.entries = [...initialEntries];
    this.index = this.entries.length - 1;
  }

  get pathname() {
    return this.entries[this.index];
  }

  push(path: string) {
    this.entries = this.entries.slice(0, this.index + 1);
    this.entries.push(path);
    this.index = this.entries.length - 1;
  }

  back = () => {
    if (this.canGoBack()) this.index -= 1;
  };

  canGoBack = () => this.index > 0;

  replace = (path: string) => {
    this.entries[this.index] = path;
  };

  forward() {
    if (this.index < this.entries.length - 1) this.index += 1;
  }
}

describe("deterministic app Back navigation", () => {
  test("returns through Home -> Assessment -> Tool -> Back -> Back", () => {
    const router = new MemoryRouter(["/home"]);
    router.push("/tools/assessment-tools");
    router.push("/tools/assessment-tools/news2");

    expect(navigateBackOrFallback(router)).toBe("back");
    expect(router.pathname).toBe("/tools/assessment-tools");
    expect(navigateBackOrFallback(router)).toBe("back");
    expect(router.pathname).toBe("/home");
  });

  test("does not revive About while switching among top-level tools", () => {
    const router = new MemoryRouter(["/home"]);

    for (const route of [
      "/tools/about",
      "/tools/assessment-tools",
      "/tools/destination",
    ]) {
      router.push(route);
      navigateBackOrFallback(router);
      expect(router.pathname).toBe("/home");
    }
  });

  test("coalesces rapid repeated web Back presses until the route commits", () => {
    const router = new MemoryRouter([
      "/home",
      "/tools/assessment-tools",
      "/tools/assessment-tools/news2",
    ]);
    const gate: BackNavigationGate = { pendingFromPath: null };
    const fromPath = router.pathname;

    expect(
      beginBackNavigation(gate, "web", fromPath, () =>
        navigateBackOrFallback(router),
      ),
    ).toBe(true);
    expect(router.pathname).toBe("/tools/assessment-tools");
    expect(
      beginBackNavigation(gate, "web", fromPath, () =>
        navigateBackOrFallback(router),
      ),
    ).toBe(false);
    expect(router.pathname).toBe("/tools/assessment-tools");

    releaseBackNavigationOnRouteCommit(gate, router.pathname);
    expect(
      beginBackNavigation(gate, "web", router.pathname, () =>
        navigateBackOrFallback(router),
      ),
    ).toBe(true);
    expect(router.pathname).toBe("/home");
  });

  test("uses Home as a deterministic fallback for a deep-linked tool", () => {
    const router = new MemoryRouter(["/tools/assessment-tools/news2"]);

    expect(navigateBackOrFallback(router)).toBe("fallback");
    expect(router.pathname).toBe("/home");
  });

  test("browser Back and Forward retain their actual route entries", () => {
    const router = new MemoryRouter(["/home"]);
    router.push("/tools/assessment-tools");
    router.push("/tools/assessment-tools/news2");

    router.back();
    expect(router.pathname).toBe("/tools/assessment-tools");
    router.forward();
    expect(router.pathname).toBe("/tools/assessment-tools/news2");
  });

  test("does not add the web-only repeat guard to native navigation", () => {
    const gate: BackNavigationGate = { pendingFromPath: null };
    const navigate = jest.fn();

    expect(beginBackNavigation(gate, "ios", "/tools/about", navigate)).toBe(
      true,
    );
    expect(beginBackNavigation(gate, "ios", "/tools/about", navigate)).toBe(
      true,
    );
    expect(navigate).toHaveBeenCalledTimes(2);
  });
});
