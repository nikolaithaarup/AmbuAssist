import { Card, Input, Label, Row } from "../../../ui/Ui";
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
      <Row>
        <Label>{t("wjd_age")}</Label>
        <Input value={ageYears} onChangeText={setAgeYears} placeholder={t("wjd_years")} keyboardType="number-pad" />
      </Row>
      <Row>
        <Label>{t("wjd_weight_override")}</Label>
        <Input value={weightKgOverride} onChangeText={setWeightKgOverride} placeholder={t("wjd_kg_optional")} keyboardType="decimal-pad" />
      </Row>
      <Row>
        <Label>{t("wjd_jkg_override")}</Label>
        <Input value={jPerKgOverride} onChangeText={setJPerKgOverride} placeholder={placeholderDefaultJ} keyboardType="decimal-pad" />
      </Row>
    </Card>
  );
}
