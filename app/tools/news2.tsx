import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useT } from "../../src/i18n/useT";
import { Background } from "../../src/ui/Background";
import {
  Card,
  Input,
  Label,
  Row,
  Screen,
  Subtle,
  Title,
} from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";

type SpO2Scale = 1 | 2;

function toNum(s: string) {
  const n = Number(String(s).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function scoreRR(rr: number) {
  if (!Number.isFinite(rr)) return 0;
  if (rr <= 8) return 3;
  if (rr <= 11) return 1;
  if (rr <= 20) return 0;
  if (rr <= 24) return 2;
  return 3;
}

function scoreSBP(sbp: number) {
  if (!Number.isFinite(sbp)) return 0;
  if (sbp <= 90) return 3;
  if (sbp <= 100) return 2;
  if (sbp <= 110) return 1;
  if (sbp <= 219) return 0;
  return 3;
}

function scoreHR(hr: number) {
  if (!Number.isFinite(hr)) return 0;
  if (hr <= 40) return 3;
  if (hr <= 50) return 1;
  if (hr <= 90) return 0;
  if (hr <= 110) return 1;
  if (hr <= 130) return 2;
  return 3;
}

function scoreTemp(t: number) {
  if (!Number.isFinite(t)) return 0;
  if (t <= 35.0) return 3;
  if (t <= 36.0) return 1;
  if (t <= 38.0) return 0;
  if (t <= 39.0) return 1;
  return 2;
}

function scoreSpO2(scale: SpO2Scale, spo2: number, onO2: boolean) {
  const o2Points = onO2 ? 2 : 0;

  if (!Number.isFinite(spo2)) return { spo2Points: 0, o2Points };

  // Scale 1
  if (scale === 1) {
    if (spo2 <= 91) return { spo2Points: 3, o2Points };
    if (spo2 <= 93) return { spo2Points: 2, o2Points };
    if (spo2 <= 95) return { spo2Points: 1, o2Points };
    return { spo2Points: 0, o2Points };
  }

  // Scale 2 (common mapping)
  if (spo2 <= 83) return { spo2Points: 3, o2Points };
  if (spo2 <= 85) return { spo2Points: 2, o2Points };
  if (spo2 <= 87) return { spo2Points: 1, o2Points };
  if (spo2 <= 92) return { spo2Points: 0, o2Points };
  if (spo2 <= 94) return { spo2Points: 1, o2Points };
  if (spo2 <= 96) return { spo2Points: 2, o2Points };
  return { spo2Points: 3, o2Points };
}

function guidanceKey(total: number, anyThree: boolean) {
  if (total === 0) return "news2_guidance_0";
  if (total >= 7) return "news2_guidance_high";
  if (anyThree) return "news2_guidance_any3";
  if (total >= 5) return "news2_guidance_med";
  return "news2_guidance_low";
}

export default function NEWS2() {
  const { t } = useT();

  const [rr, setRr] = useState("");
  const [spo2, setSpo2] = useState("");
  const [sbp, setSbp] = useState("");
  const [hr, setHr] = useState("");
  const [temp, setTemp] = useState("");

  const [onO2, setOnO2] = useState(false);
  const [scale, setScale] = useState<SpO2Scale>(1);
  const [avpu, setAvpu] = useState<"A" | "V" | "P" | "U">("A");

  const computed = useMemo(() => {
    const vRR = toNum(rr);
    const vSp = toNum(spo2);
    const vSBP = toNum(sbp);
    const vHR = toNum(hr);
    const vT = toNum(temp);

    const pRR = scoreRR(vRR);
    const { spo2Points, o2Points } = scoreSpO2(scale, vSp, onO2);
    const pSBP = scoreSBP(vSBP);
    const pHR = scoreHR(vHR);
    const pT = scoreTemp(vT);
    const pC = avpu === "A" ? 0 : 3;

    const parts = [pRR, spo2Points, o2Points, pSBP, pHR, pC, pT];
    const total = parts.reduce((a, b) => a + b, 0);
    const anyThree = parts.some((x) => x === 3);

    return { total, anyThree, pRR, spo2Points, o2Points, pSBP, pHR, pC, pT };
  }, [rr, spo2, sbp, hr, temp, onO2, scale, avpu]);

  const gKey = guidanceKey(computed.total, computed.anyThree);

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("news2_title")}</Title>
          <Subtle>{t("news2_sub")}</Subtle>
        </View>

        <Card>
          <Row>
            <Label>{t("news2_scale")}</Label>
            <Pressable
              onPress={() => setScale(1)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                backgroundColor:
                  scale === 1 ? "rgba(220,220,220,0.18)" : "transparent",
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                {t("news2_scale1")}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setScale(2)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                backgroundColor:
                  scale === 2 ? "rgba(220,220,220,0.18)" : "transparent",
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                {t("news2_scale2")}
              </Text>
            </Pressable>
          </Row>

          <Row>
            <Label>{t("news2_o2")}</Label>
            <Pressable
              onPress={() => setOnO2((p) => !p)}
              style={{
                marginLeft: "auto",
                width: 56,
                height: 32,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                backgroundColor: onO2
                  ? "rgba(140,233,154,0.22)"
                  : "rgba(0,0,0,0.14)",
                justifyContent: "center",
                paddingHorizontal: 6,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  backgroundColor: theme.colors.text,
                  transform: [{ translateX: onO2 ? 22 : 0 }],
                }}
              />
            </Pressable>
          </Row>

          <Row>
            <Label>{t("news2_consciousness")}</Label>
            {(["A", "V", "P", "U"] as const).map((k) => (
              <Pressable
                key={k}
                onPress={() => setAvpu(k)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor:
                    avpu === k ? "rgba(220,220,220,0.18)" : "transparent",
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {k}
                </Text>
              </Pressable>
            ))}
          </Row>
        </Card>

        <Card>
          <Row>
            <Label>{t("news2_rr")}</Label>
            <Input value={rr} onChangeText={setRr} placeholder="breaths/min" />
            <Text style={{ color: theme.colors.mutedText }}>
              {t("news2_points")} {computed.pRR}
            </Text>
          </Row>

          <Row>
            <Label>{t("news2_spo2")}</Label>
            <Input value={spo2} onChangeText={setSpo2} placeholder="%" />
            <Text style={{ color: theme.colors.mutedText }}>
              {t("news2_points")} {computed.spo2Points + computed.o2Points}
            </Text>
          </Row>

          <Row>
            <Label>{t("news2_sbp")}</Label>
            <Input value={sbp} onChangeText={setSbp} placeholder="mmHg" />
            <Text style={{ color: theme.colors.mutedText }}>
              {t("news2_points")} {computed.pSBP}
            </Text>
          </Row>

          <Row>
            <Label>{t("news2_hr")}</Label>
            <Input value={hr} onChangeText={setHr} placeholder="bpm" />
            <Text style={{ color: theme.colors.mutedText }}>
              {t("news2_points")} {computed.pHR}
            </Text>
          </Row>

          <Row>
            <Label>{t("news2_temp")}</Label>
            <Input value={temp} onChangeText={setTemp} placeholder="°C" />
            <Text style={{ color: theme.colors.mutedText }}>
              {t("news2_points")} {computed.pT}
            </Text>
          </Row>
        </Card>

        <Card>
          <Title>{t("result")}</Title>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 22,
              fontWeight: "900",
            }}
          >
            NEWS2: {computed.total}
          </Text>

          <View
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
              padding: 12,
              backgroundColor:
                computed.total >= 7 || computed.anyThree
                  ? "rgba(255,107,107,0.12)"
                  : computed.total >= 5
                  ? "rgba(255,209,102,0.12)"
                  : "rgba(140,233,154,0.10)",
            }}
          >
            <Text
              style={{ color: theme.colors.text, fontSize: 14, lineHeight: 18 }}
            >
              {t(gKey as any)}
            </Text>
            <Text
              style={{
                color: theme.colors.mutedText,
                fontSize: 12,
                marginTop: 8,
              }}
            >
              {t("news2_guidance_note")}
            </Text>
          </View>
        </Card>
      </Screen>
    </Background>
  );
}
