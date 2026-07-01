import { Text, View } from "react-native";
import type { DoseUnit } from "../../../state/settings";
import { Card, Row, Subtle, Title } from "../../../ui/Ui";
import { theme } from "../../../ui/theme";
import type { CalculatedMedicationRow, Translate } from "../types";
import { fmtSmartDose, fmtSmartMl, unitLabel } from "../utils/formatting";

export function DoseCalculatorCard({ t, lang, rows }: {
  t: Translate;
  lang: "en" | "da";
  rows: CalculatedMedicationRow[];
}) {
  return (
    <Card>
      <Title>{t("wjd_doses")}</Title>
      <Subtle>{t("wjd_doses_sub")}</Subtle>
      {rows.length === 0 ? (
        <Text style={{ color: theme.colors.mutedText }}>{t("wjd_noMeds")}</Text>
      ) : (
        rows.map((med) => {
          const doseLabel = unitLabel(med.doseUnit, lang);
          const concentrationLabel = unitLabel(
            (med.concUnit ?? med.doseUnit) as DoseUnit,
            lang,
          );
          return (
            <View key={med.id} style={{ borderTopWidth: 1, borderTopColor: theme.colors.cardBorder, paddingTop: 10, marginTop: 10, gap: 6 }}>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "900" }}>{med.name}</Text>
              <Row>
                <Text style={{ color: theme.colors.mutedText, width: 130 }}>{t("wjd_dose")}</Text>
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {Number.isFinite(med.finalDoseDisplay) ? `${fmtSmartDose(med.finalDoseDisplay)} ${doseLabel}` : "—"}
                </Text>
                <Text style={{ color: theme.colors.mutedText, marginLeft: "auto" }}>
                  ({med.dosePerKg} {doseLabel}/kg)
                </Text>
              </Row>
              {med.capped && Number.isFinite(med.maxDose as number) && (
                <Text style={{ color: theme.colors.warn, fontWeight: "800" }}>
                  {t("wjd_cappedMax")} {med.maxDose} {doseLabel}
                </Text>
              )}
              {Number.isFinite(med.concentration as number) && (
                <Row>
                  <Text style={{ color: theme.colors.mutedText, width: 130 }}>{t("wjd_volume")}</Text>
                  <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                    {Number.isFinite(med.ml) ? `${fmtSmartMl(med.ml)} mL` : "—"}
                  </Text>
                  <Text style={{ color: theme.colors.mutedText, marginLeft: "auto" }}>
                    ({med.concentration} {concentrationLabel}/mL)
                  </Text>
                </Row>
              )}
            </View>
          );
        })
      )}
    </Card>
  );
}
