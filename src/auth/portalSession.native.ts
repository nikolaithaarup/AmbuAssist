import AsyncStorage from "@react-native-async-storage/async-storage";

import type { SessionLookupResult } from "./types";

export const BAM_ID_PATTERN = /^[A-Z]{4}[0-9]{4}$/;
export const BAM_ID_STORAGE_KEY = "ambuassist:bamId";

export async function loadAmbuAssistSession(): Promise<SessionLookupResult> {
  try {
    const bamId = await AsyncStorage.getItem(BAM_ID_STORAGE_KEY);
    if (!bamId || !BAM_ID_PATTERN.test(bamId)) {
      return { status: "unauthenticated" };
    }

    return {
      status: "authorized",
      session: {
        identity: {
          id: `legacy-native:${bamId}`,
          email: "",
          emailVerified: false,
          bamId,
        },
        entitlements: {
          ambuassist: { granted: true, source: "legacy-native-profile" },
        },
        expiresAt: "9999-12-31T23:59:59.999Z",
        assurance: "legacy-native-profile",
      },
    };
  } catch {
    return { status: "error", message: "Kunne ikke læse den lokale profil." };
  }
}

export async function saveLegacyBamProfile(bamId: string): Promise<void> {
  if (!BAM_ID_PATTERN.test(bamId)) {
    throw new Error("INVALID_BAM_ID");
  }
  await AsyncStorage.setItem(BAM_ID_STORAGE_KEY, bamId);
}

export function getPortalLoginUrl(): string {
  return "https://portal.synapsestudio.dk/login";
}
