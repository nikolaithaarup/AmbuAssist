import { useState, type ReactNode } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { theme } from "./theme";

type NumberInputProps = Omit<
  TextInputProps,
  "editable" | "keyboardType" | "onChangeText"
> & {
  value: string;
  onChangeText: (value: string) => void;
  label?: ReactNode;
  unit?: string;
  helperText?: string;
  validationMessage?: string;
  clearable?: boolean;
  clearAccessibilityLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
};

export function NumberInput({
  value,
  onChangeText,
  label,
  unit,
  helperText,
  validationMessage,
  clearable = false,
  clearAccessibilityLabel = "Clear value",
  disabled = false,
  readOnly = false,
  onFocus,
  onBlur,
  style,
  ...inputProps
}: NumberInputProps) {
  const [focused, setFocused] = useState(false);
  const editable = !disabled && !readOnly;

  return (
    <View style={[styles.wrapper, disabled && styles.disabled]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputShell,
          focused && styles.focused,
          validationMessage ? styles.invalid : null,
          readOnly && styles.readOnly,
        ]}
      >
        <TextInput
          {...inputProps}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={
            Platform.OS === "ios" ? "numbers-and-punctuation" : "decimal-pad"
          }
          autoCorrect={false}
          autoCapitalize="none"
          selectTextOnFocus={editable}
          placeholderTextColor={theme.colors.mutedText}
          accessibilityState={{ disabled }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, style]}
        />

        {unit ? <Text style={styles.unit}>{unit}</Text> : null}

        {clearable && editable && value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={clearAccessibilityLabel}
            hitSlop={6}
            onPress={() => onChangeText("")}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.clearButtonPressed,
            ]}
          >
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        ) : null}
      </View>

      {validationMessage ? (
        <Text style={styles.validation}>{validationMessage}</Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, minWidth: 0, gap: 7 },
  disabled: { opacity: 0.52 },
  label: { color: theme.colors.text, fontSize: 14, fontWeight: "700" },
  inputShell: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  focused: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSurface,
  },
  invalid: { borderColor: theme.colors.danger },
  readOnly: { backgroundColor: "rgba(255,255,255,0.035)" },
  input: {
    flex: 1,
    minHeight: 48,
    color: theme.colors.text,
    fontSize: 16,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  unit: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    paddingRight: 12,
  },
  clearButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.divider,
  },
  clearButtonPressed: { backgroundColor: theme.colors.pressed },
  clearText: { color: theme.colors.mutedText, fontSize: 22, lineHeight: 24 },
  helper: { color: theme.colors.mutedText, fontSize: 12, lineHeight: 17 },
  validation: { color: theme.colors.danger, fontSize: 12, lineHeight: 17 },
});
