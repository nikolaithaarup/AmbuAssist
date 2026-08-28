import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  calculateNews2,
  classifyNews2Escalation,
  type Avpu,
  type SpO2Scale,
} from "../../../src/domain/news2/scoring";
import { useT } from "../../../src/i18n/useT";
import { getReference, type ReferenceDoc } from "../../../src/services/referenceService";
import { useSettings } from "../../../src/state/settings";
import { Background } from "../../../src/ui/Background";
import { ClinicalDisclosure } from "../../../src/ui/ClinicalDisclosure";
import { hapticReset } from "../../../src/ui/haptics";
import {
  ToolActionButton,
  ToolPageHeader,
  ToolSectionLabel,
  ToolSurface,
} from "../../../src/ui/ToolSurface";
import { Input, Screen, Subtle } from "../../../src/ui/Ui";
import { theme } from "../../../src/ui/theme";
import { useSuccessHaptic } from "../../../src/ui/useSuccessHaptic";

function toNum(value: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return NaN;
  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function SegmentButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: 44,
        minHeight: 44,
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: selected ? theme.colors.accent : theme.colors.cardBorder,
        backgroundColor: selected ? theme.colors.accentSurface : "rgba(0,0,0,0.10)",
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Text style={{ color: theme.colors.text, fontWeight: "900", textAlign: "center" }}>{label}</Text>
    </Pressable>
  );
}

function VitalInput({
  label,
  value,
  placeholder,
  points,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  points: number;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={{ flexGrow: 1, flexBasis: "46%", minWidth: 118, gap: 6 }}>
      <View style={{ minHeight: 25, flexDirection: "row", alignItems: "center", gap: 7 }}>
        <Text style={{ flex: 1, color: theme.colors.text, fontSize: 13, fontWeight: "800" }}>{label}</Text>
        <View
          style={{
            minWidth: 25,
            height: 25,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: points > 0 ? "rgba(221,189,98,0.18)" : "rgba(255,255,255,0.05)",
          }}
        >
          <Text style={{ color: points > 0 ? theme.colors.warn : theme.colors.mutedText, fontSize: 12, fontWeight: "900" }}>{points}</Text>
        </View>
      </View>
      <Input
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType="decimal-pad"
        selectTextOnFocus
        style={{ flex: 0, width: "100%", minHeight: 48, textAlign: "center", fontSize: 18, fontWeight: "800" }}
      />
    </View>
  );
}

