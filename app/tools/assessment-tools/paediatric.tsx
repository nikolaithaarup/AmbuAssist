import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../../src/i18n/useT";
import { useSettings } from "../../../src/state/settings";
import {
  getReference,
  type ReferenceDoc,
} from "../../../src/services/referenceService";
import { Background } from "../../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../../src/ui/Ui";
import { theme } from "../../../src/ui/theme";
import ApgarContent from "../../../src/features/assessment-tools/ApgarContent";
import FlaccContent from "../../../src/features/assessment-tools/FlaccContent";

type PaediatricTool = "apgar" | "flacc";

export default function Paediatric() {
  const { t } = useT();
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";

  const [tool, setTool] = useState<PaediatricTool>("apgar");
  const [apgarRef, setApgarRef] = useState<ReferenceDoc | null>(null);
  const [flaccRef, setFlaccRef] = useState<ReferenceDoc | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReferences() {
      const [apgarData, flaccData] = await Promise.all([
        getReference("apgar"),
        getReference("flacc"),
      ]);

      if (!active) return;

      setApgarRef(apgarData);
      setFlaccRef(flaccData);
    }

    loadReferences();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("paediatric_title")}</Title>
          <Subtle>{t("paediatric_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setTool("apgar")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor:
                    tool === "apgar"
                      ? "rgba(220,220,220,0.18)"
                      : "rgba(0,0,0,0.10)",
                  alignItems: "center",
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  APGAR
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTool("flacc")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor:
                    tool === "flacc"
                      ? "rgba(220,220,220,0.18)"
                      : "rgba(0,0,0,0.10)",
                  alignItems: "center",
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  FLACC
                </Text>
              </Pressable>
            </View>
          </Card>

          {tool === "apgar" ? (
            <ApgarContent lang={lang} reference={apgarRef} />
          ) : (
            <FlaccContent lang={lang} reference={flaccRef} />
          )}
        </ScrollView>
      </Screen>
    </Background>
  );
}
