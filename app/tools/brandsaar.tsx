import { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { chip } from "../../src/features/destination/ui";
import { useSettings } from "../../src/state/settings";
import { Background } from "../../src/ui/Background";
import { CollapsibleCard } from "../../src/ui/CollapsibleCard";
import { Card, Row, Screen, Subtle, Title } from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";

type AgeGroup = "adult" | "child";

const RH_BURNS_PHONE = "+4535451245";

const BURNS_SOURCE_URL =
  "https://drive.google.com/file/d/1d15X3jYTSIpkYOSs-muhuLSJ4WmtrH2I/view?usp=sharing";

const adultZones = [
  { id: "head", labelDa: "Hoved/hals", labelEn: "Head/neck", percent: 9 },
  {
    id: "frontTorso",
    labelDa: "Forbryst/mave",
    labelEn: "Anterior trunk",
    percent: 18,
  },
  {
    id: "backTorso",
    labelDa: "Ryg",
    labelEn: "Posterior trunk",
    percent: 18,
  },
  { id: "leftArm", labelDa: "Venstre arm", labelEn: "Left arm", percent: 9 },
  { id: "rightArm", labelDa: "Højre arm", labelEn: "Right arm", percent: 9 },
  { id: "leftLeg", labelDa: "Venstre ben", labelEn: "Left leg", percent: 18 },
  { id: "rightLeg", labelDa: "Højre ben", labelEn: "Right leg", percent: 18 },
  { id: "perineum", labelDa: "Perineum", labelEn: "Perineum", percent: 1 },
];

const childZones = [
  { id: "head", labelDa: "Hoved/hals", labelEn: "Head/neck", percent: 18 },
  {
    id: "frontTorso",
    labelDa: "Forbryst/mave",
    labelEn: "Anterior trunk",
    percent: 18,
  },
  {
    id: "backTorso",
    labelDa: "Ryg",
    labelEn: "Posterior trunk",
    percent: 18,
  },
  { id: "leftArm", labelDa: "Venstre arm", labelEn: "Left arm", percent: 9 },
  { id: "rightArm", labelDa: "Højre arm", labelEn: "Right arm", percent: 9 },
  { id: "leftLeg", labelDa: "Venstre ben", labelEn: "Left leg", percent: 14 },
  { id: "rightLeg", labelDa: "Højre ben", labelEn: "Right leg", percent: 14 },
];

function parseNumber(value: string) {
  const cleaned = value.replace(",", ".").replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number) {
  return Math.round(value);
}

function InfoLine({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ color: theme.colors.mutedText, lineHeight: 21 }}>
      {children}
    </Text>
  );
}

function ZoneButton({
  label,
  percent,
  selected,
  onPress,
}: {
  label: string;
  percent: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: "45%",
        opacity: pressed ? 0.7 : 1,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: selected ? theme.colors.text : theme.colors.border,
        backgroundColor: selected
          ? "rgba(255,255,255,0.14)"
          : "rgba(255,255,255,0.04)",
      })}
    >
      <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
        {label}
      </Text>
      <Text style={{ color: theme.colors.mutedText, marginTop: 4 }}>
        {percent}%
      </Text>
    </Pressable>
  );
}

