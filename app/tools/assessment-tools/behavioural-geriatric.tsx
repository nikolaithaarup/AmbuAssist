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
import BvcContent from "../../../src/features/assessment-tools/BvcContent";
import CfsContent from "../../../src/features/assessment-tools/CfsContent";
import AbcStampContent from "../../../src/features/assessment-tools/AbcStampContent";

type ToolTab = "bvc" | "abcstamp" | "cfs";

export default function BehaviouralGeriatric() {
  const { t } = useT();
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";

  const [tab, setTab] = useState<ToolTab>("bvc");

  const [bvcRef, setBvcRef] = useState<ReferenceDoc | null>(null);
  const [abcstampRef, setAbcstampRef] = useState<ReferenceDoc | null>(null);
  const [cfsRef, setCfsRef] = useState<ReferenceDoc | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReferences() {
      const [bvcData, abcstampData, cfsData] = await Promise.all([
        getReference("bvc"),
        getReference("abcstamp"),
        getReference("cfs"),
      ]);

      if (!active) return;

      setBvcRef(bvcData);
      setAbcstampRef(abcstampData);
      setCfsRef(cfsData);
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
          <Title>{t("behaviouralGeriatric_title")}</Title>
          <Subtle>{t("behaviouralGeriatric_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setTab("bvc")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor:
                    tab === "bvc"
                      ? "rgba(220,220,220,0.18)"
                      : "rgba(0,0,0,0.10)",
                  alignItems: "center",
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  BVC
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTab("abcstamp")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor:
                    tab === "abcstamp"
                      ? "rgba(220,220,220,0.18)"
                      : "rgba(0,0,0,0.10)",
                  alignItems: "center",
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  ABC-STAMP
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTab("cfs")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor:
                    tab === "cfs"
                      ? "rgba(220,220,220,0.18)"
                      : "rgba(0,0,0,0.10)",
                  alignItems: "center",
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  CFS
                </Text>
              </Pressable>
            </View>
          </Card>

          {tab === "bvc" ? (
            <BvcContent lang={lang} reference={bvcRef} />
          ) : tab === "abcstamp" ? (
            <AbcStampContent lang={lang} reference={abcstampRef} />
          ) : (
            <CfsContent lang={lang} reference={cfsRef} />
          )}
        </ScrollView>
      </Screen>
    </Background>
  );
}
