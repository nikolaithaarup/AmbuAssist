import { Text, View } from "react-native";
import { useSettings } from "../../state/settings";
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
  return <Subtle style={{ lineHeight: 19 }}>{settings.language === "da" ? "Venøs pO₂ kan ikke fastslå arteriel iltning. Brug SpO₂ og kliniske fund." : "Venous pO₂ cannot establish arterial oxygenation. Use SpO₂ and clinical findings."}</Subtle>;
}

type Tone = "neutral" | "caution" | "urgent" | "normal";
export function ResultSection({ label, children, tone = "neutral" }: { label: string; children: React.ReactNode; tone?: Tone }) {
  const color = tone === "urgent" ? theme.colors.danger : tone === "caution" ? theme.colors.warn : tone === "normal" ? theme.colors.ok : theme.colors.accentMuted;
  return <View style={{ borderLeftWidth: 3, borderLeftColor: color, paddingLeft: 12, gap: 6 }}><Text style={{ color, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.7 }}>{label}</Text>{children}</View>;
}
