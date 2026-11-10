import {
  hasActiveAmbuAssistEntitlement,
  parsePortalSession,
} from "./types";

const response = {
  user: {
    id: "user-1",
    email: "clinician@example.dk",
    emailVerified: true,
    bamId: "ABCD1234",
  },
  entitlements: {
    ambuassist: { granted: true, source: "manual" },
    ppj: { granted: false },
  },
  expiresAt: "2099-01-01T00:00:00.000Z",
};

describe("Portal session contract", () => {
  test("accepts an explicit AmbuAssist entitlement", () => {
    const session = parsePortalSession(response);
    expect(session).not.toBeNull();
    expect(hasActiveAmbuAssistEntitlement(session!)).toBe(true);
    expect(session?.identity.bamId).toBe("ABCD1234");
  });

  test("does not infer access from email or BAM metadata", () => {
    const session = parsePortalSession({
      ...response,
      entitlements: { ambuassist: { granted: false } },
    });
    expect(hasActiveAmbuAssistEntitlement(session!)).toBe(false);
  });

  test("rejects malformed entitlement payloads", () => {
    expect(
      parsePortalSession({ ...response, entitlements: { ambuassist: true } }),
    ).toBeNull();
  });

  test("denies an expired Portal session", () => {
    const session = parsePortalSession({
      ...response,
      expiresAt: "2020-01-01T00:00:00.000Z",
    });
    expect(hasActiveAmbuAssistEntitlement(session!)).toBe(false);
  });
});
