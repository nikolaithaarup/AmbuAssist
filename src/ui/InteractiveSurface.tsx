import { PropsWithChildren, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { theme } from "./theme";

type InteractiveSurfaceProps = PropsWithChildren<{
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  style?: StyleProp<ViewStyle>;
}>;

export function InteractiveSurface({
  children,
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityRole = "button",
  style,
}: InteractiveSurfaceProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled }}
      focusable={!disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.surface,
        style,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {children}
      {focused && !disabled && (
        <View pointerEvents="none" style={styles.focusRing} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  surface: {
    position: "relative",
    minHeight: theme.touchTarget.minimum,
    borderRadius: theme.radius,
  },
  pressed: {
    opacity: theme.interaction.pressedOpacity,
    transform: [{ scale: theme.interaction.pressedScale }],
  },
  disabled: {
    opacity: theme.interaction.disabledOpacity,
  },
  focusRing: {
    position: "absolute",
    top: -theme.interaction.focusRingOffset,
    right: -theme.interaction.focusRingOffset,
    bottom: -theme.interaction.focusRingOffset,
    left: -theme.interaction.focusRingOffset,
    borderWidth: theme.interaction.focusRingWidth,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius + theme.interaction.focusRingOffset,
  },
});
