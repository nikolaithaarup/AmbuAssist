import type { Key } from "../../i18n/strings";
import { useT } from "../../i18n/useT";
import type { ReferenceDoc } from "../../services/referenceService";
import { classifyBvc, sumAssessmentAnswers } from "../../domain/assessments/simpleScores";
import {
  FixedChoiceAssessment,
  type FixedChoiceItem,
} from "../assessment-flow/FixedChoiceAssessment";

const definitions: readonly { id: string; labelKey: Key }[] = [
  { id: "confused", labelKey: "bvc_item_confused" },
  { id: "irritable", labelKey: "bvc_item_irritable" },
  { id: "boisterous", labelKey: "bvc_item_boisterous" },
  { id: "verbal", labelKey: "bvc_item_verbal" },
  { id: "physical", labelKey: "bvc_item_physical" },
  { id: "attacking", labelKey: "bvc_item_attacking" },
];

export default function BvcContent({ lang, reference }: { lang: "en" | "da"; reference: ReferenceDoc | null }) {
  const { t } = useT();
  const items: FixedChoiceItem<number>[] = definitions.map((item) => ({
    id: item.id,
    title: t(item.labelKey),
    choices: [
      { value: 0, label: t("no"), badge: "0" },
      { value: 1, label: t("yes"), badge: "1" },
    ],
  }));
  return (
    <FixedChoiceAssessment
      title={t("bvc_title")}
      intro={t("bvc_sub")}
      items={items}
      evaluate={(answers) => {
        const total = sumAssessmentAnswers(definitions.map((item) => item.id), answers);
        const risk = classifyBvc(total);
        return {
          score: `${t("bvc_scoreLabel")} ${total} / 6`,
          interpretation: risk === "low" ? t("bvc_low") : risk === "moderate" ? t("bvc_mod") : t("bvc_high"),
          supportingText: t("bvc_result_disclaimer"),
        };
      }}
      reference={reference}
      lang={lang}
      disclaimerTitle={t("tool_disclaimer_title")}
      sourcesTitle={t("tool_sources_title")}
    />
  );
}
