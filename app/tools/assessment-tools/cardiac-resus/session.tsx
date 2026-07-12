import { type Href, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import {
  addArrestEvent,
  addNoteEvent,
  addShockEvent,
  endArrestSession,
  endArrestSessionWithOutcome,
  getAdrenalineReminderSeconds,
  getCurrentCycleProgress,
  getCycleNumber,
  getCycleRemainingSeconds,
  getElapsedSeconds,
  getSecondsSinceLastAdrenaline,
  isAdrenalineReminderDue,
  isPrechargeCueActive,
  type ArrestEventType,
  type ArrestSession,
} from "../../../../src/domain/cardiac-resus/session";
import { formatArrestEventLabel, formatElapsed, VISIBLE_EVENT_BUTTONS, type EventButtonCategory } from "../../../../src/features/cardiac-resus/presentation";
import { ActionOverlay } from "../../../../src/features/cardiac-resus/ActionOverlay";
import { getActiveArrestSession, saveActiveArrestSession, saveEndedArrestSession } from "../../../../src/services/cardiacResusStorage";
import { Background } from "../../../../src/ui/Background";
import { hapticSuccess, hapticToolOpen } from "../../../../src/ui/haptics";
import { Card, Input, Screen, Subtle, Title } from "../../../../src/ui/Ui";
import { theme } from "../../../../src/ui/theme";

const EVENT_BUTTON_COLORS: Record<EventButtonCategory, { background: string; border: string }> = {
  shock: { background: "rgba(221,189,98,0.14)", border: "rgba(221,189,98,0.38)" },
  medication: { background: "rgba(101,142,181,0.14)", border: "rgba(125,166,205,0.36)" },
  airway: { background: "rgba(102,166,158,0.14)", border: "rgba(122,186,178,0.35)" },
  outcome: { background: "rgba(145,169,108,0.16)", border: "rgba(145,169,108,0.40)" },
  other: { background: "rgba(255,255,255,0.06)", border: theme.colors.cardBorder },
};

type SessionDialog = "end" | "shock" | "rosc" | "mors" | "note" | "partial" | null;

export default function ActiveCardiacResusSession() {
  const router = useRouter();
  const [session, setSession] = useState<ArrestSession | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [ending, setEnding] = useState(false);
  const [dialog, setDialog] = useState<SessionDialog>(null);
  const [noteText, setNoteText] = useState("");
  const [noteError, setNoteError] = useState("");
  const [actionError, setActionError] = useState("");
  const sessionRef = useRef<ArrestSession | null>(null);

  useEffect(() => {
    let mounted = true;
    getActiveArrestSession()
      .then((stored) => {
        if (!mounted) return;
        if (!stored) {
          Alert.alert("Ingen aktiv session", "Start en session fra Hjertestop.", [{ text: "OK", onPress: () => router.replace("/tools/assessment-tools/cardiac-resus" as Href) }]);
          return;
        }
        sessionRef.current = stored;
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
  const cycleRemaining = session ? getCycleRemainingSeconds(elapsed, session.cycleDurationSeconds) : 120;
  const prechargeCueActive = session ? isPrechargeCueActive(elapsed, session.cycleDurationSeconds) : false;
  const secondsSinceAdrenaline = session ? getSecondsSinceLastAdrenaline(session, now) : null;
  const adrenalineReminderSeconds = session ? getAdrenalineReminderSeconds(session) : 240;
  const adrenalineReminderDue = session ? isAdrenalineReminderDue(session, now) : false;
  const adrenalineProgress = secondsSinceAdrenaline === null
    ? 0
    : Math.min(1, secondsSinceAdrenaline / adrenalineReminderSeconds);
  const displayedEvents = useMemo(
    () => showAllEvents ? [...(session?.events ?? [])].reverse() : session?.events.slice(-3).reverse() ?? [],
    [session, showAllEvents],
  );

  const recordEvent = (type: ArrestEventType) => {
    setSession((current) => {
      if (!current) return current;
      const updated = addArrestEvent(current, type, new Date());
      sessionRef.current = updated;
      saveActiveArrestSession(updated).catch(() => setActionError("Hændelsen kunne ikke gemmes lokalt."));
      hapticToolOpen();
      return updated;
    });
  };

  const recordShock = () => {
    setActionError("");
    setDialog("shock");
  };

  const recordShockRhythm = (rhythm: "VF" | "pVT") => {
    setSession((current) => {
      if (!current) return current;
      const updated = addShockEvent(current, rhythm, new Date());
      sessionRef.current = updated;
      saveActiveArrestSession(updated).catch(() => setActionError("Hændelsen kunne ikke gemmes lokalt."));
      hapticToolOpen();
      setDialog(null);
      return updated;
    });
  };

  const saveNote = () => {
    if (!noteText.trim()) {
      setNoteError("Skriv en note før du gemmer.");
      return;
    }
    setSession((current) => {
      if (!current) return current;
      const updated = addNoteEvent(current, noteText, new Date());
      sessionRef.current = updated;
      saveActiveArrestSession(updated).catch(() => setActionError("Noten kunne ikke gemmes lokalt."));
      hapticToolOpen();
      return updated;
    });
    setNoteText("");
    setNoteError("");
    setDialog(null);
  };

  const finishSession = async (outcome?: "rosc" | "mors") => {
    const current = sessionRef.current;
    if (!current || ending) return;
    setEnding(true);
    const ended = outcome
      ? endArrestSessionWithOutcome(current, outcome, new Date())
      : endArrestSession(current, new Date());
    sessionRef.current = ended;
    setSession(ended);
    try {
      const result = await saveEndedArrestSession(ended);
      hapticSuccess();
      if (!result.activeDraftRemoved) {
        setEnding(false);
        setDialog("partial");
        return;
      }
      router.replace("/tools/assessment-tools/cardiac-resus/summary" as Href);
    } catch {
      sessionRef.current = current;
      setSession(current);
      setEnding(false);
      setActionError("Sessionen kunne ikke afsluttes. Den aktive session er bevaret. Prøv igen.");
    }
  };

  const confirmOutcome = (outcome: "rosc" | "mors") => {
    setActionError("");
    setDialog(outcome);
  };

  const confirmEnd = () => {
    setActionError("");
    setDialog("end");
  };

  if (loading || !session) return <Background><Screen style={{ justifyContent: "center" }}><ActivityIndicator color={theme.colors.accent} /></Screen></Background>;

  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 28 }}>
          <Card style={{ alignItems: "center", marginTop: 12, ...(prechargeCueActive ? { backgroundColor: "rgba(255,123,114,0.15)", borderColor: "rgba(255,123,114,0.58)" } : {}) }}>
            <Subtle>Forløbet tid</Subtle>
            <Title style={{ fontSize: 46, fontVariant: ["tabular-nums"] }}>{formatElapsed(elapsed)}</Title>
            <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 17 }}>HLR-cyklus {cycle}</Text>
            <Subtle>{cycleRemaining} sek. tilbage i cyklus</Subtle>
            {prechargeCueActive ? (
              <Text style={{ color: theme.colors.danger, fontWeight: "900", fontSize: 20 }}>Pre-charge nu</Text>
            ) : null}
            <View style={{ height: 8, width: "100%", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <View style={{ height: "100%", width: `${progress * 100}%`, backgroundColor: theme.colors.accent }} />
            </View>
            <Subtle>Tidsmarkører og workflow-cues skal kontrolleres mod lokale retningslinjer og klinisk vurdering.</Subtle>
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
                <View style={{ height: 8, width: "100%", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <View style={{ height: "100%", width: `${adrenalineProgress * 100}%`, backgroundColor: adrenalineReminderDue ? theme.colors.warn : theme.colors.accent }} />
                </View>
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
                <Pressable key={item.type} disabled={ending} onPress={() => item.type === "shock_delivered" ? recordShock() : item.type === "rosc" || item.type === "mors" ? confirmOutcome(item.type) : item.type === "free_note" ? (setNoteText(""), setNoteError(""), setDialog("note")) : recordEvent(item.type)} style={({ pressed }) => ({ minHeight: 56, flexBasis: "47%", flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 10, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, opacity: pressed || ending ? 0.7 : 1 })}>
                  <Text style={{ color: theme.colors.text, fontWeight: "800", textAlign: "center" }}>{item.label}</Text>
                </Pressable>
              );})}
            </View>
            {actionError ? <Text style={{ color: theme.colors.danger, fontWeight: "700" }}>{actionError}</Text> : null}
          </Card>

          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Title style={{ fontSize: 19 }}>Seneste hændelser</Title>
              <Pressable onPress={() => setShowAllEvents((current) => !current)} hitSlop={8}>
                <Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>{showAllEvents ? "Skjul" : "Vis alle"}</Text>
              </Pressable>
            </View>
            {displayedEvents.map((event) => (
              <View key={event.id} style={{ flexDirection: "row", gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
                <Text style={{ color: theme.colors.accentMuted, fontWeight: "800", fontVariant: ["tabular-nums"] }}>{formatElapsed(event.elapsedSeconds)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: "700" }}>{formatArrestEventLabel(event)}</Text>
                  {event.note ? <Subtle>{event.note}</Subtle> : null}
                </View>
              </View>
            ))}
          </Card>

          <Pressable disabled={ending} onPress={confirmEnd} style={({ pressed }) => ({ minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,123,114,0.45)", backgroundColor: "rgba(255,123,114,0.10)", opacity: pressed || ending ? 0.55 : 1 })}>
            <Text style={{ color: theme.colors.danger, fontWeight: "900", fontSize: 16 }}>{ending ? "Afslutter…" : "Afslut session"}</Text>
          </Pressable>
        </ScrollView>
        {dialog ? (
          <ActionOverlay>
            {dialog === "shock" ? (
              <>
                <Title style={{ fontSize: 21 }}>Stød afgivet</Title>
                <Text style={{ color: theme.colors.text, lineHeight: 21 }}>Vælg den rytme, som brugeren registrerer for stødet.</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {(["VF", "pVT"] as const).map((rhythm) => (
                    <Pressable key={rhythm} onPress={() => recordShockRhythm(rhythm)} style={({ pressed }) => ({ flex: 1, minHeight: 56, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: "rgba(221,189,98,0.42)", backgroundColor: "rgba(221,189,98,0.13)", opacity: pressed ? 0.65 : 1 })}>
                      <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>{rhythm}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable onPress={() => setDialog(null)} style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}><Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>Annuller</Text></Pressable>
              </>
            ) : dialog === "note" ? (
              <>
                <Title style={{ fontSize: 21 }}>Tilføj note</Title>
                <Input value={noteText} onChangeText={(value) => { setNoteText(value); if (noteError) setNoteError(""); }} multiline placeholder="Skriv note…" style={{ minHeight: 110, textAlignVertical: "top" }} />
                <Subtle>Undgå patientidentificerende oplysninger.</Subtle>
                {noteError ? <Text style={{ color: theme.colors.danger, fontWeight: "700" }}>{noteError}</Text> : null}
                <Pressable onPress={saveNote} style={({ pressed }) => ({ minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.accentSurface, opacity: pressed ? 0.65 : 1 })}><Text style={{ color: theme.colors.text, fontWeight: "900" }}>Gem note</Text></Pressable>
                <Pressable onPress={() => setDialog(null)} style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}><Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>Annuller</Text></Pressable>
              </>
            ) : dialog === "partial" ? (
              <>
                <Title style={{ fontSize: 21 }}>Oversigten er gemt</Title>
                <Text style={{ color: theme.colors.text, lineHeight: 21 }}>Den aktive kladde kunne ikke fjernes. Du kan fortsætte til oversigten og rydde kladden fra Hjertestop-forsiden.</Text>
                <Pressable onPress={() => router.replace("/tools/assessment-tools/cardiac-resus/summary" as Href)} style={({ pressed }) => ({ minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.accentSurface, opacity: pressed ? 0.65 : 1 })}><Text style={{ color: theme.colors.text, fontWeight: "900" }}>Gå til oversigt</Text></Pressable>
              </>
            ) : (
              <>
                <Title style={{ fontSize: 21 }}>{dialog === "end" ? "Afslut session?" : `Registrér ${dialog === "rosc" ? "ROSC" : "MORS"} og afslut?`}</Title>
                <Text style={{ color: theme.colors.text, lineHeight: 21 }}>
                  {dialog === "end" ? "Sessionen afsluttes og gemmes som den seneste lokale session." : `${dialog === "rosc" ? "ROSC" : "MORS"} registreres som udfald, og den aktive session afsluttes.`}
                </Text>
                {actionError ? <Text style={{ color: theme.colors.danger, fontWeight: "700" }}>{actionError}</Text> : null}
                <Pressable disabled={ending} onPress={() => void finishSession(dialog === "rosc" || dialog === "mors" ? dialog : undefined)} style={({ pressed }) => ({ minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,123,114,0.45)", backgroundColor: "rgba(255,123,114,0.10)", opacity: pressed || ending ? 0.6 : 1 })}><Text style={{ color: theme.colors.danger, fontWeight: "900" }}>{ending ? "Gemmer…" : dialog === "end" ? "Afslut session" : `Registrér ${dialog === "rosc" ? "ROSC" : "MORS"}`}</Text></Pressable>
                <Pressable disabled={ending} onPress={() => setDialog(null)} style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}><Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>Annuller</Text></Pressable>
              </>
            )}
          </ActionOverlay>
        ) : null}
      </Screen>
    </Background>
  );
}
