import { useMemo } from "react";
import type { AssessmentDefinition } from "../../domain/assessment-flow/flow";
import {
  calculatePressResult,
  type PressItemId,
} from "../../domain/assessments/press";
import type { Key } from "../../i18n/strings";
import { useT } from "../../i18n/useT";
import type { ReferenceDoc } from "../../services/referenceService";
import { Card, Subtle, Title } from "../../ui/Ui";
import {
  AssessmentQuestionCard,
  AssessmentResultCard,
  getAssessmentUiLabels,
  useAssessmentFlow,
} from "../assessment-flow/AssessmentFlow";
import { AssessmentReferenceCards } from "../assessment-flow/AssessmentReferenceCards";

type Item = { id: PressItemId; titleKey: Key; part: 1 | 2 };
const items: readonly Item[] = [
  { id: "p1_face", titleKey: "press_p1_face_title", part: 1 },
  { id: "p1_arm", titleKey: "press_p1_arm_title", part: 1 },
  { id: "p1_speech", titleKey: "press_p1_speech_title", part: 1 },
  { id: "p1_other", titleKey: "press_p1_other_title", part: 1 },
  { id: "p2_armDrift", titleKey: "press_p2_armDrift_title", part: 2 },
  { id: "p2_loc", titleKey: "press_p2_loc_title", part: 2 },
  { id: "p2_gaze", titleKey: "press_p2_gaze_title", part: 2 },
];

const definition: AssessmentDefinition<PressItemId, number> = {
  startStepId: items[0].id,
  steps: items.map((item, index) => ({
    id: item.id,
    next: () => items[index + 1]?.id ?? null,
  })),
};

export default function PressContent({ lang, reference }: {
  lang: "en" | "da";
  reference: ReferenceDoc | null;
}) {
  const { t } = useT();
  const flow = useAssessmentFlow(definition);
  const current = items.find((item) => item.id === flow.currentStepId);
  const result = useMemo(
    () => calculatePressResult(flow.state.answers),
    [flow.state.answers],
  );

  return (
    <>
      <Card>
        <Title>{t("press_title")}</Title>
        <Subtle>{t("press_sub")}</Subtle>
      </Card>
      {flow.state.completed ? (
        <AssessmentResultCard
          score={`${t("press_part1_score")} ${result.part1Score} · ${t("press_part2_score")} ${result.part2Score}`}
          interpretation={
            result.part1Positive
              ? t("press_part1_positive")
              : t("press_part1_negative")
          }
          supportingText={t("press_result_disclaimer")}
          onReview={flow.back}
          onRestart={flow.restart}
          labels={getAssessmentUiLabels(lang)}
        />
      ) : current ? (
        <AssessmentQuestionCard
          title={t(current.titleKey)}
          subtitle={
            current.part === 1
              ? `${t("press_part1_title")} · ${t("press_part1_sub")}`
              : `${t("press_part2_title")} · ${t("press_part2_sub")}`
          }
          progress={flow.progress}
          choices={[
            { value: 0, label: t("press_opt_no"), badge: "0" },
            { value: 1, label: t("press_opt_yes"), badge: "1" },
          ]}
          selected={flow.state.answers[current.id]}
          onSelect={(answer) => flow.answer(current.id, answer)}
          onBack={flow.back}
          canGoBack={flow.state.position > 0}
          labels={getAssessmentUiLabels(lang)}
        />
      ) : null}
      <AssessmentReferenceCards
        reference={reference}
        lang={lang}
        disclaimerTitle={t("tool_disclaimer_title")}
        sourcesTitle={t("tool_sources_title")}
      />
    </>
  );
}