export default function NEWS2() {
  const { t } = useT();
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";
  const [reference, setReference] = useState<ReferenceDoc | null>(null);
  const [rr, setRr] = useState("");
  const [spo2, setSpo2] = useState("");
  const [sbp, setSbp] = useState("");
  const [hr, setHr] = useState("");
  const [temp, setTemp] = useState("");
  const [onO2, setOnO2] = useState(false);
  const [scale, setScale] = useState<SpO2Scale>(1);
  const [avpu, setAvpu] = useState<Avpu>("A");

  useEffect(() => {
    let active = true;
    async function loadReference() {
      const data = await getReference("news2");
      if (active) setReference(data);
    }
    void loadReference();
    return () => {
      active = false;
    };
  }, []);

  const computed = useMemo(() => {
    const scores = calculateNews2({
      rr: toNum(rr),
      spo2: toNum(spo2),
      sbp: toNum(sbp),
      hr: toNum(hr),
      temp: toNum(temp),
      onO2,
      scale,
      avpu,
    });
    return {
      ...scores,
      filledCount: [rr, spo2, sbp, hr, temp].filter((value) => value.trim().length > 0).length,
    };
  }, [rr, spo2, sbp, hr, temp, onO2, scale, avpu]);

  const guidanceKey = classifyNews2Escalation(computed.total, computed.anyThree);
  useSuccessHaptic([rr, spo2, sbp, hr, temp].every((value) => Number.isFinite(toNum(value))));

  function reset() {
    hapticReset();
    setRr("");
    setSpo2("");
    setSbp("");
    setHr("");
    setTemp("");
    setOnO2(false);
    setScale(1);
    setAvpu("A");
  }

  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <ToolPageHeader title={t("news2_title")} subtitle={t("news2_sub")} />

          <ToolSurface
            tone={
              computed.total >= 7 || computed.anyThree
                ? "danger"
                : computed.total >= 5
                  ? "warning"
                  : "accent"
            }
          >
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <ToolSectionLabel>{t("result")}</ToolSectionLabel>
                <Text style={{ color: theme.colors.text, fontSize: 34, lineHeight: 40, fontWeight: "900" }}>
                  NEWS2: {computed.total}
                </Text>
              </View>
              <Text style={{ color: theme.colors.mutedText, fontSize: 12, fontWeight: "800" }}>{computed.filledCount}/5</Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20 }}>{t(guidanceKey)}</Text>
            <Text style={{ color: theme.colors.mutedText, fontSize: 12, lineHeight: 17 }}>
              RR {computed.pRR} · SpO₂ {computed.spo2Points} · O₂ {computed.o2Points} · SBP {computed.pSBP} · HR {computed.pHR} · CNS {computed.pC} · Temp {computed.pT}
            </Text>
          </ToolSurface>

          <ToolSurface>
            <ToolSectionLabel>{t("news2_scale")}</ToolSectionLabel>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <SegmentButton label={t("news2_scale1")} selected={scale === 1} onPress={() => setScale(1)} />
              <SegmentButton label={t("news2_scale2")} selected={scale === 2} onPress={() => setScale(2)} />
            </View>
            <ToolSectionLabel>{t("news2_o2")}</ToolSectionLabel>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <SegmentButton label={t("no")} selected={!onO2} onPress={() => setOnO2(false)} />
              <SegmentButton label={t("yes")} selected={onO2} onPress={() => setOnO2(true)} />
            </View>
            <ToolSectionLabel>{t("news2_consciousness")}</ToolSectionLabel>
            <View style={{ flexDirection: "row", gap: 7 }}>
              {(["A", "V", "P", "U"] as const).map((value) => (
                <SegmentButton key={value} label={value} selected={avpu === value} onPress={() => setAvpu(value)} />
              ))}
            </View>
          </ToolSurface>

          <ToolSurface>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <ToolSectionLabel>{t("tool_filled")} {computed.filledCount}/5</ToolSectionLabel>
              <Text style={{ marginLeft: "auto", color: theme.colors.mutedText, fontSize: 11 }}>{t("news2_points")}</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <VitalInput label={t("news2_rr")} value={rr} onChangeText={setRr} placeholder={t("news2_rr_placeholder")} points={computed.pRR} />
              <VitalInput label={t("news2_spo2")} value={spo2} onChangeText={setSpo2} placeholder={t("news2_spo2_placeholder")} points={computed.spo2Points + computed.o2Points} />
              <VitalInput label={t("news2_sbp")} value={sbp} onChangeText={setSbp} placeholder={t("news2_sbp_placeholder")} points={computed.pSBP} />
              <VitalInput label={t("news2_hr")} value={hr} onChangeText={setHr} placeholder={t("news2_hr_placeholder")} points={computed.pHR} />
              <VitalInput label={t("news2_temp")} value={temp} onChangeText={setTemp} placeholder={t("news2_temp_placeholder")} points={computed.pT} />
            </View>
            <Subtle>{t("news2_guidance_note")}</Subtle>
            <ToolActionButton label={t("reset")} tone="secondary" onPress={reset} />
          </ToolSurface>

          <ClinicalDisclosure
            disclaimer={reference?.disclaimer[lang] ?? ""}
            sourcesIntro={reference?.sourcesSub[lang] ?? ""}
            sources={(reference?.sources ?? []).map((source) => ({
              id: source.id,
              title: source.title[lang],
              subtitle: source.subtitle[lang],
              url: source.url?.[lang],
            }))}
          />
        </ScrollView>
      </Screen>
    </Background>
  );
}
