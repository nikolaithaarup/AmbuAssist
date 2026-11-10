import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { BloodGasPageHeader, BloodGasProvenance } from "../../../../src/features/bloodgas/BloodGasPresentation";
import { useT } from "../../../../src/i18n/useT";
import { Background } from "../../../../src/ui/Background";
import { NavigationCard } from "../../../../src/ui/NavigationCard";
import { Screen } from "../../../../src/ui/Ui";

const TOOLS = [
  { titleKey: "tool_bg_acidbase_title", descKey: "tool_bg_acidbase_desc", path: "/tools/assessment-tools/bloodgas/acid-base" },
  { titleKey: "tool_bg_patterns_title", descKey: "tool_bg_patterns_desc", path: "/tools/assessment-tools/bloodgas/patterns" },
  { titleKey: "tool_bg_infection_title", descKey: "tool_bg_infection_desc", path: "/tools/assessment-tools/bloodgas/infection" },
] as const;

export default function BloodGasPage() {
  const router = useRouter();
  const { t } = useT();

  return (
    <Background>
      <Screen>
        <BloodGasPageHeader title={t("tool_bloodgas_title")} subtitle={t("tool_bloodgas_desc")} />
        <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 16 }}>
          <View style={{ gap: 7 }}>
            {TOOLS.map((tool) => (
              <NavigationCard
                key={tool.path}
                title={t(tool.titleKey)}
                compact
                description={undefined}
                onPress={() => router.push(tool.path)}
              />
            ))}
          </View>
          <BloodGasProvenance />
        </ScrollView>
      </Screen>
    </Background>
  );
}
