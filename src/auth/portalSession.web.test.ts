import { getPortalLoginUrl, loadAmbuAssistSession } from "./portalSession.web";

const validResponse = {
  user: {
    id: "user-1",
    email: "clinician@example.dk",
    emailVerified: true,
  },
  entitlements: { ambuassist: { granted: true, source: "role" } },
  expiresAt: "2099-01-01T00:00:00.000Z",
};

describe("AmbuAssist Portal client", () => {
  const originalFetch = global.fetch;
  const originalAppOrigin = process.env.EXPO_PUBLIC_APP_ORIGIN;

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalAppOrigin === undefined) {
      delete process.env.EXPO_PUBLIC_APP_ORIGIN;
    } else {
      process.env.EXPO_PUBLIC_APP_ORIGIN = originalAppOrigin;
    }
    jest.restoreAllMocks();
  });

  test("uses the configured app origin for the default login return URL", () => {
    process.env.EXPO_PUBLIC_APP_ORIGIN =
      "https://ambuassist-staging.synapsestudio.dk";

    const loginUrl = new URL(getPortalLoginUrl());

    expect(loginUrl.origin).toBe("https://portal.synapsestudio.dk");
    expect(loginUrl.searchParams.get("returnTo")).toBe(
      "https://ambuassist-staging.synapsestudio.dk/",
    );
  });

  test("sends only a credentialed session lookup and authorizes explicit access", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => validResponse,
    });

    await expect(loadAmbuAssistSession()).resolves.toMatchObject({
      status: "authorized",
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://portal.synapsestudio.dk/api/auth/product-session",
      {
        credentials: "include",
        cache: "no-store",
        signal: expect.anything(),
        headers: { Accept: "application/json" },
      },
    );
  });

  test.each([
    [401, "unauthenticated"],
    [403, "forbidden"],
  ])("maps HTTP %s to %s", async (status, expected) => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status });
    await expect(loadAmbuAssistSession()).resolves.toMatchObject({
      status: expected,
    });
  });

  test("denies a valid identity without AmbuAssist entitlement", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ...validResponse,
        entitlements: { ambuassist: { granted: false } },
      }),
    });
    await expect(loadAmbuAssistSession()).resolves.toMatchObject({
      status: "forbidden",
    });
  });

  test("fails closed on malformed Portal responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user: {}, entitlements: {} }),
    });
    await expect(loadAmbuAssistSession()).resolves.toMatchObject({
      status: "error",
    });
  });
});

describe("AmbuAssist original URL handling", () => {
  test("preserves a protected deep path, query and fragment through onboarding URL", () => {
    const { validatedAppReturnUrl } = require("./portalSession.web");
    const requested =
      "https://ambuassist.synapsestudio.dk/tools/trombolysis?mode=adult&value=1%202#result";
    const onboarding = new URL(
      getPortalLoginUrl(validatedAppReturnUrl(requested)),
    );
    expect(onboarding.pathname).toBe("/auth/ambuassist");
    expect(onboarding.searchParams.get("returnTo")).toBe(requested);
  });
  test.each([
    "https://evil.test/",
    "//evil.test",
    "https://ambuassist.synapsestudio.dk.evil.test/",
    "https://u@ambuassist.synapsestudio.dk/",
  ])("rejects non-application return %s", (url) => {
    const { validatedAppReturnUrl } = require("./portalSession.web");
    expect(validatedAppReturnUrl(url)).toBe(
      "https://ambuassist.synapsestudio.dk/",
    );
  });
  test("refuses an unverified server identity even with an entitlement", async () => {
    const old = global.fetch;
    global.fetch = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          ...validResponse,
          user: { ...validResponse.user, emailVerified: false },
        }),
      });
    try {
      expect((await loadAmbuAssistSession()).status).toBe("forbidden");
    } finally {
      global.fetch = old;
    }
  });
});

describe("Pre-router URL capture", () => {
  test("does not replace the original URL with Expo's rewritten hash/query", () => {
    const requested = "https://ambuassist.synapsestudio.dk/tools/trombolysis?mode=adult#result";
    const originalWindow = global.window;
    const replaceState = jest.fn();
    Object.defineProperty(global, "window", { configurable: true, writable: true, value: {
      location: { href: "https://ambuassist.synapsestudio.dk/tools/trombolysis#result?mode=adult", pathname: "/tools/trombolysis" },
      history: { state: { key: "router-state" }, replaceState },
    } });
    jest.doMock("./initialUrl", () => ({ initialBrowserUrl: requested }));
    try {
      jest.isolateModules(() => {
        const client = require("./portalSession.web");
        client.captureRequestedUrl();
        expect(new URL(client.getPortalLoginUrl()).searchParams.get("returnTo")).toBe(requested);
        client.restoreRequestedUrl();
        expect(replaceState).toHaveBeenCalledWith({ key: "router-state" }, "", requested);
      });
    } finally {
      jest.dontMock("./initialUrl");
      Object.defineProperty(global, "window", { configurable: true, writable: true, value: originalWindow });
    }
  });
});
