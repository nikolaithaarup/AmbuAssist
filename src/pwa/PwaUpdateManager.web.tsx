import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "expo-router";
import { getActiveArrestSession } from "../services/cardiacResusStorage";
import {
  CURRENT_PWA_BUILD_ID,
  fetchAvailablePwaBuildId,
  isSafePwaUpdatePath,
  shouldApplyPwaUpdate,
} from "./update";

const RELOAD_TARGET_KEY = "ambuassist.pwa.reload-target.v1";

function readReloadTarget(): string | null {
  try {
    return window.sessionStorage.getItem(RELOAD_TARGET_KEY);
  } catch {
    return null;
  }
}

function rememberReloadTarget(buildId: string): void {
  try {
    window.sessionStorage.setItem(RELOAD_TARGET_KEY, buildId);
  } catch {
    // A storage restriction must not block normal app use or updates.
  }
}

function forgetCompletedReload(buildId: string): void {
  try {
    if (window.sessionStorage.getItem(RELOAD_TARGET_KEY) === buildId) {
      window.sessionStorage.removeItem(RELOAD_TARGET_KEY);
    }
  } catch {
    // Session storage is optional; the build-id comparison remains authoritative.
  }
}

export default function PwaUpdateManager() {
  const pathname = usePathname();
  const checkingRef = useRef(false);

  const checkForUpdate = useCallback(async () => {
    if (checkingRef.current || !isSafePwaUpdatePath(pathname)) return;
    checkingRef.current = true;
    try {
      const availableBuildId = await fetchAvailablePwaBuildId();
      if (!availableBuildId) return;
      if (availableBuildId === CURRENT_PWA_BUILD_ID) {
        forgetCompletedReload(availableBuildId);
        return;
      }
      if (readReloadTarget() === availableBuildId) return;

      const hasActiveArrestSession = Boolean(await getActiveArrestSession());
      if (
        !shouldApplyPwaUpdate({
          availableBuildId,
          pathname,
          hasActiveArrestSession,
        })
      ) {
        return;
      }

      rememberReloadTarget(availableBuildId);
      window.location.reload();
    } finally {
      checkingRef.current = false;
    }
  }, [pathname]);

  useEffect(() => {
    void checkForUpdate();
    const onOnline = () => void checkForUpdate();
    const onPageShow = () => void checkForUpdate();
    const onVisible = () => {
      if (document.visibilityState === "visible") void checkForUpdate();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [checkForUpdate]);

  return null;
}
