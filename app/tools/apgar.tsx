// app/tools/apgar.tsx
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../src/i18n/useT";
import { Background } from "../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";

type ApgarKey = "appearance" | "pulse" | "grimace" | "activity" | "respiration";

type ApgarOption = {
  points: 0 | 1 | 2;
  labelKey: string;
};

type ApgarItem = {
  key: ApgarKey;
  titleKey: string;
  options: ApgarOption[];
};

const items: ApgarItem[] = [
  {
    key: "appearance",
    titleKey: "apgar_appearance_title",
    options: [
      { points: 0, labelKey: "apgar_appearance_0" },
      { points: 1, labelKey: "apgar_appearance_1" },
      { points: 2, labelKey: "apgar_appearance_2" },
    ],
  },
  {
    key: "pulse",
    titleKey: "apgar_pulse_title",
    options: [
      { points: 0, labelKey: "apgar_pulse_0" },
      { points: 1, labelKey: "apgar_pulse_1" },
      { points: 2, labelKey: "apgar_pulse_2" },
    ],
  },
  {
    key: "grimace",
    titleKey: "apgar_grimace_title",
    options: [
      { points: 0, labelKey: "apgar_grimace_0" },
      { points: 1, labelKey: "apgar_grimace_1" },
      { points: 2, labelKey: "apgar_grimace_2" },
    ],
  },
  {
    key: "activity",
    titleKey: "apgar_activity_title",
    options: [
      { points: 0, labelKey: "apgar_activity_0" },
      { points: 1, labelKey: "apgar_activity_1" },
      { points: 2, labelKey: "apgar_activity_2" },
    ],
  },
  {
    key: "respiration",
    titleKey: "apgar_respiration_title",
    options: [
      { points: 0, labelKey: "apgar_respiration_0" },
      { points: 1, labelKey: "apgar_respiration_1" },
      { points: 2, labelKey: "apgar_respiration_2" },
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

export default function APGAR() {
  const { t } = useT();

  const [selected, setSelected] = useState<
    Partial<Record<ApgarKey, 0 | 1 | 2>>
  >({});

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + (selected[it.key] ?? 0), 0);
  }, [selected]);

  const allAnswered = useMemo(() => {
    return items.every((it) => selected[it.key] !== undefined);
  }, [selected]);

  const interpretationKey =
    total >= 7
      ? "apgar_interp_ok"
      : total >= 4
        ? "apgar_interp_mod"
        : "apgar_interp_crit";

  function reset() {
    setSelected({});
  }

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("apgar_title")}</Title>
          <Subtle>{t("apgar_sub")}</Subtle>
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
              {t("apgar_scoreLabel")} {total} / 10
            </Text>

            <View
              style={{
                marginTop: 10,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                padding: 12,
                backgroundColor:
                  total <= 3
                    ? "rgba(255,107,107,0.12)"
                    : total <= 6
                      ? "rgba(255,209,102,0.12)"
                      : "rgba(140,233,154,0.10)",
                gap: 8,
              }}
            >
              <Text style={{ color: theme.colors.text, lineHeight: 18 }}>
                {allAnswered ? t(interpretationKey) : t("apgar_needAll")}
              </Text>

              <Text
                style={{
                  color: theme.colors.mutedText,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {t("clinicalReminder")}
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

          <Subtle style={{ textAlign: "center" }}>
            {t("apgar_disclaimer")}
          </Subtle>
        </ScrollView>
      </Screen>
    </Background>
  );
}
