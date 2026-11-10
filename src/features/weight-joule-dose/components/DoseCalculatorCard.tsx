import { Text, View } from "react-native";
import type { DoseUnit } from "../../../state/settings";
import { ToolSectionLabel, ToolSurface } from "../../../ui/ToolSurface";
import { theme } from "../../../ui/theme";
import type { CalculatedMedicationRow, Translate } from "../types";
import { fmtSmartDose, fmtSmartMl, unitLabel } from "../utils/formatting";

export function DoseCalculatorCard({ t, lang, rows, weightKg }: {
  t: Translate;
  lang: "en" | "da";
  rows: CalculatedMedicationRow[];
  weightKg?: number;
}) {
  const hasWeight = Number.isFinite(weightKg) && (weightKg ?? 0) > 0;
  return (
    <ToolSurface testID="wjd-compact-doses" style={{ gap: 10 }}>
      <ToolSectionLabel>{t("wjd_doses")}</ToolSectionLabel>
      {!hasWeight ? (
        <Text style={{ color: theme.colors.mutedText, fontSize: 13 }}>
          {lang === "da" ? "Angiv alder eller vægt for at beregne doser." : "Enter age or weight to calculate doses."}
        </Text>
      ) : rows.length === 0 ? (
        <Text style={{ color: theme.colors.mutedText, fontSize: 13 }}>{t("wjd_noMeds")}</Text>
      ) : (
        rows.map((med, index) => {
          const doseLabel = unitLabel(med.doseUnit, lang);
          const concentrationLabel = unitLabel((med.concUnit ?? med.doseUnit) as DoseUnit, lang);
          const dose = Number.isFinite(med.finalDoseDisplay)
            ? `${fmtSmartDose(med.finalDoseDisplay)} ${doseLabel}`
            : "—";
          const volume = Number.isFinite(med.concentration as number)
            ? Number.isFinite(med.ml)
              ? `${fmtSmartMl(med.ml)} mL`
              : "— mL"
            : null;
          return (
            <View key={med.id} style={{ paddingTop: index === 0 ? 0 : 9, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: theme.colors.divider, gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                <Text style={{ flex: 1, color: theme.colors.text, fontWeight: "800", fontSize: 15 }} numberOfLines={2}>{med.name}</Text>
                <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>{dose}</Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, justifyContent: "space-between" }}>
                <Text style={{ color: theme.colors.mutedText, fontSize: 12 }}>
                  {fmtSmartDose(med.dosePerKg)} {doseLabel}/kg
                </Text>
                {volume !== null ? (
                  <Text style={{ color: theme.colors.mutedText, fontSize: 12 }}>
                    {volume} · {fmtSmartDose(med.concentration as number)} {concentrationLabel}/mL
                  </Text>
                ) : null}
              </View>
              {med.capped && Number.isFinite(med.maxDose as number) && (
                <Text style={{ color: theme.colors.warn, fontSize: 12, fontWeight: "800" }}>
                  {t("wjd_cappedMax")} {fmtSmartDose(med.maxDose as number)} {doseLabel}
                </Text>
              )}
            </View>
          );
        })
      )}
    </ToolSurface>
  );
}
