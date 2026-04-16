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

const pressPart1Items: Item[] = [
  {
    key: "p1_face",
    titleKey: "press_p1_face_title",
    options: [
      { labelKey: "press_opt_no", points: 0 },
      { labelKey: "press_opt_yes", points: 1 },
    ],
  },
  {
    key: "p1_arm",
    titleKey: "press_p1_arm_title",
    options: [
      { labelKey: "press_opt_no", points: 0 },
      { labelKey: "press_opt_yes", points: 1 },
    ],
  },
  {
    key: "p1_speech",
    titleKey: "press_p1_speech_title",
    options: [
      { labelKey: "press_opt_no", points: 0 },
      { labelKey: "press_opt_yes", points: 1 },
    ],
  },
  {
    key: "p1_other",
    titleKey: "press_p1_other_title",
    options: [
      { labelKey: "press_opt_no", points: 0 },
      { labelKey: "press_opt_yes", points: 1 },
    ],
  },
];

const pressPart2Items: Item[] = [
  {
    key: "p2_armDrift",
    titleKey: "press_p2_armDrift_title",
    options: [
      { labelKey: "press_opt_no", points: 0 },
      { labelKey: "press_opt_yes", points: 1 },
    ],
  },
  {
    key: "p2_loc",
    titleKey: "press_p2_loc_title",
    options: [
      { labelKey: "press_opt_no", points: 0 },
      { labelKey: "press_opt_yes", points: 1 },
    ],
  },
  {
    key: "p2_gaze",
    titleKey: "press_p2_gaze_title",
    options: [
      { labelKey: "press_opt_no", points: 0 },
      { labelKey: "press_opt_yes", points: 1 },
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

export default function PressContent({ lang, reference }: Props) {
  const { t } = useT();
  const [selected, setSelected] = useState<Record<string, number>>({});

  const part1Score = useMemo(
    () =>
      pressPart1Items.reduce(
        (sum, it) =>
          sum + (Number.isFinite(selected[it.key]) ? selected[it.key] : 0),
        0,
      ),
    [selected],
  );

  const part2Score = useMemo(
    () =>
      pressPart2Items.reduce(
        (sum, it) =>
          sum + (Number.isFinite(selected[it.key]) ? selected[it.key] : 0),
        0,
      ),
    [selected],
  );

  const answeredCount = useMemo(
    () =>
      [...pressPart1Items, ...pressPart2Items].filter((it) =>
        Number.isFinite(selected[it.key]),
      ).length,
    [selected],
  );

  const totalItems = pressPart1Items.length + pressPart2Items.length;
  const allAnswered = answeredCount === totalItems;
  const part1Positive = part1Score >= 1;

  function reset() {
    setSelected({});
  }

  return (
    <>
      <Card>
        <Title>{t("press_title")}</Title>
        <Subtle>{t("press_sub")}</Subtle>
      </Card>

      <Card>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: "900",
          }}
        >
          {t("press_part1_title")}
        </Text>
        <Subtle>{t("press_part1_sub")}</Subtle>
      </Card>

      {pressPart1Items.map((item) => (
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
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: "900",
          }}
        >
          {t("press_part2_title")}
        </Text>
        <Subtle>{t("press_part2_sub")}</Subtle>
      </Card>

      {pressPart2Items.map((item) => (
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
            fontSize: 20,
            fontWeight: "900",
          }}
        >
          {t("press_part1_score")} {part1Score}
        </Text>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 20,
            fontWeight: "900",
            marginTop: 6,
          }}
        >
          {t("press_part2_score")} {part2Score}
        </Text>

        <Text
          style={{
            color: theme.colors.mutedText,
            fontSize: 12,
            marginTop: 6,
          }}
        >
          {t("tool_answered")} {answeredCount}/{totalItems}
        </Text>

        <View
          style={{
            marginTop: 10,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.cardBorder,
            padding: 12,
            backgroundColor: part1Positive
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
            {allAnswered
              ? part1Positive
                ? t("press_part1_positive")
                : t("press_part1_negative")
              : t("press_needAll")}
          </Text>

          <Text
            style={{
              color: theme.colors.mutedText,
              fontSize: 12,
              lineHeight: 17,
            }}
          >
            {t("press_result_disclaimer")}
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
