// src/ui/Ui.tsx
import { PropsWithChildren } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "./theme";

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <View style={styles.inner}>{children}</View>
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
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
    >
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

export function Row({ children }: PropsWithChildren) {
  return <View style={styles.row}>{children}</View>;
}

export function Label({ children }: PropsWithChildren) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  keyboardType = "numeric",
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.mutedText}
      keyboardType={keyboardType}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  inner: { flex: 1, padding: 16, gap: 12 },

  title: { color: theme.colors.text, fontSize: 30, fontWeight: "800" },
  subtle: { color: theme.colors.mutedText, fontSize: 14, lineHeight: 18 },

  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.radius,
    padding: 14,
    gap: 10,
  },

  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { color: theme.colors.text, fontSize: 15, fontWeight: "600" },

  input: {
    flex: 1,
    color: theme.colors.text,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },

  btn: {
    backgroundColor: "rgba(220,220,220,0.18)",
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  btnText: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
});
