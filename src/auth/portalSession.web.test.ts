import {
  getPortalLoginUrl,
  loadAmbuAssistSession,
} from "./portalSession.web";

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
