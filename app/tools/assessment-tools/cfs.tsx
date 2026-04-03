import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../../src/i18n/useT";
import { Background } from "../../../src/ui/Background";
import { CollapsibleCard } from "../../../src/ui/CollapsibleCard";
import { Card, Screen, Subtle, Title } from "../../../src/ui/Ui";
import { theme } from "../../../src/ui/theme";

type Level = {
  score: number;
  titleKey: string;
  descKey: string;
};

const levels: Level[] = [
  { score: 1, titleKey: "cfs_1_title", descKey: "cfs_1_desc" },
  { score: 2, titleKey: "cfs_2_title", descKey: "cfs_2_desc" },
  { score: 3, titleKey: "cfs_3_title", descKey: "cfs_3_desc" },
  { score: 4, titleKey: "cfs_4_title", descKey: "cfs_4_desc" },
  { score: 5, titleKey: "cfs_5_title", descKey: "cfs_5_desc" },
  { score: 6, titleKey: "cfs_6_title", descKey: "cfs_6_desc" },
  { score: 7, titleKey: "cfs_7_title", descKey: "cfs_7_desc" },
  { score: 8, titleKey: "cfs_8_title", descKey: "cfs_8_desc" },
  { score: 9, titleKey: "cfs_9_title", descKey: "cfs_9_desc" },
];

function clampScore(v: number | null): number | null {
  if (v == null) return null;
  if (!Number.isFinite(v)) return null;
  return Math.max(1, Math.min(9, Math.round(v)));
}

function SourceItem({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View
      style={{
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.06)",
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: "800",
          lineHeight: 18,
        }}
      >
        {title}
      </Text>
      {!!subtitle && (
        <Text
          style={{
            color: theme.colors.mutedText,
            fontSize: 12,
            lineHeight: 17,
            marginTop: 2,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export default function CFS() {
  const { t } = useT();
  const [selected, setSelected] = useState<number | null>(null);

  const picked = useMemo(() => {
    const s = clampScore(selected);
    if (!s) return null;
    return levels.find((x) => x.score === s) ?? null;
  }, [selected]);

  function reset() {
    setSelected(null);
  }

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("cfs_title")}</Title>
          <Subtle>{t("cfs_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            <Title>{t("cfs_pickTitle")}</Title>
            <Subtle>{t("cfs_pickSub")}</Subtle>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 10,
              }}
            >
              {levels.map((lvl) => {
                const active = selected === lvl.score;
                return (
                  <Pressable
                    key={lvl.score}
                    onPress={() => setSelected(lvl.score)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.75 : 1,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                      backgroundColor: active
                        ? "rgba(220,220,220,0.18)"
                        : "rgba(0,0,0,0.10)",
                    })}
                    accessibilityRole="button"
                    accessibilityLabel={`CFS ${lvl.score}`}
                  >
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontWeight: "900",
                        fontSize: 16,
                      }}
                    >
                      {lvl.score}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Pressable
                onPress={reset}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor: "rgba(0,0,0,0.10)",
                  alignItems: "center",
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  {t("reset")}
                </Text>
              </Pressable>
            </View>
          </Card>

          {picked ? (
            <Card>
              <Title>{t("result")}</Title>

              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 22,
                  fontWeight: "900",
                }}
              >
                {t("cfs_scoreLabel")} {picked.score}
              </Text>

              <View
                style={{
                  marginTop: 10,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  padding: 12,
                  backgroundColor: "rgba(0,0,0,0.14)",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                >
                  {t(picked.titleKey)}
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 14,
                    lineHeight: 18,
                  }}
                >
                  {t(picked.descKey)}
                </Text>
              </View>

              <View
                style={{
                  marginTop: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  padding: 12,
                  backgroundColor: "rgba(0,0,0,0.10)",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.mutedText,
                    fontSize: 13,
                    lineHeight: 18,
                  }}
                >
                  {t("cfs_result_disclaimer")}
                </Text>
              </View>
            </Card>
          ) : (
            <Card>
              <Title>{t("result")}</Title>
              <Subtle>{t("cfs_noSelection")}</Subtle>
            </Card>
          )}

          <CollapsibleCard
            title={t("tool_disclaimer_title")}
            subtitle={t("cfs_page_disclaimer")}
          >
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                padding: 12,
                backgroundColor: "rgba(255,209,102,0.10)",
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {t("cfs_page_disclaimer")}
              </Text>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title={t("tool_sources_title")}
            subtitle={t("cfs_sources_sub")}
          >
            <Subtle style={{ marginBottom: 8 }}>{t("cfs_sources_sub")}</Subtle>

            <View style={{ marginTop: 4 }}>
              <SourceItem
                title={t("cfs_source_1_title")}
                subtitle={t("cfs_source_1_sub")}
              />
              <SourceItem
                title={t("cfs_source_2_title")}
                subtitle={t("cfs_source_2_sub")}
              />
              <SourceItem
                title={t("cfs_source_3_title")}
                subtitle={t("cfs_source_3_sub")}
              />
            </View>
          </CollapsibleCard>
        </ScrollView>
      </Screen>
    </Background>
  );
}
