import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BloodGasPageHeader, BloodGasProvenance } from "../../../../src/features/bloodgas/BloodGasPresentation";
import { useT } from "../../../../src/i18n/useT";
import { useSettings } from "../../../../src/state/settings";
import { Background } from "../../../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../../../src/ui/Ui";
import { theme } from "../../../../src/ui/theme";

const TOOLS = [
  { titleKey: "tool_bg_acidbase_title", descKey: "tool_bg_acidbase_desc", path: "/tools/assessment-tools/bloodgas/acid-base" },
  { titleKey: "tool_bg_patterns_title", descKey: "tool_bg_patterns_desc", path: "/tools/assessment-tools/bloodgas/patterns" },
  { titleKey: "tool_bg_infection_title", descKey: "tool_bg_infection_desc", path: "/tools/assessment-tools/bloodgas/infection" },
] as const;

export default function BloodGasPage() {
  const router = useRouter();
  const { t } = useT();
  const { settings } = useSettings();

  return (
    <Background>
      <Screen>
        <BloodGasPageHeader title={t("tool_bloodgas_title")} subtitle={t("tool_bloodgas_desc")} />
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <View style={{ gap: 12 }}>
            {TOOLS.map((tool) => (
              <Pressable
                key={tool.path}
                accessibilityRole="button"
                onPress={() => router.push(tool.path)}
                style={({ pressed }) => ({ opacity: pressed ? 0.76 : 1, transform: [{ scale: pressed ? 0.992 : 1 }] })}
              >
                <Card style={{ minHeight: 88, justifyContent: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <View style={{ flex: 1, gap: 5 }}>
                      <Title style={{ fontSize: 18 }}>{t(tool.titleKey)}</Title>
                      <Subtle style={{ lineHeight: 19 }}>{t(tool.descKey)}</Subtle>
                    </View>
                    <Text style={{ color: theme.colors.accentMuted, fontSize: 24 }}>›</Text>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
          <BloodGasProvenance />
          <Card style={{ backgroundColor: "rgba(221,189,98,0.07)", borderColor: "rgba(221,189,98,0.25)" }}>
            <Text style={{ color: theme.colors.warn, fontWeight: "800" }}>
              {settings.language === "da" ? "Prelaunch-værktøj" : "Prelaunch tool"}
            </Text>
            <Subtle style={{ lineHeight: 20 }}>
              {settings.language === "da"
                ? "Kontrollér altid indtastede værdier og konklusioner mod patientens klinik og lokale instrukser."
                : "Always verify entered values and conclusions against the patient’s clinical presentation and local guidance."}
            </Subtle>
          </Card>
        </ScrollView>
      </Screen>
    </Background>
  );
}
