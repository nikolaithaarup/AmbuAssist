import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { createArrestSession, type ArrestSession } from "../../../../src/domain/cardiac-resus/session";
import {
  clearActiveArrestSession,
  getActiveArrestSession,
  getLatestArrestSession,
  saveActiveArrestSession,
} from "../../../../src/services/cardiacResusStorage";
import { Background } from "../../../../src/ui/Background";
import { hapticReset, hapticSuccess } from "../../../../src/ui/haptics";
import { Card, PrimaryButton, Screen, Subtle, Title } from "../../../../src/ui/Ui";
import { theme } from "../../../../src/ui/theme";

const SAFETY_TEXT = "Hjertestop er et tids- og hændelsesstøtteværktøj. Timere og påmindelser er baseret på dine registreringer og skal kontrolleres mod gældende lokale retningslinjer, klinisk vurdering og medicinsk ledelse.";

export default function CardiacResusLanding() {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<ArrestSession | null>(null);
  const [hasLatestSession, setHasLatestSession] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getActiveArrestSession(), getLatestArrestSession()])
      .then(([active, latest]) => {
        if (!mounted) return;
        setActiveSession(active);
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

  const confirmClear = () => {
    Alert.alert("Ryd aktiv session?", "Den aktive session og dens registreringer slettes fra enheden.", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Ryd session",
        style: "destructive",
        onPress: () => {
          clearActiveArrestSession()
            .then(() => {
              hapticReset();
              setActiveSession(null);
            })
            .catch(() => Alert.alert("Sessionen kunne ikke ryddes"));
        },
      },
    ]);
  };

  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
          <View style={{ gap: 8, marginTop: 12 }}>
            <View style={{ alignSelf: "flex-start", borderRadius: 999, borderWidth: 1, borderColor: "rgba(221,189,98,0.38)", backgroundColor: "rgba(221,189,98,0.10)", paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: theme.colors.warn, fontSize: 12, fontWeight: "800" }}>Under udvikling</Text>
            </View>
            <Title>Hjertestop</Title>
            <Subtle style={{ fontSize: 15 }}>Tids- og hændelsesstøtte ved hjertestop.</Subtle>
          </View>

          <Card>
            <Title style={{ fontSize: 19 }}>Teamlederens workflow</Title>
            <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 22 }}>
              Start en lokal session for at se forløbet tid og registrere hændelser. Denne første version registrerer kun det, brugeren vælger.
            </Text>
          </Card>

          <Card style={{ backgroundColor: "rgba(221,189,98,0.10)" }}>
            <Title style={{ fontSize: 17 }}>Vigtigt</Title>
            <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21 }}>{SAFETY_TEXT}</Text>
          </Card>

          {loading ? <ActivityIndicator color={theme.colors.accent} /> : (
            <View style={{ gap: 10 }}>
              <PrimaryButton label={activeSession ? "Fortsæt aktiv session" : "Start session"} onPress={startSession} />
              {hasLatestSession ? (
                <PrimaryButton label="Se seneste hjertestop-session" onPress={() => router.push("/tools/assessment-tools/cardiac-resus/summary" as Href)} />
              ) : null}
              {activeSession ? (
                <Pressable onPress={confirmClear} style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}>
                  <Text style={{ color: theme.colors.danger, fontWeight: "800" }}>Ryd aktiv session</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </ScrollView>
      </Screen>
    </Background>
  );
}
