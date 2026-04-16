import { useState } from "react";
import { ScrollView, TextInput, View, Switch } from "react-native";
import { useT } from "../../../../src/i18n/useT";
import { Background } from "../../../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../../../src/ui/Ui";

function parse(val: string) {
  const n = parseFloat(val.replace(",", "."));
  return isNaN(n) ? undefined : n;
}

export default function InfectionPage() {
  const { t } = useT();

  const [crp, setCrp] = useState("");
  const [nitrite, setNitrite] = useState(false);
  const [leukocytes, setLeukocytes] = useState(false);

  const CRP = parse(crp);

  function interpret() {
    const findings: string[] = [];

    // 🔬 CRP
    if (CRP !== undefined) {
      if (CRP > 100) {
        findings.push("High CRP – consider significant infection");
      } else if (CRP > 50) {
        findings.push("Moderate CRP elevation – possible infection");
      }
    }

    // 🚽 Urine
    if (nitrite && leukocytes) {
      findings.push("Nitrite + leukocytes – consider UTI");
    } else if (leukocytes) {
      findings.push("Leukocytes present – possible inflammation/infection");
    }

    return findings;
  }

  const results = interpret();

  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Title style={{ textAlign: "center" }}>
            {t("tool_bg_infection_title")}
          </Title>

          <Subtle style={{ textAlign: "center" }}>
            {t("tool_bg_infection_desc")}
          </Subtle>

          <Card>
            <TextInput
              placeholder="CRP (mg/L)"
              keyboardType="decimal-pad"
              value={crp}
              onChangeText={setCrp}
            />

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Subtle>Nitrite</Subtle>
              <Switch value={nitrite} onValueChange={setNitrite} />
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Subtle>Leukocytes</Subtle>
              <Switch value={leukocytes} onValueChange={setLeukocytes} />
            </View>
          </Card>

          {results.length > 0 && (
            <Card>
              <Title>{t("lab_result")}</Title>
              {results.map((r, i) => (
                <Subtle key={i}>• {r}</Subtle>
              ))}
            </Card>
          )}

          <Subtle style={{ textAlign: "center", marginTop: 12 }}>
            ⚠️ Support tool only – always correlate clinically
          </Subtle>
        </ScrollView>
      </Screen>
    </Background>
  );
}
