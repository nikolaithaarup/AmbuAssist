import type { Key } from "../../i18n/strings";
import { useT } from "../../i18n/useT";
import type { ReferenceDoc } from "../../services/referenceService";
import { classifyNihss, sumAssessmentAnswers } from "../../domain/assessments/simpleScores";
import {
  FixedChoiceAssessment,
  type FixedChoiceItem,
} from "../assessment-flow/FixedChoiceAssessment";

type Item = { id: string; titleKey: Key; options: readonly { labelKey: Key; points: number }[] };
const option = (labelKey: Key, points: number) => ({ labelKey, points });
const itemsDefinition: readonly Item[] = [
  { id: "1a", titleKey: "nihss_1a_title", options: [option("nihss_1a_opt_alert", 0), option("nihss_1a_opt_drowsy", 1), option("nihss_1a_opt_obtunded", 2), option("nihss_1a_opt_coma", 3)] },
  { id: "1b", titleKey: "nihss_1b_title", options: [option("nihss_1b_opt_both", 0), option("nihss_1b_opt_one", 1), option("nihss_1b_opt_neither", 2)] },
  { id: "1c", titleKey: "nihss_1c_title", options: [option("nihss_1c_opt_both", 0), option("nihss_1c_opt_one", 1), option("nihss_1c_opt_neither", 2)] },
  { id: "2", titleKey: "nihss_2_title", options: [option("nihss_2_opt_normal", 0), option("nihss_2_opt_partial", 1), option("nihss_2_opt_forced", 2)] },
  { id: "3", titleKey: "nihss_3_title", options: [option("nihss_3_opt_none", 0), option("nihss_3_opt_partial", 1), option("nihss_3_opt_complete", 2), option("nihss_3_opt_bilateral", 3)] },
  { id: "4", titleKey: "nihss_4_title", options: [option("nihss_4_opt_normal", 0), option("nihss_4_opt_minor", 1), option("nihss_4_opt_partial", 2), option("nihss_4_opt_complete", 3)] },
  { id: "5L", titleKey: "nihss_5L_title", options: [option("nihss_5_opt_noDrift", 0), option("nihss_5_opt_drift", 1), option("nihss_5_opt_someEffort", 2), option("nihss_5_opt_noEffort", 3), option("nihss_5_opt_noMovement", 4)] },
  { id: "5R", titleKey: "nihss_5R_title", options: [option("nihss_5_opt_noDrift", 0), option("nihss_5_opt_drift", 1), option("nihss_5_opt_someEffort", 2), option("nihss_5_opt_noEffort", 3), option("nihss_5_opt_noMovement", 4)] },
  { id: "6L", titleKey: "nihss_6L_title", options: [option("nihss_6_opt_noDrift", 0), option("nihss_6_opt_drift", 1), option("nihss_6_opt_someEffort", 2), option("nihss_6_opt_noEffort", 3), option("nihss_6_opt_noMovement", 4)] },
  { id: "6R", titleKey: "nihss_6R_title", options: [option("nihss_6_opt_noDrift", 0), option("nihss_6_opt_drift", 1), option("nihss_6_opt_someEffort", 2), option("nihss_6_opt_noEffort", 3), option("nihss_6_opt_noMovement", 4)] },
  { id: "7", titleKey: "nihss_7_title", options: [option("nihss_7_opt_absent", 0), option("nihss_7_opt_one", 1), option("nihss_7_opt_two", 2)] },
  { id: "8", titleKey: "nihss_8_title", options: [option("nihss_8_opt_normal", 0), option("nihss_8_opt_mild", 1), option("nihss_8_opt_severe", 2)] },
  { id: "9", titleKey: "nihss_9_title", options: [option("nihss_9_opt_none", 0), option("nihss_9_opt_mild", 1), option("nihss_9_opt_severe", 2), option("nihss_9_opt_mute", 3)] },
  { id: "10", titleKey: "nihss_10_title", options: [option("nihss_10_opt_normal", 0), option("nihss_10_opt_mild", 1), option("nihss_10_opt_severe", 2)] },
  { id: "11", titleKey: "nihss_11_title", options: [option("nihss_11_opt_none", 0), option("nihss_11_opt_mild", 1), option("nihss_11_opt_severe", 2)] },
];

export default function NihssContent({ lang, reference }: { lang: "en" | "da"; reference: ReferenceDoc | null }) {
  const { t } = useT();
  const items: FixedChoiceItem<number>[] = itemsDefinition.map((item) => ({
    id: item.id,
    title: t(item.titleKey),
    choices: item.options.map((choice) => ({ value: choice.points, label: t(choice.labelKey), badge: String(choice.points) })),
  }));
  return (
    <FixedChoiceAssessment
      title={t("nihss_title")}
      intro={t("nihss_sub")}
      items={items}
      evaluate={(answers) => {
        const total = sumAssessmentAnswers(itemsDefinition.map((item) => item.id), answers);
        const severity = { none: t("nihss_noStroke"), minor: t("nihss_minor"), moderate: t("nihss_moderate"), "moderate-severe": t("nihss_modSevere"), severe: t("nihss_severe") }[classifyNihss(total)];
        return { score: `${t("nihss_scoreLabel")} ${total}`, interpretation: severity, supportingText: t("nihss_result_disclaimer") };
      }}
      reference={reference}
      lang={lang}
    />
  );
}
