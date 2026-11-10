import { Text, View } from "react-native";
import { Input } from "../../../ui/Ui";
import { ToolSectionLabel, ToolSurface } from "../../../ui/ToolSurface";
import { theme } from "../../../ui/theme";
import type { Translate } from "../types";
import { AgeWeightRuler } from "./AgeWeightRuler";
import { parseAgeYears } from "../utils/ageRuler";
import { toNum } from "../utils/parsing";

/** Compact, always-editable inputs. No clinical calculation is performed here. */
export function WeightCalculatorCard({
  t,
  language,
  ageYears,
  setAgeYears,
  weightKgOverride,
  setWeightKgOverride,
}: {
  t: Translate;
  language: "da" | "en";
  ageYears: string;
  setAgeYears: (value: string) => void;
  weightKgOverride: string;
  setWeightKgOverride: (value: string) => void;
}) {
  const years = parseAgeYears(ageYears);
  const enteredWeight = toNum(weightKgOverride);
  const needsInfantWeight = Number.isFinite(years) && years >= 0 && years < 1 &&
    !(Number.isFinite(enteredWeight) && enteredWeight > 0);
  // Selecting/typing an age restores age-based estimation instead of leaving a stale measured override.
  const selectAge = (value: string) => {
    setAgeYears(value);
    setWeightKgOverride("");
  };
  const fields = [
    { key: "age", label: t("wjd_age"), hint: t("wjd_years"), value: ageYears, onChange: selectAge, keyboard: "number-pad" as const },
    { key: "weight", label: `${t("wjd_weight_override")} · kg`, hint: "—", value: weightKgOverride, onChange: setWeightKgOverride, keyboard: "decimal-pad" as const },
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
      <AgeWeightRuler
        language={language}
        ageYears={ageYears}
        weightKg={weightKgOverride}
        onAgeChange={selectAge}
        onWeightChange={setWeightKgOverride}
      />
      {needsInfantWeight ? (
        <Text testID="wjd-infant-requires-weight" style={{ color: theme.colors.warn, fontSize: 12 }}>
          {language === "da" ? "Under 1 år: angiv vægt i kg." : "Under 1 year: enter the measured weight in kg."}
        </Text>
      ) : null}
    </ToolSurface>
  );
}