function SourceItem({
  title,
  subtitle,
  url,
}: {
  title: string;
  subtitle?: string;
  url?: string;
}) {
  const openSource = async () => {
    if (!url) return;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Kunne ikke åbne link", url);
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert("Fejl", "Linket kunne ikke åbnes.");
    }
  };

  if (url) {
    return (
      <Pressable
        onPress={openSource}
        style={({ pressed }) => ({
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.06)",
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text
          style={{
            color: "#8ec5ff",
            fontSize: 14,
            fontWeight: "800",
            lineHeight: 18,
            textDecorationLine: "underline",
          }}
        >
          {title}
        </Text>

        {!!subtitle && (
          <Text
            style={{
              color: theme.colors.mutedText,
              fontSize: 12,
              lineHeight: 17,
              marginTop: 4,
            }}
          >
            {subtitle}
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <View
      style={{
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.06)",
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: "800",
          lineHeight: 18,
        }}
      >
        {title}
      </Text>

      {!!subtitle && (
        <Text
          style={{
            color: theme.colors.mutedText,
            fontSize: 12,
            lineHeight: 17,
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export default function BurnsPage() {
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";

  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [manualPercent, setManualPercent] = useState("");
  const [weight, setWeight] = useState("");
  const [useManual, setUseManual] = useState(false);

  const zones = ageGroup === "adult" ? adultZones : childZones;

  const selectedPercent = useMemo(() => {
    return zones
      .filter((zone) => selectedZones.includes(zone.id))
      .reduce((sum, zone) => sum + zone.percent, 0);
  }, [selectedZones, zones]);

  const manualTbsa = parseNumber(manualPercent);
  const tbsa = useManual ? manualTbsa : selectedPercent;
  const patientWeight = parseNumber(weight);

  const isFluidRelevant = ageGroup === "adult" ? tbsa >= 20 : tbsa >= 10;

  const modifiedParklandTotal =
    patientWeight > 0 && tbsa > 0 ? patientWeight * tbsa * 3 : 0;

  const firstEightHours = modifiedParklandTotal / 2;
  const nextSixteenHours = modifiedParklandTotal / 2;

  const firstHourRate = firstEightHours / 8;
  const laterHourRate = nextSixteenHours / 16;

  const disclaimerText =
    lang === "da"
      ? "Dette værktøj er kun beslutningsstøtte og erstatter ikke klinisk vurdering, lokale instrukser eller lægelig konference. TBSA og væske er estimater og skal tilpasses patientens tilstand."
      : "This tool is decision support only and does not replace clinical assessment, local protocols or medical consultation. TBSA and fluid calculations are estimates and must be adjusted to the patient.";

  const sourcesSubText =
    lang === "da"
      ? "Kildegrundlag for brandsårsbehandling, RH-kontakt, TBSA-vurdering og modificeret Parkland-estimat."
      : "Source basis for burn treatment, RH contact, TBSA assessment and modified Parkland estimate.";

  const renderedSources = [
    {
      id: "burns-rh-pocket-card",
      title:
        lang === "da"
          ? "Rigshospitalet / Brandsår.dk — Guidelines til behandling af brandsår"
          : "Rigshospitalet / Brandsår.dk — Guidelines for burn treatment",
      subtitle:
        lang === "da"
          ? "RH lommekort med præhospital behandling, skylning, PVK x2, smertebehandling, transport, TBSA-grænser og modificeret Parkland-vejledning."
          : "RH pocket card covering prehospital treatment, cooling, IV access, pain relief, transport, TBSA thresholds and modified Parkland guidance.",
      url: BURNS_SOURCE_URL,
    },
    {
      id: "burns-clinical-verification",
      title:
        lang === "da"
          ? "Klinisk verifikation kræves"
          : "Clinical verification required",
      subtitle:
        lang === "da"
          ? "Resultater i dette værktøj er vejledende og skal altid verificeres mod gældende lokale instrukser, lægelig konference og klinisk vurdering."
          : "Results in this tool are advisory and must always be verified against current local protocols, medical consultation and clinical judgement.",
    },
  ];

  const toggleZone = (id: string) => {
    setSelectedZones((current) =>
      current.includes(id)
        ? current.filter((zoneId) => zoneId !== id)
        : [...current, id],
    );
  };

  const callBurnsDoctor = async () => {
    const url = `tel:${RH_BURNS_PHONE}`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(
          lang === "da" ? "Kunne ikke ringe op" : "Could not call",
          RH_BURNS_PHONE,
        );
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert(
        lang === "da" ? "Kunne ikke ringe op" : "Could not call",
        RH_BURNS_PHONE,
      );
    }
  };

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12, alignItems: "center" }}>
          <Title style={{ textAlign: "center" }}>
            {lang === "da" ? "Brandsår" : "Burns"}
          </Title>

          <Subtle style={{ textAlign: "center" }}>
            {lang === "da"
              ? "TBSA, RH kontakt, væskeestimat og præhospital huskeliste"
              : "TBSA, RH contact, fluid estimate and prehospital checklist"}
          </Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            <Title>
              {lang === "da" ? "Kontakt brandsårslæge" : "Call burns doctor"}
            </Title>

            <View style={{ marginTop: 12, gap: 12 }}>
              <Row>
                <Text style={{ color: theme.colors.mutedText, width: 120 }}>
                  Rigshospitalet
                </Text>

                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 20,
                    flex: 1,
                  }}
                >
                  {RH_BURNS_PHONE}
                </Text>
              </Row>

              <Pressable onPress={callBurnsDoctor} style={chip(false)}>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    textAlign: "center",
                  }}
                >
                  {lang === "da"
                    ? "Ring til RH brandsårslæge"
                    : "Call RH burns doctor"}
                </Text>
              </Pressable>
            </View>
          </Card>

          <Card>
            <Title>{lang === "da" ? "Patienttype" : "Patient type"}</Title>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              <Pressable
                onPress={() => {
                  setAgeGroup("adult");
                  setSelectedZones([]);
                }}
                style={chip(ageGroup === "adult")}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {lang === "da" ? "Voksen / >15 år" : "Adult / >15 years"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setAgeGroup("child");
                  setSelectedZones([]);
                }}
                style={chip(ageGroup === "child")}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {lang === "da" ? "Barn / ≤15 år" : "Child / ≤15 years"}
                </Text>
              </Pressable>
            </View>
          </Card>

          <Card>
            <Title>
              {lang === "da" ? "Klik TBSA-zoner" : "Tap TBSA zones"}
            </Title>

            <Subtle style={{ marginTop: 8 }}>
              {lang === "da"
                ? "Brug som groft estimat. Patientens håndflade inkl. fingre svarer cirka til 1%."
                : "Use as a rough estimate. The patient’s palm including fingers is approximately 1%."}
            </Subtle>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 12,
              }}
            >
              {zones.map((zone) => (
                <ZoneButton
                  key={zone.id}
                  label={lang === "da" ? zone.labelDa : zone.labelEn}
                  percent={zone.percent}
                  selected={selectedZones.includes(zone.id)}
                  onPress={() => {
                    setUseManual(false);
                    toggleZone(zone.id);
                  }}
                />
              ))}
            </View>

            <View
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <Text style={{ color: theme.colors.mutedText }}>
                {lang === "da" ? "Total estimat" : "Total estimate"}
              </Text>

              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "900",
                  fontSize: 28,
                  marginTop: 4,
                }}
              >
                {selectedPercent}%
              </Text>
            </View>
          </Card>

          <Card>
            <Title>{lang === "da" ? "Manuel TBSA" : "Manual TBSA"}</Title>

            <View style={{ marginTop: 12, gap: 10 }}>
              <TextInput
                value={manualPercent}
                onChangeText={(text) => {
                  setManualPercent(text);
                  setUseManual(true);
                }}
                keyboardType="numeric"
                placeholder={lang === "da" ? "Fx 12" : "E.g. 12"}
                placeholderTextColor={theme.colors.mutedText}
                style={{
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 16,
                  padding: 12,
                  fontSize: 18,
                  backgroundColor: "rgba(255,255,255,0.04)",
                }}
              />

              <Pressable
                onPress={() => setUseManual(!useManual)}
                style={chip(useManual)}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {useManual
                    ? lang === "da"
                      ? "Bruger manuel TBSA"
                      : "Using manual TBSA"
                    : lang === "da"
                      ? "Bruger manuelt estimat"
                      : "Using tap estimate"}
                </Text>
              </Pressable>
            </View>
          </Card>

          <Card>
            <Title>
              {lang === "da"
                ? "Væskeestimat — modificeret Parkland"
                : "Fluid estimate — modified Parkland"}
            </Title>

            <View style={{ marginTop: 12, gap: 10 }}>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder={lang === "da" ? "Vægt i kg" : "Weight in kg"}
                placeholderTextColor={theme.colors.mutedText}
                style={{
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 16,
                  padding: 12,
                  fontSize: 18,
                  backgroundColor: "rgba(255,255,255,0.04)",
                }}
              />

              <View
                style={{
                  padding: 14,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  gap: 8,
                }}
              >
                <Row>
                  <Text style={{ color: theme.colors.mutedText, width: 130 }}>
                    TBSA
                  </Text>

                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                    {tbsa}%
                  </Text>
                </Row>

                <Row>
                  <Text style={{ color: theme.colors.mutedText, width: 130 }}>
                    {lang === "da" ? "Relevant ved" : "Relevant from"}
                  </Text>

                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      flex: 1,
                    }}
                  >
                    {ageGroup === "adult" ? "≥20% TBSA" : "≥10% TBSA"}
                  </Text>
                </Row>

                <Row>
                  <Text style={{ color: theme.colors.mutedText, width: 130 }}>
                    Status
                  </Text>

                  <Text
                    style={{
                      color: isFluidRelevant
                        ? theme.colors.text
                        : theme.colors.mutedText,
                      fontWeight: "900",
                      flex: 1,
                    }}
                  >
                    {isFluidRelevant
                      ? lang === "da"
                        ? "Væskeresuscitering bør overvejes"
                        : "Consider fluid resuscitation"
                      : lang === "da"
                        ? "Under standard væskegrænse"
                        : "Below usual fluid threshold"}
                  </Text>
                </Row>
              </View>

              {patientWeight > 0 && tbsa > 0 && (
                <View
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: "rgba(255,255,255,0.04)",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      fontSize: 16,
                    }}
                  >
                    {round(modifiedParklandTotal)} ml Ringer-laktat / første 24
                    timer
                  </Text>

                  <InfoLine>
                    {lang === "da"
                      ? `Første 8 timer: ca. ${round(firstEightHours)} ml (${round(
                          firstHourRate,
                        )} ml/t).`
                      : `First 8 hours: approx. ${round(firstEightHours)} ml (${round(
                          firstHourRate,
                        )} ml/h).`}
                  </InfoLine>

                  <InfoLine>
                    {lang === "da"
                      ? `Næste 16 timer: ca. ${round(nextSixteenHours)} ml (${round(
                          laterHourRate,
                        )} ml/t).`
                      : `Next 16 hours: approx. ${round(nextSixteenHours)} ml (${round(
                          laterHourRate,
                        )} ml/h).`}
                  </InfoLine>

                  <InfoLine>
                    {lang === "da"
                      ? "Juster altid efter klinik, transporttid, lokal instruks og lægelig konference."
                      : "Always adjust to clinical status, transport time, local protocol and medical consult."}
                  </InfoLine>
                </View>
              )}
            </View>
          </Card>

          <Card>
            <Title>
              {lang === "da"
                ? "Konferér / overvej RH"
                : "Consult / consider RH"}
            </Title>

            <View style={{ gap: 8, marginTop: 10 }}>
              <InfoLine>• &gt;10% TBSA hos voksne</InfoLine>
              <InfoLine>• &gt;5% TBSA hos børn</InfoLine>
              <InfoLine>• &gt;5% dyb skade</InfoLine>
              <InfoLine>• Ansigt, hænder, fødder eller store led</InfoLine>
              <InfoLine>• Cirkulære dybe skader</InfoLine>
              <InfoLine>• Inhalationsskade</InfoLine>
              <InfoLine>• Ætsning eller elektricitet</InfoLine>
              <InfoLine>
                • Større traume, mishandling eller væsentlig komorbiditet
              </InfoLine>
            </View>
          </Card>

          <Card>
            <Title>
              {lang === "da"
                ? "Præhospital huskeliste"
                : "Prehospital checklist"}
            </Title>

            <View style={{ gap: 8, marginTop: 10 }}>
              <InfoLine>
                1. Skyl med køligt vand ca. 15°C i max 20–30 min.
              </InfoLine>
              <InfoLine>
                2. Undgå hypotermi — hold resten af patienten varm.
              </InfoLine>
              <InfoLine>3. Anlæg PVK x2 ved større brandskader.</InfoLine>
              <InfoLine>
                4. Giv sufficient smertestillende efter lokal instruks.
              </InfoLine>
              <InfoLine>
                5. Pak patienten ind og hold varm under transport.
              </InfoLine>
              <InfoLine>
                6. Konferér med RH brandsårslæge ved relevante kriterier.
              </InfoLine>
              <InfoLine>
                7. Ved inhalationsmistanke: høj ilt, tidlig ABCDE og overvej
                hurtig transport.
              </InfoLine>
            </View>
          </Card>

          <CollapsibleCard
            title={lang === "da" ? "Disclaimer" : "Disclaimer"}
            subtitle={disclaimerText}
          >
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                padding: 12,
                backgroundColor: "rgba(255,209,102,0.10)",
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {disclaimerText}
              </Text>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title={lang === "da" ? "Kilder" : "Sources"}
            subtitle={sourcesSubText}
          >
            <Subtle style={{ marginBottom: 8 }}>{sourcesSubText}</Subtle>

            <View style={{ marginTop: 8 }}>
              {renderedSources.map((source) => (
                <SourceItem
                  key={source.id}
                  title={source.title}
                  subtitle={source.subtitle}
                  url={source.url}
                />
              ))}
            </View>
          </CollapsibleCard>
        </ScrollView>
      </Screen>
    </Background>
  );
}
