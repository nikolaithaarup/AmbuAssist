import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useT } from "../../i18n/useT";
import type { ReferenceDoc } from "../../services/referenceService";
import { CollapsibleCard } from "../../ui/CollapsibleCard";
import { Card, Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";

type Option = { labelKey: string; points: number };
type Item = { key: string; titleKey: string; options: Option[] };

type Props = {
  lang: "en" | "da";
  reference: ReferenceDoc | null;
};

const nihssItems: Item[] = [
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

function OptionButton({
  label,
  points,
  active,
  onPress,
}: {
  label: string;
  points: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        backgroundColor: active ? "rgba(220,220,220,0.18)" : "rgba(0,0,0,0.10)",
        marginTop: 8,
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: "800",
          lineHeight: 18,
        }}
      >
        {label}{" "}
        <Text style={{ color: theme.colors.mutedText }}>({points})</Text>
      </Text>
    </Pressable>
  );
}

function ItemCard({
  item,
  t,
  selectedValue,
  onSelect,
}: {
  item: Item;
  t: (key: string) => string;
  selectedValue?: number;
  onSelect: (points: number) => void;
}) {
  return (
    <Card>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: "900",
        }}
      >
        {t(item.titleKey)}
      </Text>

      {item.options.map((op) => (
        <OptionButton
          key={op.labelKey}
          label={t(op.labelKey)}
          points={op.points}
          active={selectedValue === op.points}
          onPress={() => onSelect(op.points)}
        />
      ))}
    </Card>
  );
}

export default function NihssContent({ lang, reference }: Props) {
  const { t } = useT();
  const [selected, setSelected] = useState<Record<string, number>>({});

  const total = useMemo(
    () =>
      nihssItems.reduce(
        (sum, it) =>
          sum + (Number.isFinite(selected[it.key]) ? selected[it.key] : 0),
        0,
      ),
    [selected],
  );

  const answeredCount = useMemo(
    () => nihssItems.filter((it) => Number.isFinite(selected[it.key])).length,
    [selected],
  );

  const allAnswered = answeredCount === nihssItems.length;

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

  function reset() {
    setSelected({});
  }

  return (
    <>
      <Card>
        <Title>{t("nihss_title")}</Title>
        <Subtle>{t("nihss_sub")}</Subtle>
      </Card>

      {nihssItems.map((item) => (
        <ItemCard
          key={item.key}
          item={item}
          t={t}
          selectedValue={selected[item.key]}
          onSelect={(points) =>
            setSelected((prev) => ({ ...prev, [item.key]: points }))
          }
        />
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

        <Text
          style={{
            color: theme.colors.mutedText,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          {t("tool_answered")} {answeredCount}/{nihssItems.length}
        </Text>

        <View
          style={{
            marginTop: 10,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.cardBorder,
            padding: 12,
            backgroundColor:
              total >= 21
                ? "rgba(255,107,107,0.12)"
                : total >= 5
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
            {allAnswered ? severity : t("nihss_needAll")}
          </Text>

          <Text
            style={{
              color: theme.colors.mutedText,
              fontSize: 12,
              lineHeight: 17,
            }}
          >
            {t("nihss_result_disclaimer")}
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
            gap: 8,
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
