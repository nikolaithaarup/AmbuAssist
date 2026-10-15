import { initialBrowserUrl } from "./initialUrl";
import {
  hasActiveAmbuAssistEntitlement,
  parsePortalSession,
  type SessionLookupResult,
} from "./types";

const DEFAULT_SESSION_URL =
  "https://portal.synapsestudio.dk/api/auth/product-session";
const DEFAULT_LOGIN_URL = "https://portal.synapsestudio.dk/auth/ambuassist";
const DEFAULT_APP_ORIGIN = "https://ambuassist.synapsestudio.dk";

export async function loadAmbuAssistSession(): Promise<SessionLookupResult> {
  try {
    const response = await fetch(
      process.env.EXPO_PUBLIC_PORTAL_SESSION_URL ?? DEFAULT_SESSION_URL,
      {
        credentials: "include",
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
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

function currentBrowserOrigin(): string | undefined {
  if (typeof window === "undefined" || !window.location) return undefined;
  try {
    return new URL(window.location.href).origin;
  } catch {
    return undefined;
  }
}

function sameOriginBrowserUrl(value?: string): string | undefined {
  const origin = currentBrowserOrigin();
  if (!origin || !value) return undefined;
  try {
    const url = new URL(value, `${origin}/`);
    if (
      url.origin !== origin ||
      url.username ||
      url.password ||
      !["http:", "https:"].includes(url.protocol)
    ) {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

let requestedUrl: string | undefined = sameOriginBrowserUrl(initialBrowserUrl);
export function validatedAppReturnUrl(value?: string): string {
  const origin = process.env.EXPO_PUBLIC_APP_ORIGIN || DEFAULT_APP_ORIGIN;
  try {
    const url = new URL(value ?? origin + "/");
    if (url.origin === origin && !url.username && !url.password)
      return url.toString();
  } catch {
    /* Fall back to the configured application entry point. */
  }
  return origin + "/";
}
export function captureRequestedUrl(force = false): void {
  if (
    (force || !requestedUrl) &&
    typeof window !== "undefined" &&
    window.location
  )
    requestedUrl = sameOriginBrowserUrl(window.location.href);
}
export function getPortalLoginUrl(returnTo?: string): string {
  const url = new URL(
    process.env.EXPO_PUBLIC_PORTAL_LOGIN_URL ?? DEFAULT_LOGIN_URL,
  );
  url.searchParams.set(
    "returnTo",
    validatedAppReturnUrl(returnTo ?? requestedUrl),
  );
  return url.toString();
}

/** Expo 54 can serialize a hash before its query; retain the browser's original URL after mounting. */
export function restoreRequestedUrl(): void {
  if (typeof window === "undefined") return;
  const safeRequestedUrl = sameOriginBrowserUrl(requestedUrl);
  if (!safeRequestedUrl) return;
  const requested = new URL(safeRequestedUrl);
  if (window.location.pathname !== requested.pathname) return;
  window.history.replaceState(window.history.state, "", safeRequestedUrl);
}
