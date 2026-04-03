import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../../src/i18n/useT";
import { Background } from "../../../src/ui/Background";
import { CollapsibleCard } from "../../../src/ui/CollapsibleCard";
import { Card, Screen, Subtle, Title } from "../../../src/ui/Ui";
import { theme } from "../../../src/ui/theme";

type FlaccKey = "face" | "legs" | "activity" | "cry" | "consolability";

type FlaccOption = {
  points: 0 | 1 | 2;
  labelKey: string;
};

type FlaccItem = {
  key: FlaccKey;
  titleKey: string;
  options: FlaccOption[];
};

const items: FlaccItem[] = [
  {
    key: "face",
    titleKey: "flacc_face_title",
    options: [
      { points: 0, labelKey: "flacc_face_0" },
      { points: 1, labelKey: "flacc_face_1" },
      { points: 2, labelKey: "flacc_face_2" },
    ],
  },
  {
    key: "legs",
    titleKey: "flacc_legs_title",
    options: [
      { points: 0, labelKey: "flacc_legs_0" },
      { points: 1, labelKey: "flacc_legs_1" },
      { points: 2, labelKey: "flacc_legs_2" },
    ],
  },
  {
    key: "activity",
    titleKey: "flacc_activity_title",
    options: [
      { points: 0, labelKey: "flacc_activity_0" },
      { points: 1, labelKey: "flacc_activity_1" },
      { points: 2, labelKey: "flacc_activity_2" },
    ],
  },
  {
    key: "cry",
    titleKey: "flacc_cry_title",
    options: [
      { points: 0, labelKey: "flacc_cry_0" },
      { points: 1, labelKey: "flacc_cry_1" },
      { points: 2, labelKey: "flacc_cry_2" },
    ],
  },
  {
    key: "consolability",
    titleKey: "flacc_consolability_title",
    options: [
      { points: 0, labelKey: "flacc_consolability_0" },
      { points: 1, labelKey: "flacc_consolability_1" },
      { points: 2, labelKey: "flacc_consolability_2" },
    ],
  },
];

function ScorePill({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        backgroundColor: active ? "rgba(255,209,102,0.25)" : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
        {children}
      </Text>
    </View>
  );
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

export default function FLACC() {
  const { t } = useT();

  const [selected, setSelected] = useState<
    Partial<Record<FlaccKey, 0 | 1 | 2>>
  >({});

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + (selected[it.key] ?? 0), 0);
  }, [selected]);

  const answeredCount = useMemo(() => {
    return items.filter((it) => selected[it.key] !== undefined).length;
  }, [selected]);

  const allAnswered = answeredCount === items.length;

  const severityKey =
    total === 0
      ? "flacc_severity_0"
      : total <= 3
        ? "flacc_severity_mild"
        : total <= 6
          ? "flacc_severity_mod"
          : "flacc_severity_severe";

  function reset() {
    setSelected({});
  }

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("flacc_title")}</Title>
          <Subtle>{t("flacc_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          {items.map((it) => {
            const current = selected[it.key];
            return (
              <Card key={it.key}>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 16,
                    fontWeight: "900",
                    marginBottom: 8,
                  }}
                >
                  {t(it.titleKey)}
                </Text>

                <View style={{ gap: 8 }}>
                  {it.options.map((opt) => {
                    const on = current === opt.points;
                    return (
                      <Pressable
                        key={opt.points}
                        onPress={() =>
                          setSelected((p) => ({ ...p, [it.key]: opt.points }))
                        }
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.75 : 1,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: theme.colors.cardBorder,
                          padding: 12,
                          backgroundColor: on
                            ? "rgba(255,209,102,0.10)"
                            : "rgba(0,0,0,0.10)",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          gap: 10,
                        })}
                      >
                        <ScorePill active={on}>{opt.points}</ScorePill>
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "800",
                            flex: 1,
                            lineHeight: 18,
                          }}
                        >
                          {t(opt.labelKey)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>
            );
          })}

          <Card>
            <Title>{t("result")}</Title>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 22,
                fontWeight: "900",
              }}
            >
              {t("flacc_scoreLabel")} {total} / 10
            </Text>

            <Text
              style={{
                color: theme.colors.mutedText,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {t("tool_answered")} {answeredCount}/{items.length}
            </Text>

            <View
              style={{
                marginTop: 10,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                padding: 12,
                backgroundColor:
                  total >= 7
                    ? "rgba(255,107,107,0.12)"
                    : total >= 4
                      ? "rgba(255,209,102,0.12)"
                      : total >= 1
                        ? "rgba(140,233,154,0.10)"
                        : "rgba(140,233,154,0.06)",
                gap: 8,
              }}
            >
              <Text style={{ color: theme.colors.text, lineHeight: 18 }}>
                {allAnswered ? t(severityKey) : t("flacc_needAll")}
              </Text>

              <Text
                style={{
                  color: theme.colors.mutedText,
                  fontSize: 12,
                  lineHeight: 17,
                }}
              >
                {t("flacc_result_disclaimer")}
              </Text>
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

          <CollapsibleCard
            title={t("tool_disclaimer_title")}
            subtitle={t("flacc_page_disclaimer")}
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
                {t("flacc_page_disclaimer")}
              </Text>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title={t("tool_sources_title")}
            subtitle={t("flacc_sources_sub")}
          >
            <Subtle style={{ marginBottom: 8 }}>
              {t("flacc_sources_sub")}
            </Subtle>

            <View style={{ marginTop: 4 }}>
              <SourceItem
                title={t("flacc_source_1_title")}
                subtitle={t("flacc_source_1_sub")}
              />
              <SourceItem
                title={t("flacc_source_2_title")}
                subtitle={t("flacc_source_2_sub")}
              />
              <SourceItem
                title={t("flacc_source_3_title")}
                subtitle={t("flacc_source_3_sub")}
              />
            </View>
          </CollapsibleCard>

          <Subtle style={{ textAlign: "center" }}>
            {t("flacc_disclaimer")}
          </Subtle>
        </ScrollView>
      </Screen>
    </Background>
  );
}
