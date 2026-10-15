import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Platform } from "react-native";

let cachedReducedMotion = false;
let reducedMotionInitialized = false;
const reducedMotionListeners = new Set<(enabled: boolean) => void>();

function publishReducedMotion(enabled: boolean) {
  if (cachedReducedMotion === enabled) return;
  cachedReducedMotion = enabled;
  reducedMotionListeners.forEach((listener) => listener(enabled));
}

function initializeReducedMotion() {
  if (reducedMotionInitialized) return;
  reducedMotionInitialized = true;

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
