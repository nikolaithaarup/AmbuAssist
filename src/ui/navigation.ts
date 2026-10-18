export type BackRouter = {
  back: () => void;
  canGoBack: () => boolean;
  replace: (path: "/home") => void;
};

export type BackNavigationGate = {
  pendingFromPath: string | null;
};

export function navigateBackOrFallback(
  router: BackRouter,
  fallbackPath: "/home" = "/home",
) {
  if (router.canGoBack()) {
    router.back();
    return "back" as const;
  }

  router.replace(fallbackPath);
  return "fallback" as const;
}

export function beginBackNavigation(
  gate: BackNavigationGate,
  platform: string,
  pathname: string,
  navigate: () => void,
) {
  if (platform === "web" && gate.pendingFromPath === pathname) return false;
  if (platform === "web") gate.pendingFromPath = pathname;
  navigate();
  return true;
}

export function releaseBackNavigationOnRouteCommit(
  gate: BackNavigationGate,
  pathname: string,
) {
  if (gate.pendingFromPath && gate.pendingFromPath !== pathname) {
    gate.pendingFromPath = null;
  }
}
