// app/tools/assessment-tools/index.tsx
import { type Href, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { useT } from "../../../src/i18n/useT";
import { Background } from "../../../src/ui/Background";
import { hapticToolOpen } from "../../../src/ui/haptics";
import { NavigationCard } from "../../../src/ui/NavigationCard";
import { Screen, Subtle, Title } from "../../../src/ui/Ui";

type ToolLink = {
  titleKey: any;
  descKey: any;
  path: Extract<Href, string>;
};

export default function AssessmentToolsPage() {
  const router = useRouter();
  const { lang, t } = useT();

  const tools: ToolLink[] = [
    {
      titleKey: "tool_burns_title",
      descKey: "tool_burns_desc",
      path: "/tools/brandsaar",
    },
    {
      titleKey: "tool_behaviouralGeriatric_title",
      descKey: "tool_behaviouralGeriatric_desc",
      path: "/tools/assessment-tools/behavioural-geriatric",
    },
    {
      titleKey: "tool_neuro_title",
      descKey: "tool_neuro_desc",
      path: "/tools/assessment-tools/neurological",
    },
    {
      titleKey: "tool_paediatric_title",
      descKey: "tool_paediatric_desc",
      path: "/tools/assessment-tools/paediatric",
    },
    {
      titleKey: "tool_bloodgas_title",
      descKey: "tool_bloodgas_desc",
      path: "/tools/assessment-tools/bloodgas",
    },
    {
      titleKey: "tool_wells_title",
      descKey: "tool_wells_desc",
      path: "/tools/assessment-tools/wells-dvt",
    },
    {
      titleKey: "tool_spine_title",
      descKey: "tool_spine_desc",
      path: "/tools/assessment-tools/spinal-trauma",
    },
    {
      titleKey: "tool_news2_title",
      descKey: "tool_news2_desc",
      path: "/tools/assessment-tools/news2",
    },
  ];

  return (
    <Background>
      <Screen>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
            alignItems: "center",
          }}
        >
          <View style={{ width: "100%", maxWidth: 520, gap: 12 }}>
            <Title
              style={{
                textAlign: "center",
                fontSize: lang === "da" ? 22 : 28,
                lineHeight: lang === "da" ? 27 : 34,
                letterSpacing: lang === "da" ? -0.35 : 0,
              }}
            >
              {t("tool_assessment_title")}
            </Title>

            <Subtle style={{ textAlign: "center", marginBottom: 4 }}>
              {t("tool_assessment_desc")}
            </Subtle>

            {tools.map((tool) => (
              <NavigationCard
                key={tool.path}
                title={t(tool.titleKey)}
                description={t(tool.descKey)}
                onPress={() => {
                  hapticToolOpen();
                  router.push(tool.path);
                }}
              />
            ))}
          </View>
        </ScrollView>
      </Screen>
    </Background>
  );
}
