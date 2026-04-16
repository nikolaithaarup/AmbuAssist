import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useT } from "../../../../src/i18n/useT";
import { Background } from "../../../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../../../src/ui/Ui";

type ToolLink = {
  titleKey: string;
  descKey: string;
  path: string;
};

export default function BloodGasPage() {
  const router = useRouter();
  const { t } = useT();

  const tools: ToolLink[] = [
    {
      titleKey: "tool_bg_acidbase_title",
      descKey: "tool_bg_acidbase_desc",
      path: "/tools/assessment-tools/bloodgas/acid-base",
    },
    {
      titleKey: "tool_bg_patterns_title",
      descKey: "tool_bg_patterns_desc",
      path: "/tools/assessment-tools/bloodgas/patterns",
    },
    {
      titleKey: "tool_bg_infection_title",
      descKey: "tool_bg_infection_desc",
      path: "/tools/assessment-tools/bloodgas/infection",
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
              {t("tool_bloodgas_title")}
            </Title>

            <Subtle style={{ textAlign: "center" }}>
              {t("tool_bloodgas_desc")}
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
