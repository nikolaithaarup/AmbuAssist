// app/tools/nihss.tsx
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../src/i18n/useT";
import { Background } from "../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";

type Option = { labelKey: string; points: number };
type Item = { key: string; titleKey: string; options: Option[] };

const items: Item[] = [
  {
    key: "1a",
    titleKey: "nihss_1a_title",
    options: [
      { labelKey: "nihss_1a_opt_alert", points: 0 },
      { labelKey: "nihss_1a_opt_drowsy", points: 1 },
      { labelKey: "nihss_1a_opt_obtunded", points: 2 },
      { labelKey: "nihss_1a_opt_coma", points: 3 },
    ],
  },
  {
    key: "1b",
    titleKey: "nihss_1b_title",
    options: [
      { labelKey: "nihss_1b_opt_both", points: 0 },
      { labelKey: "nihss_1b_opt_one", points: 1 },
      { labelKey: "nihss_1b_opt_neither", points: 2 },
    ],
  },
  {
    key: "1c",
    titleKey: "nihss_1c_title",
    options: [
      { labelKey: "nihss_1c_opt_both", points: 0 },
      { labelKey: "nihss_1c_opt_one", points: 1 },
      { labelKey: "nihss_1c_opt_neither", points: 2 },
    ],
  },
  {
    key: "2",
    titleKey: "nihss_2_title",
    options: [
      { labelKey: "nihss_2_opt_normal", points: 0 },
      { labelKey: "nihss_2_opt_partial", points: 1 },
      { labelKey: "nihss_2_opt_forced", points: 2 },
    ],
  },
  {
    key: "3",
    titleKey: "nihss_3_title",
    options: [
      { labelKey: "nihss_3_opt_none", points: 0 },
      { labelKey: "nihss_3_opt_partial", points: 1 },
      { labelKey: "nihss_3_opt_complete", points: 2 },
      { labelKey: "nihss_3_opt_bilateral", points: 3 },
    ],
  },
  {
    key: "4",
    titleKey: "nihss_4_title",
    options: [
      { labelKey: "nihss_4_opt_normal", points: 0 },
      { labelKey: "nihss_4_opt_minor", points: 1 },
      { labelKey: "nihss_4_opt_partial", points: 2 },
      { labelKey: "nihss_4_opt_complete", points: 3 },
    ],
  },
  {
    key: "5L",
    titleKey: "nihss_5L_title",
    options: [
      { labelKey: "nihss_5_opt_noDrift", points: 0 },
      { labelKey: "nihss_5_opt_drift", points: 1 },
      { labelKey: "nihss_5_opt_someEffort", points: 2 },
      { labelKey: "nihss_5_opt_noEffort", points: 3 },
      { labelKey: "nihss_5_opt_noMovement", points: 4 },
    ],
  },
  {
    key: "5R",
    titleKey: "nihss_5R_title",
    options: [
      { labelKey: "nihss_5_opt_noDrift", points: 0 },
      { labelKey: "nihss_5_opt_drift", points: 1 },
      { labelKey: "nihss_5_opt_someEffort", points: 2 },
      { labelKey: "nihss_5_opt_noEffort", points: 3 },
      { labelKey: "nihss_5_opt_noMovement", points: 4 },
    ],
  },
  {
    key: "6L",
    titleKey: "nihss_6L_title",
    options: [
      { labelKey: "nihss_6_opt_noDrift", points: 0 },
      { labelKey: "nihss_6_opt_drift", points: 1 },
      { labelKey: "nihss_6_opt_someEffort", points: 2 },
      { labelKey: "nihss_6_opt_noEffort", points: 3 },
      { labelKey: "nihss_6_opt_noMovement", points: 4 },
    ],
  },
  {
    key: "6R",
    titleKey: "nihss_6R_title",
    options: [
      { labelKey: "nihss_6_opt_noDrift", points: 0 },
      { labelKey: "nihss_6_opt_drift", points: 1 },
      { labelKey: "nihss_6_opt_someEffort", points: 2 },
      { labelKey: "nihss_6_opt_noEffort", points: 3 },
      { labelKey: "nihss_6_opt_noMovement", points: 4 },
    ],
  },
  {
    key: "7",
    titleKey: "nihss_7_title",
    options: [
      { labelKey: "nihss_7_opt_absent", points: 0 },
      { labelKey: "nihss_7_opt_one", points: 1 },
      { labelKey: "nihss_7_opt_two", points: 2 },
    ],
  },
  {
    key: "8",
    titleKey: "nihss_8_title",
    options: [
      { labelKey: "nihss_8_opt_normal", points: 0 },
      { labelKey: "nihss_8_opt_mild", points: 1 },
      { labelKey: "nihss_8_opt_severe", points: 2 },
    ],
  },
  {
    key: "9",
    titleKey: "nihss_9_title",
    options: [
      { labelKey: "nihss_9_opt_none", points: 0 },
      { labelKey: "nihss_9_opt_mild", points: 1 },
      { labelKey: "nihss_9_opt_severe", points: 2 },
      { labelKey: "nihss_9_opt_mute", points: 3 },
    ],
  },
  {
    key: "10",
    titleKey: "nihss_10_title",
    options: [
      { labelKey: "nihss_10_opt_normal", points: 0 },
      { labelKey: "nihss_10_opt_mild", points: 1 },
      { labelKey: "nihss_10_opt_severe", points: 2 },
    ],
  },
  {
    key: "11",
    titleKey: "nihss_11_title",
    options: [
      { labelKey: "nihss_11_opt_none", points: 0 },
      { labelKey: "nihss_11_opt_mild", points: 1 },
      { labelKey: "nihss_11_opt_severe", points: 2 },
    ],
  },
];

export default function NIHSS() {
  const { t } = useT();
  const [sel, setSel] = useState<Record<string, number>>({});

  const total = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (Number.isFinite(sel[it.key]) ? sel[it.key] : 0),
        0
      ),
    [sel]
  );

  const severity =
    total === 0
      ? t("nihss_noStroke")
      : total <= 4
      ? t("nihss_minor")
      : total <= 15
      ? t("nihss_moderate")
      : total <= 20
      ? t("nihss_modSevere")
      : t("nihss_severe");

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("nihss_title")}</Title>
          <Subtle>{t("nihss_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          {items.map((it) => (
            <Card key={it.key}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                {t(it.titleKey)}
              </Text>

              {it.options.map((op) => {
                const active = sel[it.key] === op.points;
                return (
                  <Pressable
                    key={op.labelKey}
                    onPress={() =>
                      setSel((p) => ({ ...p, [it.key]: op.points }))
                    }
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                      backgroundColor: active
                        ? "rgba(220,220,220,0.18)"
                        : "rgba(0,0,0,0.10)",
                      marginTop: 8,
                    }}
                  >
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "800" }}
                    >
                      {t(op.labelKey)}{" "}
                      <Text style={{ color: theme.colors.mutedText }}>
                        ({op.points})
                      </Text>
                    </Text>
                  </Pressable>
                );
              })}
            </Card>
          ))}

          <Card>
            <Title>{t("result")}</Title>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 22,
                fontWeight: "900",
              }}
            >
              {t("nihss_scoreLabel")} {total}
            </Text>

            <View
              style={{
                marginTop: 10,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                padding: 12,
                backgroundColor: "rgba(0,0,0,0.14)",
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  lineHeight: 18,
                }}
              >
                {severity}
              </Text>
            </View>
          </Card>
        </ScrollView>
      </Screen>
    </Background>
  );
}
