import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AccessibilityInfo, Animated, Easing, Platform } from "react-native";

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

export function usePressFeedback(pressedScale = 0.985) {
  const reducedMotion = useReducedMotionPreference(Platform.OS === "web");
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = useCallback(
    (value: number) => {
      scale.stopAnimation();

      if (reducedMotion) {
        scale.setValue(1);
        return;
      }

      Animated.spring(scale, {
        toValue: value,
        speed: value < 1 ? 36 : 28,
        bounciness: value < 1 ? 0 : 2,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    },
    [reducedMotion, scale],
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

type RouteDirection = "forward" | "back";

function pathDepth(pathname: string) {
  return pathname.split("/").filter(Boolean).length;
}

export function useWebRouteTransition(pathname: string, enabled = true) {
  const reducedMotion = useReducedMotionPreference(enabled);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const previousPath = useRef(pathname);
  const historyIds = useRef<string[]>([]);
  const historyIndex = useRef(-1);

  useBrowserLayoutEffect(() => {
    let browserDirection: RouteDirection | null = null;

    if (enabled && typeof window !== "undefined") {
      const historyId = window.history.state?.id;

      if (typeof historyId === "string") {
        const knownIndex = historyIds.current.indexOf(historyId);

        if (historyIndex.current < 0) {
          historyIds.current = [historyId];
          historyIndex.current = 0;
        } else if (knownIndex >= 0) {
          if (knownIndex !== historyIndex.current) {
            browserDirection =
              knownIndex < historyIndex.current ? "back" : "forward";
          }
          historyIndex.current = knownIndex;
        } else {
          historyIds.current = historyIds.current.slice(
            0,
            historyIndex.current + 1,
          );
          historyIds.current.push(historyId);
          historyIndex.current = historyIds.current.length - 1;
          browserDirection = "forward";
        }
      }
    }

    const previous = previousPath.current;
    if (previous === pathname) return;
    previousPath.current = pathname;

    opacity.stopAnimation();
    translateX.stopAnimation();

    if (!enabled || reducedMotion) {
      opacity.setValue(1);
      translateX.setValue(0);
      return;
    }

    const fallbackDirection: RouteDirection =
      pathDepth(pathname) < pathDepth(previous) ? "back" : "forward";
    const direction = browserDirection ?? fallbackDirection;

    opacity.setValue(0.96);
    translateX.setValue(direction === "back" ? -10 : 10);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 170,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 190,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [enabled, opacity, pathname, reducedMotion, translateX]);

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
