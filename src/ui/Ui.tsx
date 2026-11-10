// src/ui/Ui.tsx
import { PropsWithChildren, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type StyleProp,
  ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";
import { theme } from "./theme";
import { usePressFeedback } from "./motion";
import { useResponsiveLayout } from "./responsive";

export function Screen({
  children,
  style,
  edges = ["left", "right", "bottom"],
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  edges?: readonly Edge[];
}>) {
  const { isCompact, isExpanded } = useResponsiveLayout();
  const safeAreaEdges =
    Platform.OS === "web"
      ? {
          top: edges.includes("top")
            ? ("additive" as const)
            : ("off" as const),
          right: edges.includes("right")
            ? ("additive" as const)
            : ("off" as const),
          bottom: edges.includes("bottom")
            ? ("additive" as const)
            : ("off" as const),
          left: edges.includes("left")
            ? ("additive" as const)
            : ("off" as const),
        }
      : edges;
  const webLayout =
    Platform.OS === "web"
      ? {
          paddingHorizontal:
            isCompact
              ? 12
              : isExpanded
                ? theme.layout.desktopGutter
                : 16,
          paddingTop: isCompact ? 12 : isExpanded ? 20 : 16,
          paddingBottom: isCompact ? 14 : isExpanded ? 20 : 18,
          gap: isCompact ? 10 : theme.layout.contentGap,
        }
      : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={safeAreaEdges}>
      <ResponsiveToolContainer style={[styles.inner, webLayout, style]}>
        {children}
      </ResponsiveToolContainer>
    </SafeAreaView>
  );
}

export function ResponsiveToolContainer({
  children,
  style,
  maxWidth = 1180,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  maxWidth?: number;
}>) {
  return (
    <View style={[styles.responsiveContainer, { maxWidth }, style]}>
      {children}
    </View>
  );
}

export function ResponsiveColumns({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { isExpanded } = useResponsiveLayout();

  if (Platform.OS !== "web") return <>{children}</>;

  return (
    <View
      style={[
        styles.responsiveColumns,
        { flexDirection: isExpanded ? "row" : "column" },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ResponsiveColumn({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { isExpanded } = useResponsiveLayout();

  if (Platform.OS !== "web") return <>{children}</>;

  return (
    <View
      style={[
        styles.responsiveColumn,
        isExpanded
          ? styles.responsiveColumnExpanded
          : styles.responsiveColumnStacked,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children, style }: PropsWithChildren<{ style?: any }>) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Subtle({
  children,
  style,
}: PropsWithChildren<{ style?: any }>) {
  return <Text style={[styles.subtle, style]}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const pressFeedback = usePressFeedback(0.98);

  return (
    <Animated.View
      style={[styles.animatedControl, pressFeedback.animatedStyle]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        onPressIn={pressFeedback.onPressIn}
        onPressOut={pressFeedback.onPressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.btn,
          pressed && {
            opacity: 0.86,
            backgroundColor: theme.colors.pressed,
          },
          disabled && { opacity: 0.55 },
        ]}
      >
        <Text style={styles.btnText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function Row({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Label({ children }: PropsWithChildren) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Input({
  style,
  keyboardType = "default",
  autoCorrect = false,
  ...props
}: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      {...props}
      keyboardType={keyboardType}
      autoCorrect={autoCorrect}
      onFocus={(event) => {
        setFocused(true);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        props.onBlur?.(event);
      }}
      placeholderTextColor={theme.colors.mutedText}
      style={[styles.input, focused && styles.inputFocused, style]}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  responsiveContainer: { flex: 1, width: "100%", alignSelf: "center" },
  responsiveColumns: {
    width: "100%",
    alignItems: "stretch",
    gap: 12,
  },
  responsiveColumn: { minWidth: 0, gap: 14 },
  responsiveColumnExpanded: { flex: 1 },
  responsiveColumnStacked: { flex: 0, flexBasis: "auto", width: "100%" },
  inner: { flex: 1, padding: 18, gap: 14 },
  animatedControl: { width: "100%", minWidth: 0 },

  title: {
    color: theme.colors.text,
    fontSize: Platform.OS === "web" ? 28 : theme.typography.title,
    lineHeight: Platform.OS === "web" ? 34 : theme.typography.titleLineHeight,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtle: {
    color: theme.colors.mutedText,
    fontSize: theme.typography.caption,
    lineHeight: theme.typography.captionLineHeight,
  },

  // Flat by default: no enclosing card around another card or button.
  // Explicit warning/result styles supplied by a caller may still add emphasis.
  card: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 0,
    paddingVertical: 7,
    paddingHorizontal: 6,
    gap: 10,
  },

  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },

  input: {
    width: "100%",
    minWidth: 0,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 21,
    backgroundColor: "rgba(9,12,8,0.32)",
    borderRadius: Platform.OS === "web" ? theme.radii.control : 12,
    paddingHorizontal: 12,
    minHeight: Platform.OS === "web" ? theme.controlHeight : 46,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  inputFocused: {
    borderColor: theme.colors.focus,
    backgroundColor: "rgba(15,19,13,0.56)",
  },

  btn: {
    backgroundColor: theme.colors.accentMuted,
    borderColor: "rgba(220,230,199,0.42)",
    borderWidth: 1,
    borderRadius: theme.radii.control,
    minHeight: theme.controlHeight,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  btnText: {
    color: theme.colors.onAccent,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    textAlign: "center",
  },
});
