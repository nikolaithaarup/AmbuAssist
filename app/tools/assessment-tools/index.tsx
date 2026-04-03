// app/tools/assessment-tools/index.tsx
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useT } from "../../../src/i18n/useT";
import { Background } from "../../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../../src/ui/Ui";

type ToolLink = {
  titleKey: any;
  descKey: any;
  path: string;
};

export default function AssessmentToolsPage() {
  const router = useRouter();
  const { t } = useT();

  const tools: ToolLink[] = [
    {
      titleKey: "tool_nihss_title",
      descKey: "tool_nihss_desc",
      path: "/tools/assessment-tools/nihss",
    },
    {
      titleKey: "tool_hints_title",
      descKey: "tool_hints_desc",
      path: "/tools/assessment-tools/hints",
    },
    {
      titleKey: "tool_news2_title",
      descKey: "tool_news2_desc",
      path: "/tools/assessment-tools/news2",
    },
    {
      titleKey: "tool_wells_title",
      descKey: "tool_wells_desc",
      path: "/tools/assessment-tools/wells-dvt",
    },
    {
      titleKey: "tool_bvc_title",
      descKey: "tool_bvc_desc",
      path: "/tools/assessment-tools/bvc",
    },
    {
      titleKey: "tool_spine_title",
      descKey: "tool_spine_desc",
      path: "/tools/assessment-tools/spinal-trauma",
    },
    {
      titleKey: "tool_flacc_title",
      descKey: "tool_flacc_desc",
      path: "/tools/assessment-tools/flacc",
    },
    {
      titleKey: "tool_apgar_title",
      descKey: "tool_apgar_desc",
      path: "/tools/assessment-tools/apgar",
    },
    {
      titleKey: "tool_cfs_title",
      descKey: "tool_cfs_desc",
      path: "/tools/assessment-tools/cfs",
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
                onPress={() => router.push(tool.path)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Card style={{ paddingHorizontal: 18, paddingVertical: 14 }}>
                  <View style={{ alignItems: "center", gap: 6 }}>
                    <Title style={{ textAlign: "center", fontSize: 16 }}>
                      {t(tool.titleKey)}
                    </Title>
                    <Subtle style={{ textAlign: "center", fontSize: 12 }}>
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
