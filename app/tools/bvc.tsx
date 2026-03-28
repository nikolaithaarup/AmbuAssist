// app/tools/bvc.tsx
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useT } from "../../src/i18n/useT";
import { Background } from "../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";

const items = [
  { key: "confused", labelKey: "bvc_item_confused" },
  { key: "irritable", labelKey: "bvc_item_irritable" },
  { key: "boisterous", labelKey: "bvc_item_boisterous" },
  { key: "verbal", labelKey: "bvc_item_verbal" },
  { key: "physical", labelKey: "bvc_item_physical" },
  { key: "attacking", labelKey: "bvc_item_attacking" },
] as const;

export default function BVC() {
  const { t } = useT();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const total = useMemo(
    () => items.reduce((sum, it) => sum + (checked[it.key] ? 1 : 0), 0),
    [checked]
  );

  const risk =
    total === 0 ? t("bvc_low") : total <= 2 ? t("bvc_mod") : t("bvc_high");

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("bvc_title")}</Title>
          <Subtle>{t("bvc_sub")}</Subtle>
        </View>

        <Card>
          {items.map((it) => {
            const on = !!checked[it.key];
            return (
              <Pressable
                key={it.key}
                onPress={() =>
                  setChecked((p) => ({ ...p, [it.key]: !p[it.key] }))
                }
                style={{
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "flex-start",
                  paddingVertical: 10,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    marginTop: 1,
                    borderWidth: 1,
                    borderColor: theme.colors.cardBorder,
                    backgroundColor: on
                      ? "rgba(255,209,102,0.25)"
                      : "transparent",
                  }}
                />
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 15,
                    fontWeight: "800",
                    flex: 1,
                  }}
                >
                  {t(it.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </Card>

        <Card>
          <Title>{t("result")}</Title>

          <Text
            style={{
              color: theme.colors.text,
              fontSize: 22,
              fontWeight: "900",
            }}
          >
            {t("bvc_scoreLabel")} {total} / 6
          </Text>

          <View
            style={{
              marginTop: 10,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
              padding: 12,
              backgroundColor:
                total >= 3
                  ? "rgba(255,107,107,0.12)"
                  : total >= 1
                  ? "rgba(255,209,102,0.12)"
                  : "rgba(140,233,154,0.10)",
            }}
          >
            <Text
              style={{ color: theme.colors.text, fontSize: 14, lineHeight: 18 }}
            >
              {risk}
            </Text>

            <Text
              style={{
                color: theme.colors.mutedText,
                fontSize: 12,
                marginTop: 8,
              }}
            >
              {t("clinicalReminder")}
            </Text>
          </View>
        </Card>
      </Screen>
    </Background>
  );
}
