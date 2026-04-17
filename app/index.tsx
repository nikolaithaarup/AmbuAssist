// app/index.tsx
import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useT } from "../src/i18n/useT";
import { useSettings } from "../src/state/settings";
import { Background } from "../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../src/ui/Ui";
import { theme } from "../src/ui/theme";

type ToolLink = { titleKey: any; descKey: any; path: string };

function FullWidthToolCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        width: "100%",
      })}
    >
      <Card style={{ paddingHorizontal: 18, paddingVertical: 16 }}>
        <View style={{ alignItems: "center", gap: 6 }}>
          <Title style={{ textAlign: "center", fontSize: 16 }}>{title}</Title>
          <Subtle style={{ textAlign: "center", fontSize: 12 }}>
            {description}
          </Subtle>
        </View>
      </Card>
    </Pressable>
  );
}

export default function Home() {
  const router = useRouter();
  const { setLanguage, settings } = useSettings();
  const { t } = useT();

  const mainTools: ToolLink[] = [
    {
      titleKey: "tool_dest_title",
      descKey: "tool_dest_desc",
      path: "/tools/destination",
    },
    {
      titleKey: "tool_weightDose_title",
      descKey: "tool_weightDose_desc",
      path: "/tools/weight-joule-dose",
    },
    {
      titleKey: "tool_trombolysis_title",
      descKey: "tool_trombolysis_desc",
      path: "/tools/trombolysis",
    },
    {
      titleKey: "tool_supportNumbers_title",
      descKey: "tool_supportNumbers_desc",
      path: "/tools/support-numbers",
    },
    {
      titleKey: "tool_exams_title",
      descKey: "tool_exams_desc",
      path: "/tools/exams",
    },
    {
      titleKey: "tool_assessment_title",
      descKey: "tool_assessment_desc",
      path: "/tools/assessment-tools",
    },
    {
      titleKey: "tool_meddisc_title",
      descKey: "tool_meddisc_desc",
      path: "/tools/medical-disclaimer",
    },
    {
      titleKey: "tool_contact_title",
      descKey: "tool_contact_desc",
      path: "/tools/contact",
    },
    {
      titleKey: "tool_about_title",
      descKey: "tool_about_desc",
      path: "/tools/about",
    },
  ];

  return (
    <Background>
      <Screen>
        <View style={{ gap: 0, alignItems: "center" }}>
          <Image
            source={require("../assets/her-icon.png")}
            style={{
              width: 130,
              height: 130,
              marginTop: 20,
              marginBottom: 0,
              opacity: 0.95,
            }}
            resizeMode="contain"
          />

          <Image
            source={require("../assets/ambuassist-logo.png")}
            style={{
              width: "100%",
              maxWidth: 440,
              height: 96,
              marginTop: -20,
              marginBottom: -10,
            }}
            resizeMode="contain"
          />

          <Subtle style={{ textAlign: "center", marginTop: -2 }}>
            {t("homeTagline")}
          </Subtle>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 10,
              marginBottom: -10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Pressable
              onPress={() => setLanguage("en")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 6,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                backgroundColor:
                  settings.language === "en"
                    ? "rgba(220,220,220,0.18)"
                    : "transparent",
                alignSelf: "center",
              })}
              accessibilityRole="button"
              accessibilityLabel="English"
            >
              <Image
                source={require("../assets/flags/gb.png")}
                style={{ width: 32, height: 32, borderRadius: 8 }}
                resizeMode="cover"
              />
            </Pressable>

            <Pressable
              onPress={() => setLanguage("da")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 6,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                backgroundColor:
                  settings.language === "da"
                    ? "rgba(220,220,220,0.18)"
                    : "transparent",
                alignSelf: "center",
              })}
              accessibilityRole="button"
              accessibilityLabel="Dansk"
            >
              <Image
                source={require("../assets/flags/dk.png")}
                style={{ width: 32, height: 32, borderRadius: 8 }}
                resizeMode="cover"
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingBottom: 24,
            paddingTop: 10,
            paddingHorizontal: 12,
            alignItems: "center",
          }}
        >
          <View style={{ width: "100%", maxWidth: 520, gap: 12 }}>
            {mainTools.map((tool) => (
              <FullWidthToolCard
                key={tool.path}
                title={t(tool.titleKey)}
                description={t(tool.descKey)}
                onPress={() => router.push(tool.path)}
              />
            ))}
          </View>
        </ScrollView>
      </Screen>
    </Background>
  );
}
