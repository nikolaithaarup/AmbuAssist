import {
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Platform,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useReducedMotionPreference } from "./motion";

type MotionPresenceProps = PropsWithChildren<{
  visible: boolean;
  enterDelayMs?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function MotionPresence({
  visible,
  enterDelayMs = 0,
  style,
  testID,
  children,
}: MotionPresenceProps) {
  const reducedMotion = useReducedMotionPreference(true);
  const [mounted, setMounted] = useState(visible);
  const cachedChildren = useRef<ReactNode>(children);
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(visible ? 0 : 6)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  if (visible) cachedChildren.current = children;

  useEffect(() => {
    animation.current?.stop();

    if (reducedMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      setMounted(visible);
      return;
    }

    if (visible) {
      const enter = () => {
        opacity.setValue(0);
        translateY.setValue(6);
        setMounted(true);
        const frame = requestAnimationFrame(() => {
          animation.current = Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 190,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: Platform.OS !== "web",
              isInteraction: false,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 220,
              easing: Easing.bezier(0.22, 1, 0.36, 1),
              useNativeDriver: Platform.OS !== "web",
              isInteraction: false,
            }),
          ]);
          animation.current.start();
        });
        return () => cancelAnimationFrame(frame);
      };

      if (mounted || enterDelayMs <= 0) return enter();
      const timer = setTimeout(enter, enterDelayMs);
      return () => clearTimeout(timer);
    }

    if (!mounted) return;
    animation.current = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 140,
        easing: Easing.in(Easing.quad),
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      }),
      Animated.timing(translateY, {
        toValue: -4,
        duration: 150,
        easing: Easing.in(Easing.quad),
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      }),
    ]);
    animation.current.start(({ finished }) => {
      if (finished) setMounted(false);
    });

    return () => animation.current?.stop();
  }, [
    enterDelayMs,
    mounted,
    opacity,
    reducedMotion,
    translateY,
    visible,
  ]);

  if (!mounted) return null;

  return (
    <Animated.View
      testID={testID}
      style={[
        style,
        {
          opacity,
          pointerEvents: visible ? "auto" : "none",
          transform: [{ translateY }],
        },
      ]}
    >
      {cachedChildren.current}
    </Animated.View>
  );
}
