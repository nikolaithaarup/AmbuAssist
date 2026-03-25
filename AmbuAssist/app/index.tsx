// app/index.tsx
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useT } from "../src/i18n/useT";
import { useSettings } from "../src/state/settings";
import { Background } from "../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../src/ui/Ui";
import { theme } from "../src/ui/theme";

type ToolLink = { titleKey: any; descKey: any; path: string };

function ToolsTwoColumnByMaxWidth({
  tools,
  onPress,
  t,
  resetKey,
}: {
  tools: ToolLink[];
  onPress: (path: string) => void;
  t: (k: any) => string;
  resetKey: string;
}) {
  const [colMax, setColMax] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    setColMax([0, 0]);
  }, [resetKey]);

  const rows = useMemo(
    () => Array.from({ length: Math.ceil(tools.length / 2) }),
    [tools.length],
  );

  function onMeasure(colIdx: 0 | 1) {
    return (e: LayoutChangeEvent) => {
      const w = Math.round(e.nativeEvent.layout.width);
      setColMax((prev) => {
        if (w <= prev[colIdx]) return prev;
        const next: [number, number] = [prev[0], prev[1]];
        next[colIdx] = w;
        return next;
      });
    };
  }

  return (
    <>
      {rows.map((_, rowIdx) => {
        const left = tools[rowIdx * 2];
        const right = tools[rowIdx * 2 + 1];

        return (
          <View
            key={`row-${rowIdx}`}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {/* Left column cell */}
            <View style={{ flex: 1, alignItems: "center" }}>
              {left ? (
                <Pressable
                  onPress={() => onPress(left.path)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View
                    onLayout={onMeasure(0)}
                    style={{
                      width: colMax[0] > 0 ? colMax[0] : undefined,
                      alignSelf: "center",
                    }}
                  >
                    <Card
                      style={{ paddingHorizontal: 18, paddingVertical: 14 }}
                    >
                      <View style={{ alignItems: "center", gap: 6 }}>
                        <Title style={{ textAlign: "center", fontSize: 16 }}>
                          {t(left.titleKey)}
                        </Title>
                        <Subtle style={{ textAlign: "center", fontSize: 12 }}>
                          {t(left.descKey)}
                        </Subtle>
                      </View>
                    </Card>
                  </View>
                </Pressable>
              ) : null}
            </View>

            {/* Right column cell */}
            <View style={{ flex: 1, alignItems: "center" }}>
              {right ? (
                <Pressable
                  onPress={() => onPress(right.path)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View
                    onLayout={onMeasure(1)}
                    style={{
                      width: colMax[1] > 0 ? colMax[1] : undefined,
                      alignSelf: "center",
                    }}
                  >
                    <Card
                      style={{ paddingHorizontal: 18, paddingVertical: 14 }}
                    >
                      <View style={{ alignItems: "center", gap: 6 }}>
                        <Title style={{ textAlign: "center", fontSize: 16 }}>
                          {t(right.titleKey)}
                        </Title>
                        <Subtle style={{ textAlign: "center", fontSize: 12 }}>
                          {t(right.descKey)}
                        </Subtle>
                      </View>
                    </Card>
                  </View>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
    </>
  );
}

export default function Home() {
  const router = useRouter();
  const { setLanguage, settings } = useSettings();
  const { t } = useT();

  const tools: ToolLink[] = [
    {
      titleKey: "tool_weightDose_title",
      descKey: "tool_weightDose_desc",
      path: "/tools/weight-joule-dose",
    },
    {
      titleKey: "tool_news2_title",
      descKey: "tool_news2_desc",
      path: "/tools/news2",
    },
    {
      titleKey: "tool_wells_title",
      descKey: "tool_wells_desc",
      path: "/tools/wells-dvt",
    },
    {
      titleKey: "tool_nihss_title",
      descKey: "tool_nihss_desc",
      path: "/tools/nihss",
    },
    {
      titleKey: "tool_bvc_title",
      descKey: "tool_bvc_desc",
      path: "/tools/bvc",
    },
    {
      titleKey: "tool_exams_title",
      descKey: "tool_exams_desc",
      path: "/tools/exams",
    },
    {
      titleKey: "tool_hints_title",
      descKey: "tool_hints_desc",
      path: "/tools/hints",
    },
    {
      titleKey: "tool_spine_title",
      descKey: "tool_spine_desc",
      path: "/tools/spinal-trauma",
    },
    {
      titleKey: "tool_flacc_title",
      descKey: "tool_flacc_desc",
      path: "/tools/flacc",
    },
    {
      titleKey: "tool_apgar_title",
      descKey: "tool_apgar_desc",
      path: "/tools/apgar",
    },
    {
      titleKey: "tool_dest_title",
      descKey: "tool_dest_desc",
      path: "/tools/destination",
    },
    {
      titleKey: "tool_cfs_title",
      descKey: "tool_cfs_desc",
      path: "/tools/cfs",
    },
  ];

  return (
    <Background>
      <Screen style={{ paddingTop: 10 }}>
        <View style={{ gap: 0, alignItems: "center" }}>
          <Image
            source={require("../assets/her-icon.png")}
            style={{
              width: 130,
              height: 130,
              marginTop: 20,
              marginBottom: 0,
              opacity: 0.95,
            }}
            resizeMode="contain"
          />

          <Image
            source={require("../assets/ambuassist-logo.png")}
            style={{
              width: "100%",
              maxWidth: 440,
              height: 96,
              marginTop: -20,
              marginBottom: -10,
            }}
            resizeMode="contain"
          />

          <Subtle style={{ textAlign: "center", marginTop: -2 }}>
            {t("homeTagline")}
          </Subtle>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 10,
              marginBottom: -10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Pressable
              onPress={() => setLanguage("en")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 6,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                backgroundColor:
                  settings.language === "en"
                    ? "rgba(220,220,220,0.18)"
                    : "transparent",
                alignSelf: "center",
              })}
              accessibilityRole="button"
              accessibilityLabel="English"
            >
              <Image
                source={require("../assets/flags/gb.png")}
                style={{ width: 32, height: 32, borderRadius: 8 }}
                resizeMode="cover"
              />
            </Pressable>

            <Pressable
              onPress={() => setLanguage("da")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 6,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                backgroundColor:
                  settings.language === "da"
                    ? "rgba(220,220,220,0.18)"
                    : "transparent",
                alignSelf: "center",
              })}
              accessibilityRole="button"
              accessibilityLabel="Dansk"
            >
              <Image
                source={require("../assets/flags/dk.png")}
                style={{ width: 32, height: 32, borderRadius: 8 }}
                resizeMode="cover"
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingBottom: 24,
            paddingTop: 10,
            paddingHorizontal: 12,
            alignItems: "center",
          }}
        >
          <View style={{ width: "100%", maxWidth: 520, gap: 12 }}>
            <ToolsTwoColumnByMaxWidth
              tools={tools}
              onPress={(path) => router.push(path)}
              t={t}
              resetKey={settings.language}
            />
          </View>
        </ScrollView>
      </Screen>
    </Background>
  );
}
