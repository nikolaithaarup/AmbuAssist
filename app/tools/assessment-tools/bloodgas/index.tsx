import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { BloodGasPageHeader, BloodGasProvenance } from "../../../../src/features/bloodgas/BloodGasPresentation";
import { useT } from "../../../../src/i18n/useT";
import { Background } from "../../../../src/ui/Background";
import { NavigationCard } from "../../../../src/ui/NavigationCard";
import { Screen } from "../../../../src/ui/Ui";

const TOOLS = [
  { titleKey: "tool_bg_acidbase_title", path: "/tools/assessment-tools/bloodgas/acid-base" },
  { titleKey: "tool_bg_patterns_title", path: "/tools/assessment-tools/bloodgas/patterns" },
  { titleKey: "tool_bg_infection_title", path: "/tools/assessment-tools/bloodgas/infection" },
] as const;

export default function BloodGasPage() {
  const router = useRouter();
  const { t } = useT();

  return (
    <Background>
      <Screen>
        <BloodGasPageHeader title={t("tool_bloodgas_title")} />
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <View style={{ gap: 8 }}>
            {TOOLS.map((tool) => (
              <NavigationCard
                key={tool.path}
                title={t(tool.titleKey)}
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
