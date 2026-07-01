import { Text, View } from "react-native";
import { Card, Row, Title } from "../../../ui/Ui";
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
    <Card>
      <Title>{t("wjd_calculated")}</Title>
      <Row>
        <Text style={{ color: theme.colors.mutedText, width: 130 }}>{t("wjd_estWeight")}</Text>
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
          {Number.isFinite(result.estKg) ? `${fmtInt(result.estKg)} kg` : "—"}
        </Text>
      </Row>
      <Row>
        <Text style={{ color: theme.colors.mutedText, width: 130 }}>{t("wjd_usingWeight")}</Text>
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
          {Number.isFinite(result.weightKg) ? `${fmtInt(result.weightKg)} kg` : "—"}
        </Text>
      </Row>
      <Row>
        <Text style={{ color: theme.colors.mutedText, width: 130 }}>{t("wjd_energy")}</Text>
        <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>
          {Number.isFinite(result.joules) ? `${Math.round(result.joules)} J` : "—"}
        </Text>
        <Text style={{ color: theme.colors.mutedText, marginLeft: "auto" }}>
          {Number.isFinite(result.jPerKg) ? `(${fmtInt(result.jPerKg)} J/kg)` : "(— J/kg)"}
        </Text>
      </Row>
      {result.joulesCapped && (
        <Text style={{ color: theme.colors.warn, fontWeight: "800" }}>{t("wjd_capped120")}</Text>
      )}
      <View style={{ marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 10, backgroundColor: "rgba(0,0,0,0.10)" }}>
        <Text style={{ color: theme.colors.mutedText, fontSize: 12, lineHeight: 17 }}>
          {t("wjd_result_disclaimer")}
        </Text>
      </View>
    </Card>
  );
}
