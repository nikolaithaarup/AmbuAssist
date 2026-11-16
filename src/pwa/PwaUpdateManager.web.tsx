import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "expo-router";
import { getActiveArrestSession } from "../services/cardiacResusStorage";
import { PwaUpdateBanner } from "./PwaUpdateBanner.web";
import {
  CURRENT_PWA_BUILD_ID,
  fetchAvailablePwaBuildId,
  isSafePwaUpdatePath,
  shouldApplyPwaUpdate,
} from "./update";

const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export default function PwaUpdateManager() {
  const pathname = usePathname();
  const checkingRef = useRef(false);
  const [availableBuildId, setAvailableBuildId] = useState<string | null>(null);
  const [dismissedBuildId, setDismissedBuildId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const checkForUpdate = useCallback(async () => {
    if (checkingRef.current || !isSafePwaUpdatePath(pathname)) return;
    checkingRef.current = true;
    try {
      const buildId = await fetchAvailablePwaBuildId();
      if (!buildId) return;
      if (buildId === CURRENT_PWA_BUILD_ID) {
        setAvailableBuildId(null);
        return;
      }

      // Never offer a reload while there is a locally recorded active arrest.
      const hasActiveArrestSession = Boolean(await getActiveArrestSession());
      setAvailableBuildId(
        shouldApplyPwaUpdate({
          availableBuildId: buildId,
          pathname,
          hasActiveArrestSession,
        })
          ? buildId
          : null,
      );
    } catch {
      // An unavailable session store is not proof that it is safe to reload.
      setAvailableBuildId(null);
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
    const interval = window.setInterval(() => void checkForUpdate(), UPDATE_CHECK_INTERVAL_MS);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [checkForUpdate]);

  const applyUpdate = useCallback(async () => {
    if (!availableBuildId || updating || !isSafePwaUpdatePath(pathname)) return;
    setUpdating(true);
    try {
      // Re-check immediately before the user-triggered reload. No automatic
      // refresh, no storage clearing and no interrupted clinical workflow.
      const currentBuildId = await fetchAvailablePwaBuildId();
      if (!currentBuildId || currentBuildId === CURRENT_PWA_BUILD_ID) {
        setAvailableBuildId(null);
        return;
      }

      const hasActiveArrestSession = Boolean(await getActiveArrestSession());
      if (!shouldApplyPwaUpdate({
        availableBuildId: currentBuildId,
        pathname,
        hasActiveArrestSession,
      })) {
        setAvailableBuildId(null);
        return;
      }

      window.location.reload();
    } catch {
      // Stay on the current version if the network or local storage fails.
      setAvailableBuildId(null);
    } finally {
      setUpdating(false);
    }
  }, [availableBuildId, pathname, updating]);

  const showBanner =
    isSafePwaUpdatePath(pathname) &&
    availableBuildId !== null &&
    availableBuildId !== dismissedBuildId;

  return showBanner ? (
    <PwaUpdateBanner
      updating={updating}
      onUpdate={() => void applyUpdate()}
      onDismiss={() => setDismissedBuildId(availableBuildId)}
    />
  ) : null;
}
