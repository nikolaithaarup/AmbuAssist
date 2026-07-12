import { Text, View } from "react-native";
import { useSettings } from "../../state/settings";
import { Card, Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";
import { DevelopmentChip } from "./PrelaunchGate";

export function BloodGasPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { settings } = useSettings();
  const isDa = settings.language === "da";
  return (
    <View style={{ gap: 8, marginTop: 12, marginBottom: 4 }}>
      <DevelopmentChip />
      <Title style={{ fontSize: 27 }}>{title}</Title>
      <Subtle style={{ fontSize: 14, lineHeight: 20 }}>{subtitle}</Subtle>
      <View style={{ borderRadius: 12, borderWidth: 1, borderColor: "rgba(221,189,98,0.35)", backgroundColor: "rgba(221,189,98,0.08)", padding: 12, gap: 5 }}>
        <Text style={{ color: theme.colors.warn, fontWeight: "900" }}>{isDa ? "Kun venøs blodgas (VGAS)" : "Venous blood gas (VGAS) only"}</Text>
        <Subtle style={{ lineHeight: 19 }}>{isDa ? "Beslutningsstøtte baseret på indtastede værdier. Kontrollér mod analysatoren, patientens klinik, vitalparametre, iltbehandling, måleusikkerhed og lokale retningslinjer." : "Decision support based on entered values. Verify against the analyser, clinical context, vital signs, oxygen therapy, measurement uncertainty, and local guidelines."}</Subtle>
      </View>
    </View>
  );
}

export function VgasPo2Caution() {
  const { settings } = useSettings();
  return <ResultSection label={settings.language === "da" ? "Iltning og pO₂ på VGAS" : "Oxygenation and pO₂ on VGAS"} tone="caution"><Subtle style={{ lineHeight: 20 }}>{settings.language === "da" ? "pO₂ på VGAS kan ikke bruges alene til sikker vurdering af iltning. Sammenhold med SpO₂, klinik, iltbehandling og lokale retningslinjer." : "VGAS pO₂ cannot reliably assess oxygenation on its own. Compare with SpO₂, clinical context, oxygen therapy, and local guidelines."}</Subtle></ResultSection>;
}

export function BloodGasProvenance() {
  const { settings } = useSettings();
  const isDa = settings.language === "da";
  return <Card style={{ gap: 6 }}><Text style={{ color: theme.colors.accentMuted, fontWeight: "900" }}>{isDa ? "Kilde / version" : "Source / version"}</Text><Subtle style={{ lineHeight: 19 }}>{isDa ? "Version: lokal foreløbig / kræver klinisk validering. Akutbil-materialet er kun anvendt som workflowreference; intervaller og fortolkningsstøtte skal valideres lokalt." : "Version: local draft / requires clinical validation. Akutbil material was used as workflow reference only; intervals and interpretation support require local validation."}</Subtle></Card>;
}

type Tone = "neutral" | "caution" | "urgent" | "normal";

export function ResultSection({ label, children, tone = "neutral" }: { label: string; children: React.ReactNode; tone?: Tone }) {
  const color = tone === "urgent" ? theme.colors.danger : tone === "caution" ? theme.colors.warn : tone === "normal" ? theme.colors.ok : theme.colors.accentMuted;
  return (
    <View style={{ borderLeftWidth: 3, borderLeftColor: color, paddingLeft: 12, gap: 6 }}>
      <Text style={{ color, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.7 }}>{label}</Text>
      {children}
    </View>
  );
}

export function EmptyResult({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  return (
    <Card style={{ borderStyle: "dashed", backgroundColor: "rgba(31,35,28,0.55)" }}>
      <Title style={{ fontSize: 17 }}>{settings.language === "da" ? "Afventer værdier" : "Awaiting values"}</Title>
      <Subtle style={{ lineHeight: 20 }}>{children}</Subtle>
    </Card>
  );
}
