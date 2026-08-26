import { type Href, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, Pressable, ScrollView, Text, View } from "react-native";
import {
  addArrestEvent,
  addAdrenalineTimerResetEvent,
  addCycleTimerResetEvent,
  addNoteEvent,
  addShockEvent,
  correctLatestManualArrestEvent,
  endArrestSession,
  endArrestSessionWithOutcome,
  getAdrenalineReminderSeconds,
  findLatestAdrenalineTimerAnchorEvent,
  findLatestCorrectableArrestEvent,
  getCorrectedArrestEventIds,
  getCycleDisplayState,
  getElapsedSeconds,
  getSecondsSinceAdrenalineTimerAnchor,
  isAdrenalineReminderDue,
  type ArrestEventType,
  type ArrestSession,
} from "../../../../src/domain/cardiac-resus/session";
import { formatArrestEventLabel, formatElapsed, VISIBLE_EVENT_BUTTONS, type EventButtonCategory } from "../../../../src/features/cardiac-resus/presentation";
import { ActionOverlay } from "../../../../src/features/cardiac-resus/ActionOverlay";
import { createSerializedArrestSessionWriter, getActiveArrestSession, saveEndedArrestSession } from "../../../../src/services/cardiacResusStorage";
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

type SessionDialog = "end" | "shock" | "rosc" | "mors" | "note" | "correct" | "cycleReset" | "adrenalineReset" | "partial" | null;

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
  const [saveWriter] = useState(() => createSerializedArrestSessionWriter());

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
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") setNow(Date.now());
    });
    return () => { mounted = false; clearInterval(timer); appStateSubscription.remove(); };
  }, [router]);

  const elapsed = session ? getElapsedSeconds(session.startedAt, now) : 0;
  const cycleState = session ? getCycleDisplayState(session, now) : {
    cycleNumber: 1,
    elapsedInCycleSeconds: 0,
    remainingSeconds: 120,
    progress: 0,
    prechargeCueActive: false,
  };
  const secondsSinceAdrenaline = session ? getSecondsSinceAdrenalineTimerAnchor(session, now) : null;
  const adrenalineTimerAnchor = session ? findLatestAdrenalineTimerAnchorEvent(session) : null;
  const adrenalineReminderSeconds = session ? getAdrenalineReminderSeconds(session) : 240;
  const adrenalineReminderDue = session ? isAdrenalineReminderDue(session, now) : false;
  const adrenalineProgress = secondsSinceAdrenaline === null
    ? 0
    : Math.min(1, secondsSinceAdrenaline / adrenalineReminderSeconds);
  const displayedEvents = useMemo(
    () => showAllEvents ? [...(session?.events ?? [])].reverse() : session?.events.slice(-3).reverse() ?? [],
    [session, showAllEvents],
  );
  const correctedEventIds = useMemo(
    () => session ? getCorrectedArrestEventIds(session) : new Set<string>(),
    [session],
  );
  const latestCorrectableEvent = useMemo(
    () => session ? findLatestCorrectableArrestEvent(session) : null,
    [session],
  );

  const commitSessionUpdate = (
    update: (current: ArrestSession) => ArrestSession,
    failureMessage: string,
  ): boolean => {
    const current = sessionRef.current;
    if (!current) return false;
    const updated = update(current);
    if (updated === current) return false;
    sessionRef.current = updated;
    setSession(updated);
    saveWriter.save(updated).catch(() => setActionError(failureMessage));
    hapticToolOpen();
    return true;
  };

  const recordEvent = (type: ArrestEventType) => {
    commitSessionUpdate(
      (current) => addArrestEvent(current, type, new Date()),
      "Hændelsen kunne ikke gemmes lokalt.",
    );
  };

  const recordShock = () => {
    setActionError("");
    setDialog("shock");
  };

  const recordShockRhythm = (rhythm: "VF" | "pVT") => {
    if (commitSessionUpdate(
      (current) => addShockEvent(current, rhythm, new Date()),
      "Hændelsen kunne ikke gemmes lokalt.",
    )) setDialog(null);
  };

  const saveNote = () => {
    if (!noteText.trim()) {
      setNoteError("Skriv en note før du gemmer.");
      return;
    }
    commitSessionUpdate(
      (current) => addNoteEvent(current, noteText, new Date()),
      "Noten kunne ikke gemmes lokalt.",
    );
    setNoteText("");
    setNoteError("");
    setDialog(null);
  };

  const resetCycleTimer = () => {
    commitSessionUpdate(
      (current) => addCycleTimerResetEvent(current, new Date()),
      "Cyklustimeren kunne ikke gemmes lokalt.",
    );
    setDialog(null);
  };

  const resetAdrenalineTimer = () => {
    commitSessionUpdate(
      (current) => addAdrenalineTimerResetEvent(current, new Date()),
      "Adrenalin-timeren kunne ikke gemmes lokalt.",
    );
    setDialog(null);
  };

  const correctLatestEvent = () => {
    commitSessionUpdate(
      (current) => correctLatestManualArrestEvent(current, new Date()),
      "Rettelsen kunne ikke gemmes lokalt.",
    );
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
      await saveWriter.flush();
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
          <Pressable onPress={() => { setActionError(""); setDialog("cycleReset"); }} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}>
            <Card style={{ alignItems: "center", marginTop: 12, ...(cycleState.prechargeCueActive ? { backgroundColor: "rgba(255,123,114,0.15)", borderColor: "rgba(255,123,114,0.58)" } : {}) }}>
              <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 17 }}>HLR-cyklus {cycleState.cycleNumber}</Text>
              <Title style={{ fontSize: 46, fontVariant: ["tabular-nums"] }}>{formatElapsed(cycleState.elapsedInCycleSeconds)}</Title>
              <Text style={{ color: theme.colors.mutedText, fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
                Forløbet tid: {formatElapsed(elapsed)}
              </Text>
              <Subtle>{cycleState.remainingSeconds} sek. tilbage i cyklus</Subtle>
              {cycleState.prechargeCueActive ? (
                <Text style={{ color: theme.colors.danger, fontWeight: "900", fontSize: 20 }}>Pre-charge nu</Text>
              ) : null}
              <View style={{ height: 8, width: "100%", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <View style={{ height: "100%", width: `${cycleState.progress * 100}%`, backgroundColor: theme.colors.accent }} />
              </View>
              <Subtle>Tryk for at justere cyklustimer.</Subtle>
              <Subtle>Tidsmarkører og workflow-cues skal kontrolleres mod lokale retningslinjer og klinisk vurdering.</Subtle>
            </Card>
          </Pressable>

          <Pressable disabled={secondsSinceAdrenaline === null} onPress={() => { setActionError(""); setDialog("adrenalineReset"); }} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}>
            <Card style={adrenalineReminderDue ? { backgroundColor: "rgba(221,189,98,0.14)", borderColor: "rgba(221,189,98,0.48)" } : undefined}>
              <Title style={{ fontSize: 18 }}>Adrenalin-timer</Title>
              {secondsSinceAdrenaline === null ? (
                <Subtle>Ingen adrenalin registreret endnu. Timeren starter, når “Adrenalin givet” registreres.</Subtle>
              ) : (
                <>
                  <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 17 }}>
                    Tid på timer: {formatElapsed(secondsSinceAdrenaline)}
                  </Text>
                  <Subtle>Næste kontrol: ca. {formatElapsed(adrenalineReminderSeconds)} / 2 cyklusser</Subtle>
                  {adrenalineTimerAnchor?.type === "adrenaline_timer_reset" ? <Subtle>Timer nulstillet manuelt.</Subtle> : null}
                  <View style={{ height: 8, width: "100%", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <View style={{ height: "100%", width: `${adrenalineProgress * 100}%`, backgroundColor: adrenalineReminderDue ? theme.colors.warn : theme.colors.accent }} />
                  </View>
                  {adrenalineReminderDue ? (
                    <Text style={{ color: theme.colors.warn, fontWeight: "900", lineHeight: 20 }}>
                      Kontrollér adrenalin efter lokale retningslinjer.
                    </Text>
                  ) : null}
                  <Subtle>Tryk for at nulstille timer.</Subtle>
                </>
              )}
            </Card>
          </Pressable>

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
            {displayedEvents.map((event) => {
              const corrected = correctedEventIds.has(event.id);
              return (
              <View key={event.id} accessibilityLabel={corrected ? `${formatArrestEventLabel(event)}. Rettet og ikke medregnet.` : undefined} style={{ flexDirection: "row", gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: theme.colors.divider, opacity: corrected ? 0.58 : 1 }}>
                <Text style={{ color: theme.colors.accentMuted, fontWeight: "800", fontVariant: ["tabular-nums"] }}>{formatElapsed(event.elapsedSeconds)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: "700", textDecorationLine: corrected ? "line-through" : "none" }}>{formatArrestEventLabel(event)}</Text>
                  {corrected ? <Subtle>Rettet · medregnes ikke</Subtle> : null}
                  {event.note ? <Subtle>{event.note}</Subtle> : null}
                </View>
              </View>
            );})}
            {latestCorrectableEvent ? (
              <Pressable
                onPress={() => { setActionError(""); setDialog("correct"); }}
                style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}
              >
                <Text style={{ color: theme.colors.accentMuted, fontWeight: "900" }}>Ret seneste registrering</Text>
              </Pressable>
            ) : null}
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
            ) : dialog === "correct" ? (
              <>
                <Title style={{ fontSize: 21 }}>Ret seneste registrering?</Title>
                <Text style={{ color: theme.colors.text, lineHeight: 21 }}>
                  Den seneste aktive brugerregistrering markeres som rettet. Historikken slettes ikke, og optællinger/timere ser bort fra den rettede registrering.
                </Text>
                <Pressable onPress={correctLatestEvent} style={({ pressed }) => ({ minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.accentSurface, opacity: pressed ? 0.65 : 1 })}>
                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>Markér som rettet</Text>
                </Pressable>
                <Pressable onPress={() => setDialog(null)} style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}>
                  <Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>Annuller</Text>
                </Pressable>
              </>
            ) : dialog === "cycleReset" || dialog === "adrenalineReset" ? (
              <>
                <Title style={{ fontSize: 21 }}>
                  {dialog === "cycleReset" ? "Nulstil cyklustimer?" : "Nulstil adrenalin-timer?"}
                </Title>
                <Text style={{ color: theme.colors.text, lineHeight: 21 }}>
                  {dialog === "cycleReset"
                    ? "Brug kun dette, hvis I manuelt starter en ny HLR-cyklus eller har brug for at justere cyklustimeren. Den samlede hjertestoptid ændres ikke."
                    : "Dette nulstiller kun timeren. Det registrerer ikke, at der er givet adrenalin."}
                </Text>
                {actionError ? <Text style={{ color: theme.colors.danger, fontWeight: "700" }}>{actionError}</Text> : null}
                <Pressable
                  onPress={dialog === "cycleReset" ? resetCycleTimer : resetAdrenalineTimer}
                  style={({ pressed }) => ({ minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.accentSurface, opacity: pressed ? 0.65 : 1 })}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                    {dialog === "cycleReset" ? "Nulstil cyklustimer" : "Nulstil timer"}
                  </Text>
                </Pressable>
                <Pressable onPress={() => setDialog(null)} style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}>
                  <Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>Annuller</Text>
                </Pressable>
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
