import { type Href, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import {
  addArrestEvent,
  endArrestSession,
  getAdrenalineReminderSeconds,
  getCurrentCycleProgress,
  getCycleNumber,
  getElapsedSeconds,
  getSecondsSinceLastAdrenaline,
  isAdrenalineReminderDue,
  type ArrestEventType,
  type ArrestSession,
} from "../../../../src/domain/cardiac-resus/session";
import { EVENT_LABELS_DA, formatElapsed, VISIBLE_EVENT_BUTTONS, type EventButtonCategory } from "../../../../src/features/cardiac-resus/presentation";
import { getActiveArrestSession, saveActiveArrestSession, saveEndedArrestSession } from "../../../../src/services/cardiacResusStorage";
import { Background } from "../../../../src/ui/Background";
import { hapticSuccess, hapticToolOpen } from "../../../../src/ui/haptics";
import { Card, Screen, Subtle, Title } from "../../../../src/ui/Ui";
import { theme } from "../../../../src/ui/theme";

const EVENT_BUTTON_COLORS: Record<EventButtonCategory, { background: string; border: string }> = {
  shock: { background: "rgba(221,189,98,0.14)", border: "rgba(221,189,98,0.38)" },
  medication: { background: "rgba(101,142,181,0.14)", border: "rgba(125,166,205,0.36)" },
  airway: { background: "rgba(102,166,158,0.14)", border: "rgba(122,186,178,0.35)" },
  outcome: { background: "rgba(145,169,108,0.16)", border: "rgba(145,169,108,0.40)" },
  other: { background: "rgba(255,255,255,0.06)", border: theme.colors.cardBorder },
};

export default function ActiveCardiacResusSession() {
  const router = useRouter();
  const [session, setSession] = useState<ArrestSession | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getActiveArrestSession()
      .then((stored) => {
        if (!mounted) return;
        if (!stored) {
          Alert.alert("Ingen aktiv session", "Start en session fra Hjertestop.", [{ text: "OK", onPress: () => router.replace("/tools/assessment-tools/cardiac-resus" as Href) }]);
          return;
        }
        setSession(stored);
      })
      .catch(() => Alert.alert("Sessionen kunne ikke indlæses"))
      .finally(() => { if (mounted) setLoading(false); });
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { mounted = false; clearInterval(timer); };
  }, [router]);

  const elapsed = session ? getElapsedSeconds(session.startedAt, now) : 0;
  const cycle = session ? getCycleNumber(elapsed, session.cycleDurationSeconds) : 1;
  const progress = session ? getCurrentCycleProgress(elapsed, session.cycleDurationSeconds) : 0;
  const secondsSinceAdrenaline = session ? getSecondsSinceLastAdrenaline(session, now) : null;
  const adrenalineReminderSeconds = session ? getAdrenalineReminderSeconds(session) : 240;
  const adrenalineReminderDue = session ? isAdrenalineReminderDue(session, now) : false;
  const recentEvents = useMemo(() => session?.events.slice(-6).reverse() ?? [], [session]);

  const recordEvent = (type: ArrestEventType) => {
    setSession((current) => {
      if (!current) return current;
      const note = type === "free_note" ? "Note registreret uden fritekst." : undefined;
      const updated = addArrestEvent(current, type, new Date(), note);
      saveActiveArrestSession(updated).catch(() => Alert.alert("Hændelsen kunne ikke gemmes lokalt"));
      hapticToolOpen();
      return updated;
    });
  };

  const confirmEnd = () => {
    Alert.alert("Afslut session?", "Sessionen afsluttes og gemmes som den seneste lokale session.", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Afslut session",
        style: "destructive",
        onPress: () => {
          if (!session) return;
          const ended = endArrestSession(session, new Date());
          saveEndedArrestSession(ended)
            .then(() => {
              hapticSuccess();
              router.replace("/tools/assessment-tools/cardiac-resus/summary" as Href);
            })
            .catch(() => Alert.alert("Sessionen kunne ikke afsluttes", "Den aktive session er bevaret."));
        },
      },
    ]);
  };

  if (loading || !session) return <Background><Screen style={{ justifyContent: "center" }}><ActivityIndicator color={theme.colors.accent} /></Screen></Background>;

  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 28 }}>
          <Card style={{ alignItems: "center", marginTop: 12 }}>
            <Subtle>Forløbet tid</Subtle>
            <Title style={{ fontSize: 46, fontVariant: ["tabular-nums"] }}>{formatElapsed(elapsed)}</Title>
            <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 17 }}>HLR-cyklus {cycle}</Text>
            <View style={{ height: 8, width: "100%", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <View style={{ height: "100%", width: `${progress * 100}%`, backgroundColor: theme.colors.accent }} />
            </View>
            <Subtle>Tidsmarkøren er vejledende og skal kontrolleres af brugeren.</Subtle>
          </Card>

          <Card style={adrenalineReminderDue ? { backgroundColor: "rgba(221,189,98,0.14)", borderColor: "rgba(221,189,98,0.48)" } : undefined}>
            <Title style={{ fontSize: 18 }}>Adrenalin-timer</Title>
            {secondsSinceAdrenaline === null ? (
              <Subtle>Ingen adrenalin registreret endnu.</Subtle>
            ) : (
              <>
                <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 17 }}>
                  Sidst registreret: {formatElapsed(secondsSinceAdrenaline)} siden
                </Text>
                <Subtle>Næste kontrol: ca. {formatElapsed(adrenalineReminderSeconds)} / 2 cyklusser</Subtle>
                {adrenalineReminderDue ? (
                  <Text style={{ color: theme.colors.warn, fontWeight: "900", lineHeight: 20 }}>
                    Kontrollér adrenalin efter lokale retningslinjer.
                  </Text>
                ) : null}
              </>
            )}
          </Card>

          <Card>
            <Title style={{ fontSize: 19 }}>Registrér hændelse</Title>
            <Subtle>Knapperne registrerer kun, hvad der allerede er sket.</Subtle>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {VISIBLE_EVENT_BUTTONS.map((item) => {
                const colors = EVENT_BUTTON_COLORS[item.category];
                return (
                <Pressable key={item.type} onPress={() => recordEvent(item.type)} style={({ pressed }) => ({ minHeight: 56, flexBasis: "47%", flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 10, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, opacity: pressed ? 0.7 : 1 })}>
                  <Text style={{ color: theme.colors.text, fontWeight: "800", textAlign: "center" }}>{item.label}</Text>
                </Pressable>
              );})}
            </View>
          </Card>

          <Card>
            <Title style={{ fontSize: 19 }}>Seneste hændelser</Title>
            {recentEvents.map((event) => (
              <View key={event.id} style={{ flexDirection: "row", gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
                <Text style={{ color: theme.colors.accentMuted, fontWeight: "800", fontVariant: ["tabular-nums"] }}>{formatElapsed(event.elapsedSeconds)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: "700" }}>{EVENT_LABELS_DA[event.type]}</Text>
                  {event.note ? <Subtle>{event.note}</Subtle> : null}
                </View>
              </View>
            ))}
          </Card>

          <Pressable onPress={confirmEnd} style={({ pressed }) => ({ minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,123,114,0.45)", backgroundColor: "rgba(255,123,114,0.10)", opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ color: theme.colors.danger, fontWeight: "900", fontSize: 16 }}>Afslut session</Text>
          </Pressable>
        </ScrollView>
      </Screen>
    </Background>
  );
}
