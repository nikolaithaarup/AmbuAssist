import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getPortalLoginUrl,
  captureRequestedUrl,
  restoreRequestedUrl,
  loadAmbuAssistSession,
  saveLegacyBamProfile,
} from "./portalSession";
import type { AuthState } from "./types";

type AuthContextValue = {
  state: AuthState;
  refresh: () => Promise<void>;
  authorizeLegacyNativeProfile: (bamId: string) => Promise<void>;
  portalLoginUrl: (returnTo?: string) => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ status: "checking" });

  const wasAuthorized = useRef(false);
  const lookupVersion = useRef(0);
  const refresh = useCallback(async () => {
    captureRequestedUrl(wasAuthorized.current);
    wasAuthorized.current = false;
    const version = ++lookupVersion.current;
    setState({ status: "checking" });
    const result = await loadAmbuAssistSession();
    if (version === lookupVersion.current) {
      wasAuthorized.current = result.status === "authorized";
      setState(result);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const authorizeLegacyNativeProfile = useCallback(
    async (bamId: string) => {
      await saveLegacyBamProfile(bamId);
      await refresh();
    },
    [refresh],
  );
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  useEffect(() => {
    if (
      state.status !== "authorized" ||
      state.session.assurance !== "portal-session"
    )
      return;
    const expiry = Math.min(
      Date.parse(state.session.expiresAt),
      state.session.entitlements.ambuassist?.expiresAt
        ? Date.parse(state.session.entitlements.ambuassist.expiresAt)
        : Infinity,
    );
    const timer = setTimeout(
      () => void refresh(),
      Math.max(0, expiry - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [state, refresh]);

  useEffect(() => {
    if (state.status === "checking") return;
    const timer = setTimeout(restoreRequestedUrl, 0);
    return () => clearTimeout(timer);
  }, [state.status]);

  const value = useMemo(
    () => ({
      state,
      refresh,
      authorizeLegacyNativeProfile,
      portalLoginUrl: getPortalLoginUrl,
    }),
    [state, refresh, authorizeLegacyNativeProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
