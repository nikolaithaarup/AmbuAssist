import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSettings } from "../../state/settings";
import { Card, PrimaryButton, Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";
import { useReducedMotionPreference } from "../../ui/motion";

const ACCEPTANCE_KEY = "ambuassist.bloodgas.prelaunch-accepted.v1";

export function PrelaunchGate() {
  const pwa = Platform.OS === "web";
  const reducedMotion = useReducedMotionPreference(pwa);
  const router = useRouter();
  const { settings } = useSettings();
  const isDanish = settings.language === "da";
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ACCEPTANCE_KEY)
      .then((value) => setAccepted(value === "true"))
      .catch(() => setAccepted(false));
  }, []);

  const accept = () => {
    setAccepted(true);
    AsyncStorage.setItem(ACCEPTANCE_KEY, "true").catch(() => {});
  };

  return (
    <Modal
      visible={accepted === false}
      transparent
      animationType={pwa && reducedMotion ? "none" : "fade"}
      onRequestClose={() => router.back()}
    >
      <View style={{ flex: 1, justifyContent: "center", padding: 22, backgroundColor: "rgba(5,7,5,0.82)" }}>
        <Card style={{ maxWidth: 520, width: "100%", alignSelf: "center", padding: 22, gap: 16 }}>
          <View style={{ gap: 8 }}>
            <Title style={{ fontSize: 24 }}>
              {isDanish ? "Blodgas kræver klinisk validering" : "Blood Gas requires clinical validation"}
            </Title>
            <Subtle style={{ fontSize: 15, lineHeight: 22 }}>
              {isDanish
                ? "Fortolkningsstøtten er foreløbig. Kontrollér værdier og konklusioner mod patientens klinik, lokale instrukser og lægefaglig vurdering."
                : "Interpretation support is preliminary. Verify values and conclusions against the patient’s clinical presentation, local guidance, and medical judgement."}
            </Subtle>
          </View>
          <PrimaryButton label={isDanish ? "Jeg forstår" : "I understand"} onPress={accept} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}
          >
            <Text style={{ color: theme.colors.accentMuted, fontWeight: "700", fontSize: 15 }}>
              {isDanish ? "Tilbage" : "Go back"}
            </Text>
          </Pressable>
        </Card>
      </View>
    </Modal>
  );
}
