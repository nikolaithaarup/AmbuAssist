import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AccessibilityInfo, Animated, Easing, Platform } from "react-native";

export type RouteDirection = "forward" | "back";

export const WEB_ROUTE_MOTION = {
  distance: 72,
  duration: 310,
  initialOpacity: 0.78,
} as const;

export const WEB_VIEW_TRANSITION_MOTION = {
  duration: 320,
  incomingDistance: 72,
  outgoingDistance: 40,
} as const;

type WebViewTransition = {
  finished: Promise<void>;
  skipTransition?: () => void;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (
    update: () => void | Promise<void>,
  ) => WebViewTransition;
};

type PendingRouteCommit = {
  fromPath: string;
  targetPath?: string;
  resolve: () => void;
  promise: Promise<void>;
};

const webMotionQuery =
  Platform.OS === "web" && typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

let cachedReducedMotion = webMotionQuery?.matches ?? false;
let reducedMotionInitialized = false;
const reducedMotionListeners = new Set<(enabled: boolean) => void>();
let activeWebViewTransition: WebViewTransition | null = null;
let activeWebViewTransitionId = 0;
let pendingRouteCommit: PendingRouteCommit | null = null;
let activeFallbackLayer: HTMLElement | null = null;
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function publishReducedMotion(enabled: boolean) {
  if (cachedReducedMotion === enabled) return;
  cachedReducedMotion = enabled;
  if (enabled) {
    activeWebViewTransition?.skipTransition?.();
    pendingRouteCommit?.resolve();
    removeFallbackLayer();
  }
  reducedMotionListeners.forEach((listener) => listener(enabled));
}

function initializeReducedMotion() {
  if (reducedMotionInitialized) return;
  reducedMotionInitialized = true;

  if (webMotionQuery) {
    publishReducedMotion(webMotionQuery.matches);
    const handleMotionChange = (event: MediaQueryListEvent) => {
      publishReducedMotion(event.matches);
    };
    if (typeof webMotionQuery.addEventListener === "function") {
      webMotionQuery.addEventListener("change", handleMotionChange);
    } else {
      webMotionQuery.addListener(handleMotionChange);
    }
    return;
  }

  void AccessibilityInfo.isReduceMotionEnabled()
    .then(publishReducedMotion)
    .catch(() => {});
  AccessibilityInfo.addEventListener("reduceMotionChanged", publishReducedMotion);
}

export function useReducedMotionPreference(enabled = true) {
  const [reducedMotion, setReducedMotion] = useState(cachedReducedMotion);

  useEffect(() => {
    if (!enabled) return;
    initializeReducedMotion();
    reducedMotionListeners.add(setReducedMotion);

    return () => {
      reducedMotionListeners.delete(setReducedMotion);
    };
  }, [enabled]);

  return enabled && reducedMotion;
}

export function usePressFeedback(pressedScale = 0.97) {
  const reducedMotion = useReducedMotionPreference(Platform.OS === "web");
  const scale = useRef(new Animated.Value(1)).current;
  const perceptibleScale =
    Platform.OS === "web" ? Math.min(pressedScale, 0.97) : pressedScale;

  const animateTo = useCallback(
    (value: number) => {
      scale.stopAnimation();

      if (reducedMotion) {
        scale.setValue(1);
        return;
      }

      if (value < 1) {
        Animated.timing(scale, {
          toValue: perceptibleScale,
          duration: 70,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== "web",
          isInteraction: false,
        }).start();
        return;
      }

      Animated.spring(scale, {
        toValue: 1,
        speed: 24,
        bounciness: 4,
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      }).start();
    },
    [perceptibleScale, reducedMotion, scale],
  );

  useEffect(() => {
    if (reducedMotion) {
      scale.stopAnimation();
      scale.setValue(1);
    }
  }, [reducedMotion, scale]);

  return {
    animatedStyle: { transform: [{ scale }] },
    onPressIn: () => animateTo(pressedScale),
    onPressOut: () => animateTo(1),
  };
}

export function useStateChangeFeedback(
  value: unknown,
  peakScale = 1.1,
  enabled = Platform.OS === "web",
) {
  const reducedMotion = useReducedMotionPreference(enabled);
  const scale = useRef(new Animated.Value(1)).current;
  const previousValue = useRef(value);

  useEffect(() => {
    if (!enabled || reducedMotion) {
      previousValue.current = value;
      scale.stopAnimation();
      scale.setValue(1);
      return;
    }

    if (Object.is(previousValue.current, value)) return;
    previousValue.current = value;
    scale.stopAnimation();

    scale.setValue(0.82);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: peakScale,
        duration: 105,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 24,
        bounciness: 5,
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      }),
    ]).start();

    return () => scale.stopAnimation();
  }, [enabled, peakScale, reducedMotion, scale, value]);

  return { transform: [{ scale }] };
}

