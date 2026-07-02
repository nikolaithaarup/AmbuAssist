import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { theme } from "./theme";

type NumberInputProps = Omit<
  TextInputProps,
  "editable" | "keyboardType" | "readOnly"
> & {
  label?: string;
  unit?: string;
  helperText?: string;
  error?: string;
  showClear?: boolean;
  clearLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
};

export function NumberInput({
  label,
  unit,
  helperText,
  error,
  showClear = false,
  clearLabel = "Clear",
  disabled = false,
  readOnly = false,
  keyboardType = "decimal-pad",
  value,
  onChangeText,
  onFocus,
  onBlur,
  style,
  ...props
}: NumberInputProps) {
  const [focused, setFocused] = useState(false);
  const editable = !disabled && !readOnly;
  const hasClear = showClear && editable && String(value ?? "").length > 0;

  return (
    <View style={[styles.root, disabled && styles.disabled]}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
          readOnly && styles.fieldReadOnly,
        ]}
      >
        <TextInput
          {...props}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          autoCorrect={false}
          placeholderTextColor={theme.colors.mutedText}
          selectionColor={theme.colors.primary}
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

        {!!unit && <Text style={styles.unit}>{unit}</Text>}

        {hasClear && (
          <Pressable
            onPress={() => onChangeText?.("")}
            accessibilityRole="button"
            accessibilityLabel={clearLabel}
            style={({ pressed }) => [
              styles.clear,
              pressed && styles.clearPressed,
            ]}
          >
            <Text style={styles.clearText}>{clearLabel}</Text>
          </Pressable>
        )}
      </View>

      {!!error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        !!helperText && <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: theme.spacing.xs,
  },
  disabled: {
    opacity: theme.interaction.disabledOpacity,
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  field: {
    minHeight: theme.touchTarget.minimum,
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  fieldFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(0,0,0,0.24)",
  },
  fieldError: {
    borderColor: theme.colors.danger,
  },
  fieldReadOnly: {
    backgroundColor: "rgba(220,220,220,0.06)",
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: theme.touchTarget.minimum,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  unit: {
    alignSelf: "center",
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: theme.spacing.sm,
  },
  clear: {
    minHeight: theme.touchTarget.minimum,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.cardBorder,
  },
  clearPressed: {
    opacity: theme.interaction.pressedOpacity,
    backgroundColor: "rgba(220,220,220,0.08)",
  },
  clearText: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
  },
  helperText: {
    color: theme.colors.mutedText,
    fontSize: 12,
    lineHeight: 16,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    lineHeight: 16,
  },
});
