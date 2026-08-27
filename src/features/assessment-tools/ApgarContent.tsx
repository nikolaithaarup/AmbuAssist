import type { Key } from "../../i18n/strings";
import { useT } from "../../i18n/useT";
import type { ReferenceDoc } from "../../services/referenceService";
import { classifyApgar, sumAssessmentAnswers } from "../../domain/assessments/simpleScores";
import {
  FixedChoiceAssessment,
  type FixedChoiceItem,
} from "../assessment-flow/FixedChoiceAssessment";

const definitions: readonly {
  id: string;
  titleKey: Key;
  options: readonly Key[];
}[] = [
  { id: "appearance", titleKey: "apgar_appearance_title", options: ["apgar_appearance_0", "apgar_appearance_1", "apgar_appearance_2"] },
  { id: "pulse", titleKey: "apgar_pulse_title", options: ["apgar_pulse_0", "apgar_pulse_1", "apgar_pulse_2"] },
  { id: "grimace", titleKey: "apgar_grimace_title", options: ["apgar_grimace_0", "apgar_grimace_1", "apgar_grimace_2"] },
  { id: "activity", titleKey: "apgar_activity_title", options: ["apgar_activity_0", "apgar_activity_1", "apgar_activity_2"] },
  { id: "respiration", titleKey: "apgar_respiration_title", options: ["apgar_respiration_0", "apgar_respiration_1", "apgar_respiration_2"] },
];

export default function ApgarContent({ lang, reference }: { lang: "en" | "da"; reference: ReferenceDoc | null }) {
  const { t } = useT();
  const items: FixedChoiceItem<number>[] = definitions.map((item) => ({
    id: item.id,
    title: t(item.titleKey),
    choices: item.options.map((labelKey, points) => ({
      value: points,
      label: t(labelKey),
      badge: String(points),
    })),
  }));
  return (
    <FixedChoiceAssessment
      title={t("apgar_title")}
      intro={t("apgar_sub")}
      items={items}
      evaluate={(answers) => {
        const total = sumAssessmentAnswers(definitions.map((item) => item.id), answers);
        const interpretationKey = { ok: "apgar_interp_ok", moderate: "apgar_interp_mod", critical: "apgar_interp_crit" }[classifyApgar(total)] as Key;
        return {
          score: `${t("apgar_scoreLabel")} ${total} / 10`,
          interpretation: t(interpretationKey),
          supportingText: t("apgar_result_disclaimer"),
        };
      }}
      reference={reference}
      lang={lang}
      footer={t("apgar_disclaimer")}
    />
  );
}
