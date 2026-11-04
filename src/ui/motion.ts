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
  distance: 6,
  duration: 190,
  exitDuration: 110,
  totalDuration: 260,
  initialOpacity: 0,
} as const;

export const PRESS_MOTION = {
  minimumScale: 0.96,
  maximumScale: 0.97,
  defaultScale: 0.965,
  pressDuration: 0,
} as const;

const webMotionQuery =
  Platform.OS === "web" && typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

let cachedReducedMotion = webMotionQuery?.matches ?? false;
let reducedMotionInitialized = false;
const reducedMotionListeners = new Set<(enabled: boolean) => void>();
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function publishReducedMotion(enabled: boolean) {
  if (cachedReducedMotion === enabled) return;
  cachedReducedMotion = enabled;
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

export function usePressFeedback(
  pressedScale: number = PRESS_MOTION.defaultScale,
) {
  const reducedMotion = useReducedMotionPreference(true);
  const scale = useRef(new Animated.Value(1)).current;
  const perceptibleScale = Math.max(
    PRESS_MOTION.minimumScale,
    Math.min(pressedScale, PRESS_MOTION.maximumScale),
  );

  const animateTo = useCallback(
    (value: number) => {
      scale.stopAnimation();

      if (reducedMotion) {
        scale.setValue(1);
        return;
      }

      if (value < 1) {
        // Press-in should feel mechanically connected to the pointer or
        // finger. The spring belongs on release; easing into the pressed
        // state makes short taps finish before feedback becomes perceptible.
        scale.setValue(perceptibleScale);
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
  peakScale = 1.035,
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

    scale.setValue(0.94);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: peakScale,
        duration: 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 28,
        bounciness: 2,
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      }),
    ]).start();

    return () => scale.stopAnimation();
  }, [enabled, peakScale, reducedMotion, scale, value]);

  return { transform: [{ scale }] };
}

let pendingWebRouteDirection: RouteDirection | null = null;
let activeFallbackRouteAnimation: Animation | null = null;
let fallbackRouteSequence = 0;
let activeViewTransition: WebViewTransition | null = null;
let viewTransitionRequestSequence = 0;

type WebViewTransition = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (
    update: () => void | Promise<void>,
  ) => WebViewTransition;
};

type RouteCommitWaiter = {
  previousPath: string;
  resolve: () => void;
  timeout: ReturnType<typeof setTimeout>;
};

const routeCommitWaiters = new Set<RouteCommitWaiter>();

function prefersReducedMotionNow() {
  return (
    cachedReducedMotion ||
    (typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
  );
}

function routeTransitionRoot() {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(
    '[data-testid="web-route-transition"]',
  );
}

function waitForWebRouteCommit(previousPath: string) {
  return new Promise<void>((resolve) => {
    const waiter: RouteCommitWaiter = {
      previousPath,
      resolve: () => {
        clearTimeout(waiter.timeout);
        routeCommitWaiters.delete(waiter);
        resolve();
      },
      timeout: setTimeout(() => {
        routeCommitWaiters.delete(waiter);
        resolve();
      }, 700),
    };
    routeCommitWaiters.add(waiter);
  });
}

function notifyWebRouteCommit(pathname: string) {
  routeCommitWaiters.forEach((waiter) => {
    if (waiter.previousPath !== pathname) waiter.resolve();
  });
}

function setRouteDirectionAttribute(direction: RouteDirection) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.ambuRouteDirection = direction;
}

function canUseViewTransitions() {
  if (typeof document === "undefined" || prefersReducedMotionNow()) return false;
  return (
    typeof (document as ViewTransitionDocument).startViewTransition ===
    "function"
  );
}

