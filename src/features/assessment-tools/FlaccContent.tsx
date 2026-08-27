import type { Key } from "../../i18n/strings";
import { useT } from "../../i18n/useT";
import type { ReferenceDoc } from "../../services/referenceService";
import { classifyFlacc, sumAssessmentAnswers } from "../../domain/assessments/simpleScores";
import {
  FixedChoiceAssessment,
  type FixedChoiceItem,
} from "../assessment-flow/FixedChoiceAssessment";

const definitions: readonly { id: string; titleKey: Key; options: readonly Key[] }[] = [
  { id: "face", titleKey: "flacc_face_title", options: ["flacc_face_0", "flacc_face_1", "flacc_face_2"] },
  { id: "legs", titleKey: "flacc_legs_title", options: ["flacc_legs_0", "flacc_legs_1", "flacc_legs_2"] },
  { id: "activity", titleKey: "flacc_activity_title", options: ["flacc_activity_0", "flacc_activity_1", "flacc_activity_2"] },
  { id: "cry", titleKey: "flacc_cry_title", options: ["flacc_cry_0", "flacc_cry_1", "flacc_cry_2"] },
  { id: "consolability", titleKey: "flacc_consolability_title", options: ["flacc_consolability_0", "flacc_consolability_1", "flacc_consolability_2"] },
];

export default function FlaccContent({ lang, reference }: { lang: "en" | "da"; reference: ReferenceDoc | null }) {
  const { t } = useT();
  const items: FixedChoiceItem<number>[] = definitions.map((item) => ({
    id: item.id,
    title: t(item.titleKey),
    choices: item.options.map((labelKey, points) => ({ value: points, label: t(labelKey), badge: String(points) })),
  }));
  return (
    <FixedChoiceAssessment
      title={t("flacc_title")}
      intro={t("flacc_sub")}
      items={items}
      evaluate={(answers) => {
        const total = sumAssessmentAnswers(definitions.map((item) => item.id), answers);
        const severityKey = { none: "flacc_severity_0", mild: "flacc_severity_mild", moderate: "flacc_severity_mod", severe: "flacc_severity_severe" }[classifyFlacc(total)] as Key;
        return {
          score: `${t("flacc_scoreLabel")} ${total} / 10`,
          interpretation: t(severityKey),
          supportingText: t("flacc_result_disclaimer"),
        };
      }}
      reference={reference}
      lang={lang}
      footer={t("flacc_disclaimer")}
    />
  );
}
