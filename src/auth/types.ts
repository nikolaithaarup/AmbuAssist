export type ProductEntitlementKey =
  | "ambuassist"
  | "ppj"
  | "facilitator"
  | "admin"
  | (string & {});

export type ProductEntitlement = {
  granted: boolean;
  source?: "role" | "domain-policy" | "manual" | "subscription" | string;
  expiresAt?: string | null;
};

export type PortalIdentity = {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName?: string | null;
  /** Optional profile metadata only. It is never an authentication factor. */
  bamId?: string | null;
};

export type AmbuAssistSession = {
  identity: PortalIdentity;
  entitlements: { [key: string]: ProductEntitlement | undefined };
  expiresAt: string;
  assurance: "portal-session" | "legacy-native-profile";
};

export type SessionLookupResult =
  | { status: "authorized"; session: AmbuAssistSession }
  | { status: "unauthenticated" }
  | { status: "forbidden"; identity?: PortalIdentity }
  | { status: "error"; message: string };

export type AuthState =
  | { status: "checking" }
  | { status: "authorized"; session: AmbuAssistSession }
  | { status: "unauthenticated" }
  | { status: "forbidden"; identity?: PortalIdentity }
  | { status: "error"; message: string };

export function hasActiveAmbuAssistEntitlement(
  session: AmbuAssistSession,
  now = Date.now(),
): boolean {
  if (
    Number.isNaN(Date.parse(session.expiresAt)) ||
    Date.parse(session.expiresAt) <= now
  ) {
    return false;
  }
  const entitlement = session.entitlements.ambuassist;
  if (!entitlement?.granted) return false;
  if (!entitlement.expiresAt) return true;
  return Date.parse(entitlement.expiresAt) > now;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parsePortalSession(value: unknown): AmbuAssistSession | null {
  if (!isObject(value) || !isObject(value.user) || !isObject(value.entitlements)) {
    return null;
  }

  const user = value.user;
  if (
    typeof user.id !== "string" ||
    typeof user.email !== "string" ||
    typeof user.emailVerified !== "boolean" ||
    typeof value.expiresAt !== "string"
  ) {
    return null;
  }

  const entitlements: Record<string, ProductEntitlement | undefined> = {};
  for (const [key, entitlement] of Object.entries(value.entitlements)) {
    if (!isObject(entitlement) || typeof entitlement.granted !== "boolean") {
      return null;
    }
    entitlements[key] = {
      granted: entitlement.granted,
      source:
        typeof entitlement.source === "string" ? entitlement.source : undefined,
      expiresAt:
        typeof entitlement.expiresAt === "string" || entitlement.expiresAt === null
          ? entitlement.expiresAt
          : undefined,
    };
  }

  return {
    identity: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName:
        typeof user.displayName === "string" || user.displayName === null
          ? user.displayName
          : undefined,
      bamId:
        typeof user.bamId === "string" || user.bamId === null
          ? user.bamId
          : undefined,
    },
    entitlements,
    expiresAt: value.expiresAt,
    assurance: "portal-session",
  };
}