function beginViewTransition(
  direction: RouteDirection,
  update: () => void,
) {
  const startViewTransition = (document as ViewTransitionDocument)
    .startViewTransition;
  if (!startViewTransition) {
    update();
    return;
  }

  const sequence = ++viewTransitionRequestSequence;
  const start = () => {
    if (sequence !== viewTransitionRequestSequence) return;
    setRouteDirectionAttribute(direction);
    const previousPath = window.location.pathname;
    const transition = startViewTransition.call(document, async () => {
      const committed = waitForWebRouteCommit(previousPath);
      update();
      await committed;
    });
    activeViewTransition = transition;
    const clearTransition = () => {
      if (activeViewTransition === transition) activeViewTransition = null;
    };
    void transition.finished.then(clearTransition, clearTransition);
  };

  if (activeViewTransition) {
    void activeViewTransition.finished.then(start, start);
    return;
  }
  start();
}

function beginBrowserHistoryViewTransition(
  direction: RouteDirection,
  previousPath: string,
) {
  const startViewTransition = (document as ViewTransitionDocument)
    .startViewTransition;
  // router.back() emits popstate from inside the explicit transition update.
  // In that case the old/new snapshots are already owned by that transition;
  // starting a second one here would replace it with a no-op snapshot.
  if (!startViewTransition || activeViewTransition) return;

  viewTransitionRequestSequence += 1;
  setRouteDirectionAttribute(direction);
  const committed = waitForWebRouteCommit(previousPath);
  const transition = startViewTransition.call(document, () => committed);
  activeViewTransition = transition;
  const clearTransition = () => {
    if (activeViewTransition === transition) activeViewTransition = null;
  };
  void transition.finished.then(clearTransition, clearTransition);
}

function fallbackExitFrames(direction: RouteDirection): Keyframe[] {
  const offset = direction === "back" ? 4 : -4;
  return [
    { opacity: 1, transform: "translate3d(0, 0, 0)" },
    { opacity: 0, transform: `translate3d(${offset}px, 0, 0)` },
  ];
}

export function markNextWebRouteDirection(direction: RouteDirection) {
  if (Platform.OS === "web") pendingWebRouteDirection = direction;
}

export function runWebRouteTransition(
  direction: RouteDirection,
  navigate: () => void,
) {
  markNextWebRouteDirection(direction);
  if (Platform.OS !== "web" || typeof window === "undefined") {
    navigate();
    return;
  }

  if (canUseViewTransitions()) {
    beginViewTransition(direction, navigate);
    return;
  }

  const root = routeTransitionRoot();
  if (
    prefersReducedMotionNow() ||
    !root ||
    typeof root.animate !== "function"
  ) {
    navigate();
    return;
  }

  fallbackRouteSequence += 1;
  const sequence = fallbackRouteSequence;
  activeFallbackRouteAnimation?.cancel();
  const animation = root.animate(fallbackExitFrames(direction), {
    duration: WEB_ROUTE_MOTION.exitDuration,
    easing: "cubic-bezier(0.4, 0, 1, 1)",
    fill: "forwards",
  });
  activeFallbackRouteAnimation = animation;
  void animation.finished
    .catch(() => undefined)
    .then(() => {
      if (sequence !== fallbackRouteSequence) return;
      navigate();
    });
}

export function shouldAnimateWebRoute(
  enabled: boolean,
  reducedMotion: boolean,
) {
  return enabled && !reducedMotion;
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
      if (canUseViewTransitions()) {
        beginBrowserHistoryViewTransition(direction, previousPath.current);
      }
    };

    window.addEventListener("popstate", handlePopState, { capture: true });
    return () =>
      window.removeEventListener("popstate", handlePopState, { capture: true });
  }, [enabled, readBrowserDirection]);

  useBrowserLayoutEffect(() => {
    notifyWebRouteCommit(pathname);
    const browserDirection = readBrowserDirection();

    const previous = previousPath.current;
    if (previous === pathname) return;
    previousPath.current = pathname;
    const explicitDirection = pendingWebRouteDirection;
    pendingWebRouteDirection = null;

    opacity.stopAnimation();
    translateX.stopAnimation();

    if (activeFallbackRouteAnimation) {
      activeFallbackRouteAnimation.cancel();
      activeFallbackRouteAnimation = null;
    }

    if (activeViewTransition) {
      opacity.setValue(1);
      translateX.setValue(0);
      return;
    }

    if (!shouldAnimateWebRoute(enabled, reducedMotion)) {
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
