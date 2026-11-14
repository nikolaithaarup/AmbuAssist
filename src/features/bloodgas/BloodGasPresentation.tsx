import { Text, View } from "react-native";
import { useSettings } from "../../state/settings";
import { CollapsibleCard } from "../../ui/CollapsibleCard";
import { Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";

export function BloodGasPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={{ gap: 5, marginTop: 2, marginBottom: 4 }}>
    <Title style={{ fontSize: 27 }}>{title}</Title>
    {subtitle ? <Subtle style={{ fontSize: 14, lineHeight: 20 }}>{subtitle}</Subtle> : null}
  </View>;
}

export function VgasPo2Caution() {
  const { settings } = useSettings();
  return <ResultSection label={settings.language === "da" ? "VGAS og iltning" : "VGAS and oxygenation"} tone="caution"><Subtle style={{ lineHeight: 20 }}>{settings.language === "da" ? "pO₂ på VGAS kan ikke bruges alene til sikker vurdering af iltning. Sammenhold med SpO₂, klinik og iltbehandling." : "VGAS pO₂ cannot reliably assess oxygenation on its own. Compare with SpO₂, clinical context, and oxygen therapy."}</Subtle></ResultSection>;
}

export function BloodGasProvenance() {
  const { settings } = useSettings();
  const isDa = settings.language === "da";
  return <CollapsibleCard title={isDa ? "Klinisk status og begrænsninger" : "Clinical status and limitations"} subtitle={isDa ? "Foreløbig version · kræver klinisk validering" : "Draft version · requires clinical validation"}>
    <View style={{ gap: 10 }}>
      <Subtle style={{ lineHeight: 19 }}>{isDa ? "Kun VGAS. Fortolkningsstøtten er foreløbig og kræver lokal klinisk validering. Kontrollér altid mod klinik og lokale instrukser." : "VGAS only. Interpretation support is preliminary and requires local clinical validation. Always verify against clinical context and local guidance."}</Subtle>
      <Subtle style={{ lineHeight: 19 }}>{isDa ? "pO₂ på VGAS kan ikke bruges alene til sikker vurdering af iltning. CRP kan ikke alene afgøre infektionstype eller behandlingsbehov." : "VGAS pO₂ cannot assess oxygenation reliably on its own. CRP alone cannot determine infection type or treatment need."}</Subtle>
    </View>
  </CollapsibleCard>;
}

type Tone = "neutral" | "caution" | "urgent" | "normal";
export function ResultSection({ label, children, tone = "neutral" }: { label: string; children: React.ReactNode; tone?: Tone }) {
  const color = tone === "urgent" ? theme.colors.danger : tone === "caution" ? theme.colors.warn : tone === "normal" ? theme.colors.ok : theme.colors.accentMuted;
  return <View style={{ borderLeftWidth: 3, borderLeftColor: color, paddingLeft: 12, gap: 6 }}><Text style={{ color, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.7 }}>{label}</Text>{children}</View>;
}

export function EmptyResult({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  return <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.divider, paddingTop: 12, gap: 4 }}><Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "800" }}>{settings.language === "da" ? "Afventer værdier" : "Awaiting values"}</Text><Subtle style={{ lineHeight: 20 }}>{children}</Subtle></View>;
}
