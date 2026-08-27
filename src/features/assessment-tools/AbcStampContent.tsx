import type { Key } from "../../i18n/strings";
import { useT } from "../../i18n/useT";
import type { ReferenceDoc } from "../../services/referenceService";
import {
  FixedChoiceAssessment,
  type FixedChoiceItem,
} from "../assessment-flow/FixedChoiceAssessment";

const sections: readonly {
  id: string;
  titleKey: Key;
  subtitleKey: Key;
  options: readonly { value: string; labelKey: Key }[];
}[] = [
  { id: "a", titleKey: "abcstamp_a_title", subtitleKey: "abcstamp_a_sub", options: [
    { value: "appearance_calm", labelKey: "abcstamp_a_opt_appearance_calm" },
    { value: "appearance_agitated", labelKey: "abcstamp_a_opt_appearance_agitated" },
    { value: "appearance_dishevelled", labelKey: "abcstamp_a_opt_appearance_dishevelled" },
  ] },
  { id: "b", titleKey: "abcstamp_b_title", subtitleKey: "abcstamp_b_sub", options: [
    { value: "behaviour_cooperative", labelKey: "abcstamp_b_opt_behaviour_cooperative" },
    { value: "behaviour_restless", labelKey: "abcstamp_b_opt_behaviour_restless" },
    { value: "behaviour_aggressive", labelKey: "abcstamp_b_opt_behaviour_aggressive" },
  ] },
  { id: "c", titleKey: "abcstamp_c_title", subtitleKey: "abcstamp_c_sub", options: [
    { value: "communication_clear", labelKey: "abcstamp_c_opt_communication_clear" },
    { value: "communication_disorganised", labelKey: "abcstamp_c_opt_communication_disorganised" },
    { value: "communication_minimal", labelKey: "abcstamp_c_opt_communication_minimal" },
  ] },
  { id: "s", titleKey: "abcstamp_s_title", subtitleKey: "abcstamp_s_sub", options: [
    { value: "speech_normal", labelKey: "abcstamp_s_opt_speech_normal" },
    { value: "speech_pressured", labelKey: "abcstamp_s_opt_speech_pressured" },
    { value: "speech_slow", labelKey: "abcstamp_s_opt_speech_slow" },
  ] },
  { id: "t", titleKey: "abcstamp_t_title", subtitleKey: "abcstamp_t_sub", options: [
    { value: "thought_linear", labelKey: "abcstamp_t_opt_thought_linear" },
    { value: "thought_racing", labelKey: "abcstamp_t_opt_thought_racing" },
    { value: "thought_disorganised", labelKey: "abcstamp_t_opt_thought_disorganised" },
  ] },
  { id: "m", titleKey: "abcstamp_m_title", subtitleKey: "abcstamp_m_sub", options: [
    { value: "mood_euthymic", labelKey: "abcstamp_m_opt_mood_euthymic" },
    { value: "mood_low", labelKey: "abcstamp_m_opt_mood_low" },
    { value: "mood_elevated", labelKey: "abcstamp_m_opt_mood_elevated" },
  ] },
  { id: "p", titleKey: "abcstamp_p_title", subtitleKey: "abcstamp_p_sub", options: [
    { value: "perception_none", labelKey: "abcstamp_p_opt_perception_none" },
    { value: "perception_voices", labelKey: "abcstamp_p_opt_perception_voices" },
    { value: "perception_other", labelKey: "abcstamp_p_opt_perception_other" },
  ] },
];

export default function AbcStampContent({ lang, reference }: { lang: "en" | "da"; reference: ReferenceDoc | null }) {
  const { t } = useT();
  const items: FixedChoiceItem<string>[] = sections.map((section) => ({
    id: section.id,
    title: t(section.titleKey),
    subtitle: t(section.subtitleKey),
    choices: section.options.map((option) => ({ value: option.value, label: t(option.labelKey) })),
  }));
  return (
    <FixedChoiceAssessment
      title={t("abcstamp_title")}
      intro={t("abcstamp_sub")}
      items={items}
      evaluate={() => ({
        score: `${t("abcstamp_completedLabel")} 7/7`,
        interpretation: t("abcstamp_result_text"),
        supportingText: t("abcstamp_result_disclaimer"),
      })}
      reference={reference}
      lang={lang}
    />
  );
}
