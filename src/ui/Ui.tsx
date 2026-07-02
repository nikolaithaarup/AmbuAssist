// src/ui/Ui.tsx
import { PropsWithChildren } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type StyleProp,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "./theme";

export function Screen({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        pressed && {
          opacity: 0.86,
          transform: [{ scale: 0.99 }],
          backgroundColor: theme.colors.pressed,
        },
        disabled && { opacity: 0.55 },
      ]}
    >
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
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
  return (
    <TextInput
      {...props}
      keyboardType={keyboardType}
      autoCorrect={autoCorrect}
      placeholderTextColor={theme.colors.mutedText}
      style={[styles.input, style]}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  inner: { flex: 1, padding: 18, gap: 14 },

  title: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtle: {
    color: theme.colors.mutedText,
    fontSize: theme.typography.caption,
    lineHeight: 19,
  },

  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.radius,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { color: theme.colors.text, fontSize: 15, fontWeight: "600" },

  input: {
    flex: 1,
    color: theme.colors.text,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 46,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },

  btn: {
    backgroundColor: theme.colors.accentSurface,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 50,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  btnText: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
});
