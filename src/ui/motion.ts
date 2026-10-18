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
  distance: 28,
  duration: 220,
  initialOpacity: 0.9,
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

export function runWebRouteTransition(
  direction: RouteDirection,
  navigate: () => void,
) {
  markNextWebRouteDirection(direction);
  // Navigation must stay synchronous. Browser-controlled View Transition
  // callbacks can run after a newer interaction even when their animation was
  // skipped, which can replay stale router.push/back actions out of order.
  navigate();
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

    opacity.stopAnimation();
    translateX.stopAnimation();

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
