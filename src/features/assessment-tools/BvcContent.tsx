import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useT } from "../../i18n/useT";
import type { ReferenceDoc } from "../../services/referenceService";
import { CollapsibleCard } from "../../ui/CollapsibleCard";
import { Card, Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";

const items = [
  { key: "confused", labelKey: "bvc_item_confused" },
  { key: "irritable", labelKey: "bvc_item_irritable" },
  { key: "boisterous", labelKey: "bvc_item_boisterous" },
  { key: "verbal", labelKey: "bvc_item_verbal" },
  { key: "physical", labelKey: "bvc_item_physical" },
  { key: "attacking", labelKey: "bvc_item_attacking" },
] as const;

type Props = {
  lang: "en" | "da";
  reference: ReferenceDoc | null;
};

function SourceItem({
  title,
  subtitle,
  url,
}: {
  title: string;
  subtitle?: string;
  url?: string;
}) {
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

export default function BvcContent({ lang, reference }: Props) {
  const { t } = useT();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const total = useMemo(
    () => items.reduce((sum, it) => sum + (checked[it.key] ? 1 : 0), 0),
    [checked],
  );

  const risk =
    total === 0 ? t("bvc_low") : total <= 2 ? t("bvc_mod") : t("bvc_high");

  function reset() {
    setChecked({});
  }

  return (
    <>
      <Card>
        <Title>{t("bvc_title")}</Title>
        <Subtle>{t("bvc_sub")}</Subtle>
      </Card>

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
            gap: 8,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 14,
              lineHeight: 18,
            }}
          >
            {risk}
          </Text>

          <Text
            style={{
              color: theme.colors.mutedText,
              fontSize: 12,
              lineHeight: 17,
            }}
          >
            {t("bvc_result_disclaimer")}
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
        subtitle={reference?.disclaimer[lang] ?? ""}
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
            {reference?.disclaimer[lang] ?? ""}
          </Text>
        </View>
      </CollapsibleCard>

      <CollapsibleCard
        title={t("tool_sources_title")}
        subtitle={reference?.sourcesSub[lang] ?? ""}
      >
        <Subtle style={{ marginBottom: 8 }}>
          {reference?.sourcesSub[lang] ?? ""}
        </Subtle>

        <View style={{ marginTop: 4 }}>
          {(reference?.sources ?? []).map((source) => (
            <SourceItem
              key={source.id}
              title={source.title[lang]}
              subtitle={source.subtitle[lang]}
              url={source.url?.[lang]}
            />
          ))}
        </View>
      </CollapsibleCard>
    </>
  );
}
