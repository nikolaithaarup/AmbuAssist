import { loadAmbuAssistSession } from "./portalSession.web";

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

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
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
