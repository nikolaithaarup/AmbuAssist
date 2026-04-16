import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useT } from "../../i18n/useT";
import type { ReferenceDoc } from "../../services/referenceService";
import { CollapsibleCard } from "../../ui/CollapsibleCard";
import { Card, Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";

type ABCStampSection = {
  key: string;
  titleKey: string;
  subtitleKey: string;
  options: { key: string; labelKey: string }[];
};

type Props = {
  lang: "en" | "da";
  reference: ReferenceDoc | null;
};

const sections: ABCStampSection[] = [
  {
    key: "a",
    titleKey: "abcstamp_a_title",
    subtitleKey: "abcstamp_a_sub",
    options: [
      { key: "appearance_calm", labelKey: "abcstamp_a_opt_appearance_calm" },
      {
        key: "appearance_agitated",
        labelKey: "abcstamp_a_opt_appearance_agitated",
      },
      {
        key: "appearance_dishevelled",
        labelKey: "abcstamp_a_opt_appearance_dishevelled",
      },
    ],
  },
  {
    key: "b",
    titleKey: "abcstamp_b_title",
    subtitleKey: "abcstamp_b_sub",
    options: [
      {
        key: "behaviour_cooperative",
        labelKey: "abcstamp_b_opt_behaviour_cooperative",
      },
      {
        key: "behaviour_restless",
        labelKey: "abcstamp_b_opt_behaviour_restless",
      },
      {
        key: "behaviour_aggressive",
        labelKey: "abcstamp_b_opt_behaviour_aggressive",
      },
    ],
  },
  {
    key: "c",
    titleKey: "abcstamp_c_title",
    subtitleKey: "abcstamp_c_sub",
    options: [
      {
        key: "communication_clear",
        labelKey: "abcstamp_c_opt_communication_clear",
      },
      {
        key: "communication_disorganised",
        labelKey: "abcstamp_c_opt_communication_disorganised",
      },
      {
        key: "communication_minimal",
        labelKey: "abcstamp_c_opt_communication_minimal",
      },
    ],
  },
  {
    key: "s",
    titleKey: "abcstamp_s_title",
    subtitleKey: "abcstamp_s_sub",
    options: [
      { key: "speech_normal", labelKey: "abcstamp_s_opt_speech_normal" },
      { key: "speech_pressured", labelKey: "abcstamp_s_opt_speech_pressured" },
      { key: "speech_slow", labelKey: "abcstamp_s_opt_speech_slow" },
    ],
  },
  {
    key: "t",
    titleKey: "abcstamp_t_title",
    subtitleKey: "abcstamp_t_sub",
    options: [
      { key: "thought_linear", labelKey: "abcstamp_t_opt_thought_linear" },
      { key: "thought_racing", labelKey: "abcstamp_t_opt_thought_racing" },
      {
        key: "thought_disorganised",
        labelKey: "abcstamp_t_opt_thought_disorganised",
      },
    ],
  },
  {
    key: "m",
    titleKey: "abcstamp_m_title",
    subtitleKey: "abcstamp_m_sub",
    options: [
      { key: "mood_euthymic", labelKey: "abcstamp_m_opt_mood_euthymic" },
      { key: "mood_low", labelKey: "abcstamp_m_opt_mood_low" },
      { key: "mood_elevated", labelKey: "abcstamp_m_opt_mood_elevated" },
    ],
  },
  {
    key: "p",
    titleKey: "abcstamp_p_title",
    subtitleKey: "abcstamp_p_sub",
    options: [
      { key: "perception_none", labelKey: "abcstamp_p_opt_perception_none" },
      {
        key: "perception_voices",
        labelKey: "abcstamp_p_opt_perception_voices",
      },
      { key: "perception_other", labelKey: "abcstamp_p_opt_perception_other" },
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

export default function AbcStampContent({ lang, reference }: Props) {
  const { t } = useT();
  const [selected, setSelected] = useState<Record<string, string | undefined>>(
    {},
  );

  const completedCount = useMemo(
    () => sections.filter((s) => !!selected[s.key]).length,
    [selected],
  );

  function reset() {
    setSelected({});
  }

  return (
    <>
      <Card>
        <Title>{t("abcstamp_title")}</Title>
        <Subtle>{t("abcstamp_sub")}</Subtle>
      </Card>

      {sections.map((section) => (
        <Card key={section.key}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "900",
            }}
          >
            {t(section.titleKey)}
          </Text>

          <Subtle style={{ marginTop: 4 }}>{t(section.subtitleKey)}</Subtle>

          <View style={{ gap: 8, marginTop: 10 }}>
            {section.options.map((opt) => {
              const active = selected[section.key] === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() =>
                    setSelected((prev) => ({
                      ...prev,
                      [section.key]: opt.key,
                    }))
                  }
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.colors.cardBorder,
                    padding: 12,
                    backgroundColor: active
                      ? "rgba(255,209,102,0.10)"
                      : "rgba(0,0,0,0.10)",
                  })}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "800",
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
      ))}

      <Card>
        <Title>{t("result")}</Title>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: "900",
          }}
        >
          {t("abcstamp_completedLabel")} {completedCount}/{sections.length}
        </Text>

        <View
          style={{
            marginTop: 10,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.cardBorder,
            padding: 12,
            backgroundColor: "rgba(0,0,0,0.10)",
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
            {t("abcstamp_result_text")}
          </Text>

          <Text
            style={{
              color: theme.colors.mutedText,
              fontSize: 12,
              lineHeight: 17,
            }}
          >
            {t("abcstamp_result_disclaimer")}
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
