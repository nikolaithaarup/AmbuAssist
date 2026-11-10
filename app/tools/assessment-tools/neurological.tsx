import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../../src/i18n/useT";
import { useSettings } from "../../../src/state/settings";
import {
  getReference,
  type ReferenceDoc,
} from "../../../src/services/referenceService";
import { Background } from "../../../src/ui/Background";
import { Screen, Subtle, Title } from "../../../src/ui/Ui";
import { theme } from "../../../src/ui/theme";
import NihssContent from "../../../src/features/assessment-tools/NihssContent";
import PressContent from "../../../src/features/assessment-tools/PressContent";
import HintsContent from "../../../src/features/assessment-tools/HintsContent";

type NeurologicalTool = "nihss" | "press" | "hints";

export default function Neurological() {
  const { t } = useT();
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";

  const [tool, setTool] = useState<NeurologicalTool>("nihss");

  const [nihssRef, setNihssRef] = useState<ReferenceDoc | null>(null);
  const [pressRef, setPressRef] = useState<ReferenceDoc | null>(null);
  const [hintsRef, setHintsRef] = useState<ReferenceDoc | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReferences() {
      const [nihssData, pressData, hintsData] = await Promise.all([
        getReference("nihss"),
        getReference("press"),
        getReference("hints"),
      ]);

      if (!active) return;

      setNihssRef(nihssData);
      setPressRef(pressData);
      setHintsRef(hintsData);
    }

    loadReferences();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Background>
      <Screen>
        <View style={{ gap: 3, marginTop: Platform.OS === "web" ? 0 : 8 }}>
          <Title style={{ fontSize: 22, lineHeight: 27 }}>{t("neurological_title")}</Title>
          <Subtle>{t("neurological_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 16 }}>
          <View style={{ paddingVertical: 2 }}>
            <View style={{ flexDirection: "row", flexWrap: Platform.OS === "web" ? "wrap" : "nowrap", gap: 6 }}>
              <Pressable
                onPress={() => setTool("nihss")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flex: 1,
                  minWidth: Platform.OS === "web" ? 88 : undefined,
                  minHeight: 44,
                  paddingVertical: 7,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor:
                    tool === "nihss"
                      ? "rgba(220,220,220,0.18)"
                      : "rgba(0,0,0,0.10)",
                  alignItems: "center",
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  NIHSS
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTool("press")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flex: 1,
                  minWidth: Platform.OS === "web" ? 88 : undefined,
                  minHeight: 44,
                  paddingVertical: 7,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor:
                    tool === "press"
                      ? "rgba(220,220,220,0.18)"
                      : "rgba(0,0,0,0.10)",
                  alignItems: "center",
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  PreSS
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTool("hints")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flex: 1,
                  minWidth: Platform.OS === "web" ? 88 : undefined,
                  minHeight: 44,
                  paddingVertical: 7,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor:
                    tool === "hints"
                      ? "rgba(220,220,220,0.18)"
                      : "rgba(0,0,0,0.10)",
                  alignItems: "center",
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  HINTS
                </Text>
              </Pressable>
            </View>
          </View>

          {tool === "nihss" ? (
            <NihssContent lang={lang} reference={nihssRef} />
          ) : tool === "press" ? (
            <PressContent lang={lang} reference={pressRef} />
          ) : (
            <HintsContent lang={lang} reference={hintsRef} />
          )}
        </ScrollView>
      </Screen>
    </Background>
  );
}
