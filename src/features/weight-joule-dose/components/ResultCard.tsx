import { Text, View } from "react-native";
import { ToolSectionLabel, ToolSurface } from "../../../ui/ToolSurface";
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
  const hasWeight = Number.isFinite(result.weightKg) && result.weightKg > 0;
  return (
    <ToolSurface tone="accent" testID="weight-joule-result" style={{ gap: 9 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
          <ToolSectionLabel>{t("wjd_calculated")}</ToolSectionLabel>
          <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 30, lineHeight: 36 }}>
            {hasWeight && Number.isFinite(result.joules) ? `${Math.round(result.joules)} J` : "— J"}
          </Text>
        </View>
        <Text style={{ color: theme.colors.mutedText, fontSize: 13, textAlign: "right" }}>
          {Number.isFinite(result.jPerKg) ? `${fmtInt(result.jPerKg)} J/kg` : "— J/kg"}
        </Text>
      </View>
      {hasWeight ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <Text style={{ color: theme.colors.mutedText, fontSize: 13 }}>
            {t("wjd_usingWeight")}: <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{fmtInt(result.weightKg)} kg</Text>
          </Text>
          {Number.isFinite(result.estKg) && (
            <Text style={{ color: theme.colors.mutedText, fontSize: 13 }}>
              {t("wjd_estWeight")}: <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{fmtInt(result.estKg)} kg</Text>
            </Text>
          )}
        </View>
      ) : (
        <Text style={{ color: theme.colors.mutedText, fontSize: 13 }}>
          {t("wjd_age")} / {t("wjd_weight_override")}
        </Text>
      )}
      {result.joulesCapped && (
        <Text style={{ color: theme.colors.warn, fontSize: 13, fontWeight: "800" }}>{t("wjd_capped120")}</Text>
      )}
    </ToolSurface>
  );
}
