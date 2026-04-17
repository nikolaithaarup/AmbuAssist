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
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ width: "100%", maxWidth: 520 }}>
            <Card style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
              <View style={{ alignItems: "center", gap: 12 }}>
                <Title style={{ textAlign: "center" }}>Bloodgas</Title>

                <Subtle style={{ textAlign: "center", lineHeight: 20 }}>
                  This tool is currently being built and will be available soon.
                </Subtle>

                <Pressable
                  onPress={() => router.back()}
                  style={({ pressed }) => ({
                    marginTop: 8,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Card style={{ paddingHorizontal: 18, paddingVertical: 10 }}>
                    <Subtle style={{ textAlign: "center" }}>Back</Subtle>
                  </Card>
                </Pressable>
              </View>
            </Card>
          </View>
        </ScrollView>
      </Screen>
    </Background>
  );
}