let pendingWebRouteDirection: RouteDirection | null = null;

export function markNextWebRouteDirection(direction: RouteDirection) {
  if (Platform.OS === "web") pendingWebRouteDirection = direction;
}

export function canUseWebViewTransitions(
  platform: string,
  reducedMotion: boolean,
  startViewTransition: unknown,
) {
  return (
    platform === "web" &&
    !reducedMotion &&
    typeof startViewTransition === "function"
  );
}

function resolvePendingRouteCommit(pathname?: string) {
  const pending = pendingRouteCommit;
  if (!pending) return false;

  const routeCommitted = pathname
    ? pending.targetPath
      ? pathname === pending.targetPath
      : pathname !== pending.fromPath
    : true;
  if (!routeCommitted) return false;

  pendingRouteCommit = null;
  pending.resolve();
  return true;
}

function createPendingRouteCommit(targetPath?: string) {
  resolvePendingRouteCommit();
  let resolve = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  const pending = {
    fromPath:
      typeof window === "undefined" ? "" : window.location.pathname,
    targetPath,
    resolve,
    promise,
  };
  pendingRouteCommit = pending;
  return pending;
}

function waitForRouteCommitTimeout() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 240);
  });
}

function removeFallbackLayer(layer = activeFallbackLayer) {
  if (!layer) return;
  if (layer === activeFallbackLayer) activeFallbackLayer = null;
  layer.remove();
}

