import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPortalLoginUrl,
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

  const refresh = useCallback(async () => {
    setState({ status: "checking" });
    setState(await loadAmbuAssistSession());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const authorizeLegacyNativeProfile = useCallback(async (bamId: string) => {
    await saveLegacyBamProfile(bamId);
    setState(await loadAmbuAssistSession());
  }, []);

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
