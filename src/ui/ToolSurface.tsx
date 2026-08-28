import type { ReactNode } from "react";
import {
  Platform,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Subtle, Title } from "./Ui";
import { theme } from "./theme";

const surfaceDepth = Platform.select<StyleProp<ViewStyle>>({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  android: { elevation: 2 },
  web: { boxShadow: "0 5px 16px rgba(0,0,0,0.18)" } as ViewStyle,
  default: {},
});

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
  return (
    <View style={{ gap: 7, marginTop: 10, marginBottom: 2 }}>
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
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Title style={{ fontSize: 27, lineHeight: 32 }}>{title}</Title>
          {subtitle ? <Subtle style={{ fontSize: 14, lineHeight: 20 }}>{subtitle}</Subtle> : null}
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
  const toneStyle: ViewStyle =
    tone === "accent"
      ? { backgroundColor: "rgba(47,56,39,0.88)", borderColor: "rgba(174,190,144,0.26)" }
      : tone === "warning"
        ? { backgroundColor: "rgba(65,57,31,0.48)", borderColor: "rgba(221,189,98,0.30)" }
        : tone === "danger"
          ? { backgroundColor: "rgba(66,35,32,0.42)", borderColor: "rgba(255,123,114,0.34)" }
          : { backgroundColor: "rgba(38,43,34,0.72)", borderColor: "rgba(190,202,165,0.16)" };

  return (
    <View
      testID={testID}
      style={[
        {
          borderRadius: 17,
          borderWidth: 1,
          padding: 15,
          gap: 11,
        },
        toneStyle,
        surfaceDepth,
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
        fontWeight: "900",
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
  const colors =
    tone === "danger"
      ? { background: "rgba(255,123,114,0.11)", border: "rgba(255,123,114,0.38)", text: theme.colors.danger }
      : tone === "call"
        ? { background: "rgba(145,169,108,0.28)", border: "rgba(174,190,144,0.42)", text: theme.colors.text }
        : tone === "secondary"
          ? { background: "rgba(255,255,255,0.04)", border: theme.colors.cardBorder, text: theme.colors.accentMuted }
          : { background: theme.colors.accentSurface, border: "rgba(174,190,144,0.34)", text: theme.colors.text };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: pressed ? theme.colors.pressed : colors.background,
        paddingHorizontal: compact ? 7 : 16,
        opacity: disabled ? 0.5 : pressed ? 0.78 : 1,
        transform: [{ scale: pressed ? 0.992 : 1 }],
      })}
    >
      <Text style={{ color: colors.text, fontSize: compact ? 14 : 16, lineHeight: 20, fontWeight: "900", textAlign: "center" }}>
        {label}
      </Text>
    </Pressable>
  );
}