function animateFallbackOutgoingLayer(direction: RouteDirection) {
  if (
    Platform.OS !== "web" ||
    typeof document === "undefined" ||
    typeof window === "undefined" ||
    (webMotionQuery?.matches ?? cachedReducedMotion)
  ) {
    return;
  }

  const source = document.querySelector<HTMLElement>(
    '[data-testid="web-route-transition"]',
  );
  if (!source || typeof source.animate !== "function") return;

  removeFallbackLayer();
  const rect = source.getBoundingClientRect();
  const layer = source.cloneNode(true) as HTMLElement;
  layer.removeAttribute("data-testid");
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${Math.max(rect.height, window.innerHeight)}px`,
    margin: "0",
    overflow: "hidden",
    pointerEvents: "none",
    transformOrigin: "center center",
    willChange: "transform, opacity",
    zIndex: "2147483000",
  });
  document.body.appendChild(layer);
  activeFallbackLayer = layer;

  const distance = Math.min(56, Math.max(36, window.innerWidth * 0.11));
  const translate = direction === "forward" ? -distance : distance;
  const animation = layer.animate(
    [
      { opacity: 1, transform: "translateX(0) scale(1)" },
      {
        opacity: 0.72,
        transform: `translateX(${translate}px) scale(0.985)`,
      },
    ],
    {
      duration: WEB_VIEW_TRANSITION_MOTION.duration,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    },
  );
  void animation.finished.catch(() => {}).finally(() => removeFallbackLayer(layer));
  setTimeout(() => removeFallbackLayer(layer), WEB_VIEW_TRANSITION_MOTION.duration + 80);
}

function startWebViewTransition(
  direction: RouteDirection,
  navigate?: () => void,
  targetPath?: string,
) {
  if (Platform.OS !== "web" || typeof document === "undefined") return false;

  initializeReducedMotion();
  const viewTransitionDocument = document as ViewTransitionDocument;
  if (
    !canUseWebViewTransitions(
      Platform.OS,
      webMotionQuery?.matches ?? cachedReducedMotion,
      viewTransitionDocument.startViewTransition,
    )
  ) {
    return false;
  }

  activeWebViewTransition?.skipTransition?.();
  resolvePendingRouteCommit();

  const transitionId = activeWebViewTransitionId + 1;
  activeWebViewTransitionId = transitionId;
  document.documentElement.dataset.ambuRouteDirection = direction;
  const commit = createPendingRouteCommit(targetPath);
  let navigationStarted = false;

  try {
    const transition = viewTransitionDocument.startViewTransition!(async () => {
      if (navigate) {
        navigationStarted = true;
        navigate();
      }

      // Wait for Expo Router's pathname commit so the new snapshot is actually
      // different from the old one. Two animation frames were too short on
      // mobile Safari and could capture the outgoing screen twice.
      await Promise.race([commit.promise, waitForRouteCommitTimeout()]);
      resolvePendingRouteCommit();
    });
    activeWebViewTransition = transition;

    void transition.finished
      .catch(() => {})
      .finally(() => {
        if (activeWebViewTransitionId !== transitionId) return;
        activeWebViewTransition = null;
        resolvePendingRouteCommit();
        delete document.documentElement.dataset.ambuRouteDirection;
      });
    return true;
  } catch {
    resolvePendingRouteCommit();
    delete document.documentElement.dataset.ambuRouteDirection;
    if (navigate && !navigationStarted) navigate();
    return navigationStarted;
  }
}

export function runWebRouteTransition(
  direction: RouteDirection,
  navigate: () => void,
) {
  markNextWebRouteDirection(direction);
  if (!startWebViewTransition(direction, navigate)) {
    animateFallbackOutgoingLayer(direction);
    navigate();
  }
}

function pathDepth(pathname: string) {
  return pathname.split("/").filter(Boolean).length;
}

export function resolveWebRouteDirection(
  previousPath: string,
  pathname: string,
  browserDirection: RouteDirection | null,
  pendingDirection: RouteDirection | null,
): RouteDirection {
  if (pendingDirection) return pendingDirection;
  if (browserDirection) return browserDirection;
  return pathDepth(pathname) < pathDepth(previousPath) ? "back" : "forward";
}

export function useWebRouteTransition(pathname: string, enabled = true) {
  const reducedMotion = useReducedMotionPreference(enabled);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const previousPath = useRef(pathname);
  const historyIds = useRef<string[]>([]);
  const historyIndex = useRef(-1);

  const readBrowserDirection = useCallback(() => {
    if (!enabled || typeof window === "undefined") return null;
    const historyId = window.history.state?.id;
    if (typeof historyId !== "string") return null;

    const knownIndex = historyIds.current.indexOf(historyId);
    if (historyIndex.current < 0) {
      historyIds.current = [historyId];
      historyIndex.current = 0;
      return null;
    }
    if (knownIndex >= 0) {
      if (knownIndex === historyIndex.current) return null;
      const direction: RouteDirection =
        knownIndex < historyIndex.current ? "back" : "forward";
      historyIndex.current = knownIndex;
      return direction;
    }

    historyIds.current = historyIds.current.slice(0, historyIndex.current + 1);
    historyIds.current.push(historyId);
    historyIndex.current = historyIds.current.length - 1;
    return "forward" as const;
  }, [enabled]);

  useEffect(() => {
    if (
      !enabled ||
      typeof window === "undefined" ||
      typeof window.addEventListener !== "function"
    ) {
      return;
    }

    const handlePopState = () => {
      const direction = readBrowserDirection() ?? "back";
      pendingWebRouteDirection = direction;
      if (activeWebViewTransition) return;
      if (!startWebViewTransition(direction, undefined, window.location.pathname)) {
        animateFallbackOutgoingLayer(direction);
      }
    };

    window.addEventListener("popstate", handlePopState, { capture: true });
    return () =>
      window.removeEventListener("popstate", handlePopState, { capture: true });
  }, [enabled, readBrowserDirection]);

  useBrowserLayoutEffect(() => {
    const browserDirection = readBrowserDirection();

    const previous = previousPath.current;
    if (previous === pathname) return;
    previousPath.current = pathname;
    const explicitDirection = pendingWebRouteDirection;
    pendingWebRouteDirection = null;
    const usedViewTransition =
      resolvePendingRouteCommit(pathname) || !!activeWebViewTransition;

    opacity.stopAnimation();
    translateX.stopAnimation();

    if (!enabled || reducedMotion || usedViewTransition) {
      opacity.setValue(1);
      translateX.setValue(0);
      return;
    }

    const direction = resolveWebRouteDirection(
      previous,
      pathname,
      browserDirection,
      explicitDirection,
    );

    opacity.setValue(WEB_ROUTE_MOTION.initialOpacity);
    translateX.setValue(
      direction === "back"
        ? -WEB_ROUTE_MOTION.distance
        : WEB_ROUTE_MOTION.distance,
    );

    const start = () => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: WEB_ROUTE_MOTION.duration,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: false,
          isInteraction: false,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: WEB_ROUTE_MOTION.duration,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: false,
          isInteraction: false,
        }),
      ]).start();
    };

    if (typeof requestAnimationFrame !== "function") {
      start();
      return;
    }

    // Keep the translated start state on screen for one paint. Starting the
    // timing in the same commit can be coalesced by mobile Safari and appear
    // as an instantaneous route replacement.
    const frame = requestAnimationFrame(start);
    return () => cancelAnimationFrame(frame);
  }, [
    enabled,
    opacity,
    pathname,
    readBrowserDirection,
    reducedMotion,
    translateX,
  ]);

  useEffect(() => {
    if (!reducedMotion) return;
    opacity.stopAnimation();
    translateX.stopAnimation();
    opacity.setValue(1);
    translateX.setValue(0);
  }, [opacity, reducedMotion, translateX]);

  return {
    opacity,
    transform: [{ translateX }],
  };
}
