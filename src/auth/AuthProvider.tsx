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
  rememberOfflineAccess,
  hasOfflineAccess,
  clearOfflineAccess,
  logoutAmbuAssistDevice,
} from "./portalSession";
import { offlineAmbuAssistSession, type AuthState } from "./types";
import { recordAppOpen } from "../analytics/usage";
import { getSessionRefreshDelay } from "./sessionRefresh";

type AuthContextValue = {
  state: AuthState;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  authorizeLegacyNativeProfile: (bamId: string) => Promise<void>;
  portalLoginUrl: (returnTo?: string) => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ status: "checking" });
  const shouldRecordOpen =
    state.status === "authorized" &&
    state.session.assurance === "portal-session";

  const stateRef = useRef<AuthState>(state);
  const lookupVersion = useRef(0);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const refresh = useCallback(async () => {
    const previous = stateRef.current;
    captureRequestedUrl(previous.status === "authorized");
    const version = ++lookupVersion.current;
    if (previous.status !== "authorized") setState({ status: "checking" });
    const result = await loadAmbuAssistSession();
    if (version !== lookupVersion.current) return;
    if (result.status === "authorized") {
      await rememberOfflineAccess();
      setState(result);
      return;
    }
    if (result.status === "error") {
      if (previous.status === "authorized") return;
      if (await hasOfflineAccess()) {
        setState({ status: "authorized", session: offlineAmbuAssistSession() });
        return;
      }
      setState(result);
      return;
    }
    await clearOfflineAccess();
    setState(result);
  }, []);

  const logout = useCallback(async () => {
    await logoutAmbuAssistDevice();
    lookupVersion.current += 1;
    await clearOfflineAccess();
    setState({ status: "unauthenticated" });
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
      getSessionRefreshDelay(expiry),
    );
    return () => clearTimeout(timer);
  }, [state, refresh]);

  useEffect(() => {
    if (state.status === "checking") return;
    const timer = setTimeout(restoreRequestedUrl, 0);
    return () => clearTimeout(timer);
  }, [state.status]);

  useEffect(() => {
    if (shouldRecordOpen) void recordAppOpen();
  }, [shouldRecordOpen]);

  const value = useMemo(
    () => ({
      state,
      refresh,
      logout,
      authorizeLegacyNativeProfile,
      portalLoginUrl: getPortalLoginUrl,
    }),
    [state, refresh, logout, authorizeLegacyNativeProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
