import {
  hasActiveAmbuAssistEntitlement,
  parsePortalSession,
  type SessionLookupResult,
} from "./types";

const DEFAULT_SESSION_URL =
  "https://portal.synapsestudio.dk/api/auth/product-session";
const DEFAULT_LOGIN_URL = "https://portal.synapsestudio.dk/login";
const DEFAULT_APP_ORIGIN = "https://ambuassist.synapsestudio.dk";

export async function loadAmbuAssistSession(): Promise<SessionLookupResult> {
  try {
    const response = await fetch(
      process.env.EXPO_PUBLIC_PORTAL_SESSION_URL ?? DEFAULT_SESSION_URL,
      {
        credentials: "include",
        headers: { Accept: "application/json" },
      },
    );

    if (response.status === 401) return { status: "unauthenticated" };
    if (response.status === 403) return { status: "forbidden" };
    if (!response.ok) {
      return {
        status: "error",
        message: `SynapsePortal svarede med HTTP ${response.status}.`,
      };
    }

    const session = parsePortalSession(await response.json());
    if (!session) {
      return {
        status: "error",
        message: "SynapsePortal returnerede et ugyldigt sessionssvar.",
      };
    }

    if (!hasActiveAmbuAssistEntitlement(session)) {
      return { status: "forbidden", identity: session.identity };
    }

    return { status: "authorized", session };
  } catch {
    return {
      status: "error",
      message: "Forbindelsen til SynapsePortal kunne ikke oprettes.",
    };
  }
}

export async function saveLegacyBamProfile(): Promise<never> {
  throw new Error("BAM-ID cannot authorize the web application.");
}

export function getPortalLoginUrl(returnTo?: string): string {
  const url = new URL(
    process.env.EXPO_PUBLIC_PORTAL_LOGIN_URL ?? DEFAULT_LOGIN_URL,
  );
  url.searchParams.set(
    "returnTo",
    returnTo ??
      `${process.env.EXPO_PUBLIC_APP_ORIGIN || DEFAULT_APP_ORIGIN}/`,
  );
  return url.toString();
}
