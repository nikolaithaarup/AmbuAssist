import type { ReactNode } from "react";
import {
  Animated,
  Platform,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Subtle, Title } from "./Ui";
import { theme } from "./theme";
import { usePressFeedback } from "./motion";

export function ToolPageHeader({
  title,
  subtitle,
  badge,
  actionLabel,
  actionDisplayLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  actionLabel?: string;
  actionDisplayLabel?: string;
  onAction?: () => void;
}) {
  const pwa = Platform.OS === "web";

  return (
    <View
      style={{
        width: "100%",
        minWidth: 0,
        gap: 8,
        marginTop: pwa ? 0 : 10,
        marginBottom: pwa ? 6 : 4,
      }}
    >
      {badge ? (
        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(221,189,98,0.32)",
            backgroundColor: "rgba(221,189,98,0.09)",
            paddingHorizontal: 9,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: theme.colors.warn, fontSize: 12, fontWeight: "800" }}>
            {badge}
          </Text>
        </View>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
          <Title style={{ fontSize: pwa ? 27 : 28, lineHeight: pwa ? 33 : 34 }}>
            {title}
          </Title>
          {subtitle ? (
            <Subtle style={{ fontSize: 14, lineHeight: 21 }}>
              {subtitle}
            </Subtle>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            onPress={onAction}
            style={({ pressed }) => ({
              minHeight: 44,
              minWidth: 44,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 12,
              borderRadius: 13,
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
              backgroundColor: pressed ? theme.colors.pressed : "rgba(255,255,255,0.045)",
              opacity: pressed ? 0.76 : 1,
            })}
          >
            <Text style={{ color: theme.colors.accentMuted, fontSize: actionDisplayLabel ? 20 : 14, fontWeight: "900" }}>
              {actionDisplayLabel ?? actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function ToolSurface({
  children,
  tone = "default",
  style,
  testID,
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "warning" | "danger";
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  // A coloured left rule conveys clinical emphasis without another enclosing box.
  const emphasisColor = tone === "danger"
    ? theme.colors.danger
    : tone === "warning"
      ? theme.colors.warn
      : theme.colors.accentMuted;

  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: "transparent",
          borderWidth: 0,
          borderRadius: 0,
          paddingHorizontal: 7,
          paddingVertical: 8,
          gap: 10,
        },
        tone === "default"
          ? null
          : { borderLeftWidth: 3, borderLeftColor: emphasisColor, paddingLeft: 12 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ToolSectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        color: theme.colors.mutedText,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "800",
        letterSpacing: 0.55,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}

export function ToolResultRow({
  label,
  value,
  prominent = false,
}: {
  label: string;
  value: ReactNode;
  prominent?: boolean;
}) {
  return (
    <View
      style={{
        minHeight: 42,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
      }}
    >
      <Text style={{ flex: 1, color: theme.colors.mutedText, fontSize: 13, lineHeight: 18 }}>
        {label}
      </Text>
      <Text
        style={{
          flexShrink: 1,
          color: theme.colors.text,
          textAlign: "right",
          fontWeight: "900",
          fontSize: prominent ? 18 : 14,
          lineHeight: prominent ? 22 : 19,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export function ToolActionButton({
  label,
  onPress,
  tone = "primary",
  disabled = false,
  accessibilityLabel,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  tone?: "primary" | "secondary" | "danger" | "call";
  disabled?: boolean;
  accessibilityLabel?: string;
  compact?: boolean;
}) {
  const pwa = Platform.OS === "web";
  const pressFeedback = usePressFeedback(0.98);
  const colors =
    tone === "danger"
      ? { background: "rgba(255,123,114,0.11)", border: "rgba(255,123,114,0.38)", text: theme.colors.danger }
        : tone === "call"
        ? { background: theme.colors.accentMuted, border: "rgba(220,230,199,0.42)", text: theme.colors.onAccent }
        : tone === "secondary"
          ? { background: "rgba(255,255,255,0.04)", border: theme.colors.cardBorder, text: theme.colors.accentMuted }
          : { background: theme.colors.accentMuted, border: "rgba(220,230,199,0.42)", text: theme.colors.onAccent };

  return (
    <Animated.View style={[{ width: "100%", minWidth: 0 }, pressFeedback.animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        disabled={disabled}
        onPress={onPress}
        accessibilityState={{ disabled }}
        onPressIn={pressFeedback.onPressIn}
        onPressOut={pressFeedback.onPressOut}
        style={({ pressed }) => ({
          minHeight: theme.controlHeight,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: pwa ? theme.radii.control : 15,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: pressed ? theme.colors.pressed : colors.background,
          paddingHorizontal: compact ? 7 : 16,
          opacity: disabled ? 0.5 : pressed ? 0.78 : 1,
        })}
      >
        <Text style={{ color: colors.text, fontSize: compact ? 14 : 16, lineHeight: 20, fontWeight: "900", textAlign: "center" }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
