import { useMemo, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { useT } from "../../../../src/i18n/useT";
import { Background } from "../../../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../../../src/ui/Ui";

function parse(val: string) {
  const n = parseFloat(val.replace(",", ".").trim());
  return Number.isNaN(n) ? undefined : n;
}

export default function PatternsPage() {
  const { t } = useT();

  const [ph, setPh] = useState("");
  const [pco2, setPco2] = useState("");
  const [hco3, setHco3] = useState("");
  const [glucose, setGlucose] = useState("");
  const [lactate, setLactate] = useState("");

  const pH = parse(ph);
  const pCO2 = parse(pco2);
  const HCO3 = parse(hco3);
  const glu = parse(glucose);
  const lac = parse(lactate);

  const patterns = useMemo(() => {
    const findings: string[] = [];

    const hasAnyInput =
      pH !== undefined ||
      pCO2 !== undefined ||
      HCO3 !== undefined ||
      glu !== undefined ||
      lac !== undefined;

    if (!hasAnyInput) return findings;

    // DKA-like pattern
    if (
      pH !== undefined &&
      HCO3 !== undefined &&
      glu !== undefined &&
      pH < 7.3 &&
      HCO3 < 18 &&
      glu > 11
    ) {
      findings.push(t("bg_pattern_dka"));
    }

    // Elevated lactate
    if (lac !== undefined && lac > 2) {
      findings.push(t("bg_pattern_lactate_elevated"));
    }

    if (lac !== undefined && lac > 4) {
      findings.push(t("bg_pattern_lactate_high"));
    }

    // Possible dehydration / stress response
    if (
      lac !== undefined &&
      glu !== undefined &&
      lac > 2 &&
      glu > 7 &&
      (pH === undefined || pH >= 7.35)
    ) {
      findings.push(t("bg_pattern_dehydration"));
    }

    // Optional respiratory acidosis pattern
    if (pH !== undefined && pCO2 !== undefined && pH < 7.35 && pCO2 > 6) {
      findings.push(t("bg_pattern_respiratory_acidosis"));
    }

    return findings;
  }, [pH, pCO2, HCO3, glu, lac, t]);

  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Title style={{ textAlign: "center" }}>
            {t("tool_bg_patterns_title")}
          </Title>

          <Subtle style={{ textAlign: "center" }}>
            {t("tool_bg_patterns_desc")}
          </Subtle>

          <Card style={{ padding: 14 }}>
            <View style={{ gap: 10 }}>
              <TextInput
                placeholder={t("bg_label_ph")}
                keyboardType="decimal-pad"
                autoCapitalize="none"
                autoCorrect={false}
                value={ph}
                onChangeText={setPh}
                style={inputStyle}
              />

              <TextInput
                placeholder={t("bg_label_pco2")}
                keyboardType="decimal-pad"
                autoCapitalize="none"
                autoCorrect={false}
                value={pco2}
                onChangeText={setPco2}
                style={inputStyle}
              />

              <TextInput
                placeholder={t("bg_label_hco3")}
                keyboardType="decimal-pad"
                autoCapitalize="none"
                autoCorrect={false}
                value={hco3}
                onChangeText={setHco3}
                style={inputStyle}
              />

              <TextInput
                placeholder={t("bg_label_glucose")}
                keyboardType="decimal-pad"
                autoCapitalize="none"
                autoCorrect={false}
                value={glucose}
                onChangeText={setGlucose}
                style={inputStyle}
              />

              <TextInput
                placeholder={t("bg_label_lactate")}
                keyboardType="decimal-pad"
                autoCapitalize="none"
                autoCorrect={false}
                value={lactate}
                onChangeText={setLactate}
                style={inputStyle}
              />
            </View>
          </Card>

          {patterns.length > 0 && (
            <Card style={{ padding: 14 }}>
              <View style={{ gap: 8 }}>
                <Title>{t("result")}</Title>
                {patterns.map((pattern, i) => (
                  <Subtle key={`${pattern}-${i}`}>• {pattern}</Subtle>
                ))}
              </View>
            </Card>
          )}

          <Subtle style={{ textAlign: "center", marginTop: 12 }}>
            {t("bg_disclaimer")}
          </Subtle>
        </ScrollView>
      </Screen>
    </Background>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  backgroundColor: "#FFFFFF",
};
