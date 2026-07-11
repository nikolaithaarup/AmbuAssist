// app/tools/assessment-tools/index.tsx
import { type Href, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useT } from "../../../src/i18n/useT";
import { Background } from "../../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../../src/ui/Ui";
import { hapticToolOpen } from "../../../src/ui/haptics";

type ToolLink = {
  titleKey: any;
  descKey: any;
  path: Extract<Href, string>;
};

export default function AssessmentToolsPage() {
  const router = useRouter();
  const { t } = useT();

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
            <Title style={{ textAlign: "center" }}>
              {t("tool_assessment_title")}
            </Title>

            <Subtle style={{ textAlign: "center", marginBottom: 4 }}>
              {t("tool_assessment_desc")}
            </Subtle>

            {tools.map((tool) => (
              <Pressable
                key={tool.path}
                onPress={() => {
                  hapticToolOpen();
                  router.push(tool.path);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.86 : 1,
                  transform: [{ scale: pressed ? 0.992 : 1 }],
                })}
              >
                <Card style={{ paddingHorizontal: 18, paddingVertical: 17, minHeight: 70 }}>
                  <View style={{ alignItems: "flex-start", gap: 5 }}>
                    <Title style={{ fontSize: 17 }}>
                      {t(tool.titleKey)}
                    </Title>
                    <Subtle style={{ fontSize: 13 }}>
                      {t(tool.descKey)}
                    </Subtle>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Screen>
    </Background>
  );
}
