import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { resumeArrestSession, summarizeArrestSession, type ArrestSession } from "../../../../src/domain/cardiac-resus/session";
import { formatArrestEventLabel, formatElapsed } from "../../../../src/features/cardiac-resus/presentation";
import { getLatestArrestSession, saveActiveArrestSession } from "../../../../src/services/cardiacResusStorage";
import { Background } from "../../../../src/ui/Background";
import { CollapsibleCard } from "../../../../src/ui/CollapsibleCard";
import { Card, Screen, Subtle, Title } from "../../../../src/ui/Ui";
import { theme } from "../../../../src/ui/theme";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "short", timeStyle: "medium" }).format(new Date(value));
}

export default function CardiacResusSummary() {
  const router = useRouter();
  const [session, setSession] = useState<ArrestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState(false);

  useFocusEffect(useCallback(() => {
    let mounted = true;
    getLatestArrestSession().then((latest) => { if (mounted) setSession(latest); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []));

  if (loading) return <Background><Screen style={{ justifyContent: "center" }}><ActivityIndicator color={theme.colors.accent} /></Screen></Background>;

  if (!session) return (
    <Background><Screen style={{ justifyContent: "center" }}><Card><Title style={{ fontSize: 20 }}>Ingen afsluttet session</Title><Subtle>Der er endnu ingen lokal hjertestopoversigt.</Subtle><Pressable onPress={() => router.replace("/tools/assessment-tools/cardiac-resus" as Href)}><Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>Tilbage til Hjertestop</Text></Pressable></Card></Screen></Background>
  );

  const summary = summarizeArrestSession(session);
  const latestOutcome = summary.latestOutcome === "rosc" ? "ROSC" : summary.latestOutcome === "mors" ? "MORS" : "Ikke registreret";
  const summaryRows = [
    ["Varighed", formatElapsed(summary.durationSeconds)],
    ["Stød total", String(summary.shockCount)],
    ["Stød VF", String(summary.shockVfCount)],
    ["Stød pVT", String(summary.shockPvtCount)],
    ["Adrenalin", String(summary.adrenalineCount)],
    ["Amiodaron", String(summary.amiodaroneCount)],
    ["ROSC", summary.hasRosc ? "Ja" : "Nej"],
    ["MORS", summary.hasMors ? "Ja" : "Nej"],
    ["Seneste udfald", latestOutcome],
    ["Hændelser i alt", String(summary.totalRecordedEvents)],
  ] as const;
  const resumeSession = async () => {
    if (resuming) return;
    setResuming(true);
    try {
      await saveActiveArrestSession(resumeArrestSession(session));
      router.replace("/tools/assessment-tools/cardiac-resus/session" as Href);
    } catch {
      setResuming(false);
      Alert.alert("Sessionen kunne ikke genoptages", "Den aktive session kunne ikke gemmes lokalt.");
    }
  };
  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 28 }}>
          <View style={{ gap: 6, marginTop: 12 }}><Title>Hjertestopoversigt</Title><Subtle>Lokalt gemt på denne enhed. Kan ikke eksporteres fra denne version.</Subtle></View>
          <Card>
            <Title style={{ fontSize: 19 }}>Resume</Title>
            <Text style={{ color: theme.colors.text }}><Text style={{ fontWeight: "900" }}>Start: </Text>{formatDate(session.startedAt)}</Text>
            <Text style={{ color: theme.colors.text }}><Text style={{ fontWeight: "900" }}>Slut: </Text>{formatDate(session.endedAt ?? session.startedAt)}</Text>
            <View style={{ marginTop: 4 }}>
              {summaryRows.map(([label, value]) => (
                <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", gap: 16, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
                  <Text style={{ color: theme.colors.mutedText, fontWeight: "700" }}>{label}</Text>
                  <Text style={{ color: theme.colors.text, fontWeight: "900", textAlign: "right" }}>{value}</Text>
                </View>
              ))}
            </View>
          </Card>
          <CollapsibleCard title="Hændelseslog" subtitle={`${session.events.length} tidsstemplede registreringer`}>
            {session.events.map((event) => (
              <View key={event.id} style={{ flexDirection: "row", gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
                <Text style={{ color: theme.colors.accentMuted, fontWeight: "800", fontVariant: ["tabular-nums"] }}>{formatElapsed(event.elapsedSeconds)}</Text>
                <View style={{ flex: 1 }}><Text style={{ color: theme.colors.text, fontWeight: "700" }}>{formatArrestEventLabel(event)}</Text>{event.note ? <Subtle>{event.note}</Subtle> : null}</View>
              </View>
            ))}
          </CollapsibleCard>
          <Pressable
            disabled={resuming}
            onPress={() => void resumeSession()}
            style={({ pressed }) => ({ minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.accentSurface, opacity: pressed || resuming ? 0.6 : 1 })}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>{resuming ? "Genoptager…" : "Genoptag hjertestop"}</Text>
          </Pressable>
        </ScrollView>
      </Screen>
    </Background>
  );
}
