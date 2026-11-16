import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { createArrestSession, type ArrestSession } from "../../../../src/domain/cardiac-resus/session";
import {
  clearActiveArrestSession,
  getLatestArrestSession,
  inspectActiveArrestSession,
  saveActiveArrestSession,
} from "../../../../src/services/cardiacResusStorage";
import { Background } from "../../../../src/ui/Background";
import { ActionOverlay } from "../../../../src/features/cardiac-resus/ActionOverlay";
import {
  formatElapsed,
  getCardiacLandingActionState,
  getCardiacLandingSummary,
} from "../../../../src/features/cardiac-resus/presentation";
import { hapticReset, hapticSuccess } from "../../../../src/ui/haptics";
import { Screen, Subtle, Title } from "../../../../src/ui/Ui";
import { ToolActionButton, ToolPageHeader, ToolSurface } from "../../../../src/ui/ToolSurface";
import { theme } from "../../../../src/ui/theme";

const SAFETY_TEXT = "Hjertestop er et tids- og hændelsesstøtteværktøj. Timere og påmindelser er baseret på dine registreringer og skal kontrolleres mod gældende lokale retningslinjer, klinisk vurdering og medicinsk ledelse.";

export default function CardiacResusLanding() {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<ArrestSession | null>(null);
  const [hasLatestSession, setHasLatestSession] = useState(false);
  const [activeSessionCorrupted, setActiveSessionCorrupted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [showSafetyInformation, setShowSafetyInformation] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeSession) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  const refresh = useCallback(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([inspectActiveArrestSession(), getLatestArrestSession()])
      .then(([activeInspection, latest]) => {
        if (!mounted) return;
        setActiveSession(activeInspection.session);
        setActiveSessionCorrupted(activeInspection.corrupted);
        setHasLatestSession(Boolean(latest));
      })
      .catch(() => {
        if (mounted) Alert.alert("Kunne ikke indlæse session", "Prøv igen.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useFocusEffect(refresh);

  const startSession = async () => {
    if (activeSession) {
      router.push("/tools/assessment-tools/cardiac-resus/session" as Href);
      return;
    }
    try {
      const session = createArrestSession(new Date());
      await saveActiveArrestSession(session);
      hapticSuccess();
      router.push("/tools/assessment-tools/cardiac-resus/session" as Href);
    } catch {
      Alert.alert("Session kunne ikke startes", "Den lokale session kunne ikke gemmes.");
    }
  };

  const clearSession = async () => {
    if (clearing) return;
    setClearing(true);
    setClearError("");
    try {
      await clearActiveArrestSession();
      hapticReset();
      setActiveSession(null);
      setActiveSessionCorrupted(false);
      setShowClearConfirmation(false);
    } catch {
      setClearError("Den lokale aktive session kunne ikke fjernes. Prøv igen.");
    } finally {
      setClearing(false);
    }
  };

  const actionState = getCardiacLandingActionState(activeSession, activeSessionCorrupted);
  const summary = useMemo(
    () => activeSession ? getCardiacLandingSummary(activeSession, now) : null,
    [activeSession, now],
  );
  const formatTime = (value: string) => new Date(value).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  const summaryItems = summary ? [
    { label: "Session startet", value: formatTime(summary.sessionStartedAt) },
    { label: "Stød", value: String(summary.shockCount) },
    { label: "Adrenalin", value: String(summary.adrenalineCount) },
    { label: "Forløbet tid", value: formatElapsed(summary.elapsedSeconds) },
    ...(summary.outcome && summary.outcomeOccurredAt ? [
      { label: "Resultat", value: summary.outcome.toUpperCase() },
      { label: "Registreret", value: formatTime(summary.outcomeOccurredAt) },
    ] : []),
  ] : [];

  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
          <ToolPageHeader
            title="Hjertestop"
            actionLabel="Information om Hjertestop"
            actionDisplayLabel="ⓘ"
            onAction={() => setShowSafetyInformation(true)}
          />

          {loading ? <ActivityIndicator color={theme.colors.accent} /> : (
            <View style={{ gap: 10 }}>
              {activeSessionCorrupted ? (
                <ToolSurface tone="danger">
                  <Title style={{ fontSize: 17 }}>Aktiv session kan ikke indlæses</Title>
                  <Subtle>Ryd den lokale session for at kunne starte igen.</Subtle>
                </ToolSurface>
              ) : null}
              {actionState.showPrimary ? <ToolActionButton label={actionState.primaryLabel} onPress={startSession} /> : null}
              {actionState.showClear ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Ryd aktiv session" onPress={() => { setClearError(""); setShowClearConfirmation(true); }} style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}>
                  <Text style={{ color: theme.colors.danger, fontWeight: "800" }}>Ryd</Text>
                </Pressable>
              ) : null}
              {summary ? (
                <View accessibilityLabel="Aktiv session" style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 18, rowGap: 14, paddingTop: 6 }}>
                  {summaryItems.map((item) => (
                    <View key={item.label} style={{ width: "47%", minWidth: 0, gap: 2 }}>
                      <Text style={{ color: theme.colors.mutedText, fontSize: 12, fontWeight: "700" }}>{item.label}</Text>
                      <Text style={{ color: theme.colors.text, fontSize: 19, fontWeight: "900" }}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {hasLatestSession ? (
                <Pressable accessibilityRole="link" onPress={() => router.push("/tools/assessment-tools/cardiac-resus/summary" as Href)} style={({ pressed }) => ({ alignSelf: "center", minHeight: 44, justifyContent: "center", opacity: pressed ? 0.65 : 1 })}>
                  <Text style={{ color: theme.colors.accentMuted, fontWeight: "700" }}>Seneste session</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </ScrollView>
        <Modal visible={showSafetyInformation} transparent animationType="fade" onRequestClose={() => setShowSafetyInformation(false)}>
          <View style={{ flex: 1, justifyContent: "center", padding: 18, backgroundColor: "rgba(5,7,5,0.86)" }}>
            <View accessibilityViewIsModal style={{ width: "100%", maxWidth: 520, alignSelf: "center", borderRadius: 18, borderWidth: 1, borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.card, padding: 20, gap: 14 }}>
              <Title style={{ fontSize: 21 }}>Om Hjertestop</Title>
              <Text style={{ color: theme.colors.mutedText, fontSize: 14, lineHeight: 21 }}>{SAFETY_TEXT}</Text>
              <ToolActionButton tone="secondary" label="Luk" onPress={() => setShowSafetyInformation(false)} />
            </View>
          </View>
        </Modal>
        {showClearConfirmation ? (
          <ActionOverlay>
            <Title style={{ fontSize: 21 }}>Ryd aktiv session?</Title>
            <Text style={{ color: theme.colors.text, lineHeight: 21 }}>
              Den aktive session slettes fra denne enhed. Seneste afsluttede oversigt bevares.
            </Text>
            {clearError ? <Text style={{ color: theme.colors.danger, fontWeight: "700" }}>{clearError}</Text> : null}
            <Pressable accessibilityRole="button" accessibilityLabel="Bekræft ryd session" disabled={clearing} onPress={() => void clearSession()} style={({ pressed }) => ({ minHeight: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,123,114,0.48)", backgroundColor: "rgba(255,123,114,0.12)", opacity: pressed || clearing ? 0.6 : 1 })}>
              <Text style={{ color: theme.colors.danger, fontWeight: "900" }}>{clearing ? "Rydder…" : "Ryd session"}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Annuller ryd session" disabled={clearing} onPress={() => setShowClearConfirmation(false)} style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}>
              <Text style={{ color: theme.colors.accentMuted, fontWeight: "800" }}>Annuller</Text>
            </Pressable>
          </ActionOverlay>
        ) : null}
      </Screen>
    </Background>
  );
}
