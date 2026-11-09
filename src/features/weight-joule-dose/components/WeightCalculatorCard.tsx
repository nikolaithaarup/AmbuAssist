import { Text, View } from "react-native";
import { Input } from "../../../ui/Ui";
import { ToolSectionLabel, ToolSurface } from "../../../ui/ToolSurface";
import { theme } from "../../../ui/theme";
import type { Translate } from "../types";

/** Compact, always-editable inputs. No clinical calculation is performed here. */
export function WeightCalculatorCard({
  t,
  ageYears,
  setAgeYears,
  weightKgOverride,
  setWeightKgOverride,
  jPerKgOverride,
  setJPerKgOverride,
  placeholderDefaultJ,
}: {
  t: Translate;
  ageYears: string;
  setAgeYears: (value: string) => void;
  weightKgOverride: string;
  setWeightKgOverride: (value: string) => void;
  jPerKgOverride: string;
  setJPerKgOverride: (value: string) => void;
  placeholderDefaultJ: string;
}) {
  const fields = [
    { key: "age", label: t("wjd_age"), hint: t("wjd_years"), value: ageYears, onChange: setAgeYears, keyboard: "number-pad" as const },
    { key: "weight", label: `${t("wjd_weight_override")} · kg`, hint: "—", value: weightKgOverride, onChange: setWeightKgOverride, keyboard: "decimal-pad" as const },
    { key: "energy", label: "J/kg", hint: placeholderDefaultJ, value: jPerKgOverride, onChange: setJPerKgOverride, keyboard: "decimal-pad" as const },
  ];
  return (
    <ToolSurface testID="wjd-compact-input" style={{ gap: 9 }}>
      <ToolSectionLabel>{t("wjd_input")}</ToolSectionLabel>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
        {fields.map((field) => (
          <View key={field.key} style={{ flex: 1, minWidth: 0, gap: 5 }}>
            <Text numberOfLines={1} style={{ color: theme.colors.mutedText, fontSize: 12, fontWeight: "700" }}>{field.label}</Text>
            <Input
              testID={`wjd-input-${field.key}`}
              accessibilityLabel={field.label}
              value={field.value}
              onChangeText={field.onChange}
              placeholder={field.hint}
              keyboardType={field.keyboard}
              style={{ paddingHorizontal: 10, paddingVertical: 9, minHeight: 44, fontSize: 16 }}
            />
          </View>
        ))}
      </View>
    </ToolSurface>
  );
}
