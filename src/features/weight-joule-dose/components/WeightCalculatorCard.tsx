import { NumberInput } from "../../../ui/NumberInput";
import { Card } from "../../../ui/Ui";
import type { Translate } from "../types";

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
  return (
    <Card>
      <NumberInput
        label={t("wjd_age")}
        unit={t("wjd_years")}
        value={ageYears}
        onChangeText={setAgeYears}
        placeholder={t("wjd_years")}
        keyboardType="number-pad"
        showClear
        clearLabel={t("clear")}
      />
      <NumberInput
        label={t("wjd_weight_override")}
        unit="kg"
        value={weightKgOverride}
        onChangeText={setWeightKgOverride}
        placeholder={t("wjd_kg_optional")}
        showClear
        clearLabel={t("clear")}
      />
      <NumberInput
        label={t("wjd_jkg_override")}
        unit="J/kg"
        value={jPerKgOverride}
        onChangeText={setJPerKgOverride}
        placeholder={placeholderDefaultJ}
        showClear
        clearLabel={t("clear")}
      />
    </Card>
  );
}
