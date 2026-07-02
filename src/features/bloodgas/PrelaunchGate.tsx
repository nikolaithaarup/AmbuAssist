import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSettings } from "../../state/settings";
import { Card, PrimaryButton, Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";

const ACCEPTANCE_KEY = "ambuassist.bloodgas.prelaunch-accepted.v1";

export function PrelaunchGate() {
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
      animationType="fade"
      onRequestClose={() => router.back()}
    >
      <View style={{ flex: 1, justifyContent: "center", padding: 22, backgroundColor: "rgba(5,7,5,0.82)" }}>
        <Card style={{ maxWidth: 520, width: "100%", alignSelf: "center", padding: 22, gap: 16 }}>
          <View style={{ gap: 8 }}>
            <Title style={{ fontSize: 24 }}>
              {isDanish ? "Blodgas er under udvikling" : "Blood Gas is under development"}
            </Title>
            <Subtle style={{ fontSize: 15, lineHeight: 22 }}>
              {isDanish
                ? "Dette værktøj er i prelaunch. Tolkningen kan være ufuldstændig og må ikke erstatte klinisk vurdering, lokale instrukser eller lægefaglig konference. Kontrollér altid værdier og konklusioner før handling."
                : "This tool is currently in prelaunch. The interpretation may be incomplete and must not replace clinical judgement, local guidelines, or physician consultation. Always verify values and conclusions before acting."}
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

export function DevelopmentChip() {
  const { settings } = useSettings();
  return (
    <View style={{ alignSelf: "flex-start", borderRadius: 999, borderWidth: 1, borderColor: "rgba(221,189,98,0.38)", backgroundColor: "rgba(221,189,98,0.10)", paddingHorizontal: 10, paddingVertical: 5 }}>
      <Text style={{ color: theme.colors.warn, fontSize: 12, fontWeight: "800" }}>
        {settings.language === "da" ? "Under udvikling" : "Under development"}
      </Text>
    </View>
  );
}
