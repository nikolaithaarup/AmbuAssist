import { Text, View } from "react-native";
import { useSettings } from "../../state/settings";
import { Card, Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";
import { DevelopmentChip } from "./PrelaunchGate";

export function BloodGasPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ gap: 8, marginTop: 12, marginBottom: 4 }}>
      <DevelopmentChip />
      <Title style={{ fontSize: 27 }}>{title}</Title>
      <Subtle style={{ fontSize: 14, lineHeight: 20 }}>{subtitle}</Subtle>
    </View>
  );
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
