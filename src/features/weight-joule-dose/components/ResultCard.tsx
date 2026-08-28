import { Text, View } from "react-native";
import { Subtle } from "../../../ui/Ui";
import { ToolResultRow, ToolSectionLabel, ToolSurface } from "../../../ui/ToolSurface";
import { theme } from "../../../ui/theme";
import type { Translate } from "../types";
import { fmtInt } from "../utils/formatting";

export function ResultCard({ t, result }: {
  t: Translate;
  result: {
    estKg: number;
    weightKg: number;
    joules: number;
    jPerKg: number;
    joulesCapped: boolean;
  };
}) {
  return (
    <ToolSurface tone="accent" testID="weight-joule-result">
      <ToolSectionLabel>{t("wjd_calculated")}</ToolSectionLabel>
      <View style={{ alignItems: "center", paddingVertical: 3 }}>
        <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 36, lineHeight: 42 }}>
          {Number.isFinite(result.joules) ? `${Math.round(result.joules)} J` : "—"}
        </Text>
        <Subtle>
          {Number.isFinite(result.jPerKg) ? `${fmtInt(result.jPerKg)} J/kg` : "— J/kg"}
        </Subtle>
      </View>
      <ToolResultRow
        label={t("wjd_usingWeight")}
        value={Number.isFinite(result.weightKg) ? `${fmtInt(result.weightKg)} kg` : "—"}
        prominent
      />
      <ToolResultRow
        label={t("wjd_estWeight")}
        value={Number.isFinite(result.estKg) ? `${fmtInt(result.estKg)} kg` : "—"}
      />
      {result.joulesCapped && (
        <Text style={{ color: theme.colors.warn, fontWeight: "800" }}>{t("wjd_capped120")}</Text>
      )}
      <View style={{ borderLeftWidth: 2, borderLeftColor: theme.colors.accentMuted, paddingLeft: 10 }}>
        <Text style={{ color: theme.colors.mutedText, fontSize: 12, lineHeight: 17 }}>
          {t("wjd_result_disclaimer")}
        </Text>
      </View>
    </ToolSurface>
  );
}
