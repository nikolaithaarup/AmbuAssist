import { useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  calculateBurnFluids,
  calculateTbsa,
  getBurnZones,
  isBurnFluidRelevant,
} from "../../src/domain/burns/calculations";
import type { BurnAgeGroup } from "../../src/domain/burns/constants";
import { useSettings } from "../../src/state/settings";
import { Background } from "../../src/ui/Background";
import { ClinicalDisclosure } from "../../src/ui/ClinicalDisclosure";
import { Row, Screen, Subtle, Title } from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";
import {
  ToolActionButton,
  ToolPageHeader,
  ToolSectionLabel,
  ToolSurface,
} from "../../src/ui/ToolSurface";
import { useSuccessHaptic } from "../../src/ui/useSuccessHaptic";

const RH_BURNS_PHONE = "+4535451245";

const BURNS_SOURCE_URL =
  "https://drive.google.com/file/d/1d15X3jYTSIpkYOSs-muhuLSJ4WmtrH2I/view?usp=sharing";

function parseNumber(value: string) {
  const cleaned = value.replace(",", ".").replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number) {
  return Math.round(value);
}

function InfoLine({ children }: { children: ReactNode }) {
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
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}, ${percent}%`}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: "45%",
        minHeight: 58,
        opacity: pressed ? 0.7 : 1,
        borderRadius: 14,
        padding: 10,
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

function ChoiceButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        borderRadius: 13,
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

function BurnInfoSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <ToolSurface style={{ paddingVertical: 4 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => ({ minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, opacity: pressed ? 0.72 : 1 })}
      >
        <Text style={{ flex: 1, color: theme.colors.text, fontSize: 16, fontWeight: "900" }}>{title}</Text>
        <Text accessibilityElementsHidden style={{ color: theme.colors.accentMuted, fontSize: 20 }}>{open ? "⌄" : "›"}</Text>
      </Pressable>
      {open ? <View style={{ gap: 8, paddingBottom: 11 }}>{children}</View> : null}
    </ToolSurface>
  );
}

export default function BurnsPage() {
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";

  const [ageGroup, setAgeGroup] = useState<BurnAgeGroup>("adult");
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [manualPercent, setManualPercent] = useState("");
  const [weight, setWeight] = useState("");
  const [useManual, setUseManual] = useState(false);

  const zones = getBurnZones(ageGroup);

  const selectedPercent = useMemo(
    () => calculateTbsa(ageGroup, selectedZones),
    [ageGroup, selectedZones],
  );

  const manualTbsa = parseNumber(manualPercent);
  const tbsa = useManual ? manualTbsa : selectedPercent;
  const patientWeight = parseNumber(weight);

  const isFluidRelevant = isBurnFluidRelevant(ageGroup, tbsa);

  const {
    modifiedParklandTotal,
    firstEightHours,
    nextSixteenHours,
    firstHourRate,
    laterHourRate,
  } = calculateBurnFluids(patientWeight, tbsa);
  useSuccessHaptic(patientWeight > 0 && tbsa > 0);

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
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <ToolPageHeader
            title={lang === "da" ? "Brandsår" : "Burns"}
            subtitle={lang === "da" ? "TBSA, RH-kontakt og væskeestimat" : "TBSA, RH contact and fluid estimate"}
          />

          <ToolSurface tone="accent">
            <ToolSectionLabel>{lang === "da" ? "Kontakt brandsårslæge" : "Call burns doctor"}</ToolSectionLabel>

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

              <ToolActionButton
                label={lang === "da" ? "Ring til RH brandsårslæge" : "Call RH burns doctor"}
                tone="call"
                onPress={() => void callBurnsDoctor()}
              />
            </View>
          </ToolSurface>

          <ToolSurface>
            <ToolSectionLabel>{lang === "da" ? "Patienttype" : "Patient type"}</ToolSectionLabel>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              <ChoiceButton
                label={lang === "da" ? "Voksen / >15 år" : "Adult / >15 years"}
                selected={ageGroup === "adult"}
                onPress={() => {
                  setAgeGroup("adult");
                  setSelectedZones([]);
                }}
              />

              <ChoiceButton
                label={lang === "da" ? "Barn / ≤15 år" : "Child / ≤15 years"}
                selected={ageGroup === "child"}
                onPress={() => {
                  setAgeGroup("child");
                  setSelectedZones([]);
                }}
              />
            </View>
          </ToolSurface>

          <ToolSurface>
            <Title style={{ fontSize: 19 }}>
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
          </ToolSurface>

          <ToolSurface>
            <ToolSectionLabel>{lang === "da" ? "Alternativ" : "Alternative"}</ToolSectionLabel>
            <Title style={{ fontSize: 19 }}>{lang === "da" ? "Manuel TBSA" : "Manual TBSA"}</Title>

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

              <ChoiceButton
                label={
                  useManual
                    ? lang === "da" ? "Manuel TBSA aktiv" : "Manual TBSA active"
                    : lang === "da" ? "Brug manuel TBSA" : "Use manual TBSA"
                }
                selected={useManual}
                onPress={() => setUseManual((current) => !current)}
              />
            </View>
          </ToolSurface>

          <ToolSurface tone={patientWeight > 0 && tbsa > 0 ? "accent" : "default"}>
            <Title style={{ fontSize: 19 }}>
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
          </ToolSurface>

          <BurnInfoSection title={lang === "da" ? "Konferér / overvej RH" : "Consult / consider RH"}>
            <View style={{ gap: 8 }}>
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
          </BurnInfoSection>

          <BurnInfoSection title={lang === "da" ? "Præhospital huskeliste" : "Prehospital checklist"}>
            <View style={{ gap: 8 }}>
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
          </BurnInfoSection>

          <ClinicalDisclosure
            disclaimer={disclaimerText}
            sourcesIntro={sourcesSubText}
            sources={renderedSources}
          />
        </ScrollView>
      </Screen>
    </Background>
  );
}
