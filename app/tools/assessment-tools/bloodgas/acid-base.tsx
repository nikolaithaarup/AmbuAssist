import { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { useT } from "../../../../src/i18n/useT";
import { Background } from "../../../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../../../src/ui/Ui";

function parse(val: string) {
  const n = parseFloat(val.replace(",", "."));
  return isNaN(n) ? undefined : n;
}

export default function AcidBasePage() {
  const { t } = useT();

  const [ph, setPh] = useState("");
  const [pco2, setPco2] = useState("");
  const [hco3, setHco3] = useState("");

  const pH = parse(ph);
  const pCO2 = parse(pco2);
  const HCO3 = parse(hco3);

  function interpret() {
    if (!pH || !pCO2 || !HCO3) return null;

    let primary = "";
    let type = "";
    let compensation = "";

    // Step 1: Acidosis vs alkalosis
    if (pH < 7.35) primary = "acidosis";
    else if (pH > 7.45) primary = "alkalosis";
    else primary = "normal";

    // Step 2: Determine cause
    if (primary === "acidosis") {
      if (pCO2 > 6) type = "respiratory";
      else if (HCO3 < 22) type = "metabolic";
    }

    if (primary === "alkalosis") {
      if (pCO2 < 4.5) type = "respiratory";
      else if (HCO3 > 26) type = "metabolic";
    }

    // Step 3: compensation (VERY simplified)
    if (type === "metabolic") {
      compensation = "respiratory compensation likely";
    } else if (type === "respiratory") {
      compensation = "metabolic compensation likely";
    }

    return { primary, type, compensation };
  }

  const result = interpret();

  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Title style={{ textAlign: "center" }}>
            {t("tool_bg_acidbase_title")}
          </Title>

          <Subtle style={{ textAlign: "center" }}>
            {t("tool_bg_acidbase_desc")}
          </Subtle>

          <Card>
            <TextInput
              placeholder="pH (7.35–7.45)"
              keyboardType="decimal-pad"
              value={ph}
              onChangeText={setPh}
            />
            <TextInput
              placeholder="pCO₂ (kPa)"
              keyboardType="decimal-pad"
              value={pco2}
              onChangeText={setPco2}
            />
            <TextInput
              placeholder="HCO₃⁻ (mmol/L)"
              keyboardType="decimal-pad"
              value={hco3}
              onChangeText={setHco3}
            />
          </Card>

          {result && (
            <Card>
              <Title>{t("result")}</Title>
              <Subtle>
                {result.primary} – {result.type}
              </Subtle>
              <Subtle>{result.compensation}</Subtle>
            </Card>
          )}

          <Subtle style={{ textAlign: "center", marginTop: 12 }}>
            ⚠️ Support tool only – not for diagnosis
          </Subtle>
        </ScrollView>
      </Screen>
    </Background>
  );
}
