import { useMemo } from "react";
import type { AssessmentDefinition } from "../../domain/assessment-flow/flow";
import type { ReferenceDoc } from "../../services/referenceService";
import { Card, Subtle, Title } from "../../ui/Ui";
import {
  AssessmentQuestionCard,
  AssessmentResultCard,
  type AssessmentChoice,
  getAssessmentUiLabels,
  useAssessmentFlow,
} from "./AssessmentFlow";
import { AssessmentReferenceCards } from "./AssessmentReferenceCards";

export type FixedChoiceItem<Answer> = {
  id: string;
  title: string;
  subtitle?: string;
  choices: readonly AssessmentChoice<Answer>[];
};

export type FixedChoiceResult = {
  score: string;
  interpretation: string;
  supportingText?: string;
};

export function FixedChoiceAssessment<Answer>({
  title,
  intro,
  items,
  evaluate,
  reference,
  lang,
  disclaimerTitle,
  sourcesTitle,
  footer,
}: {
  title: string;
  intro: string;
  items: readonly FixedChoiceItem<Answer>[];
  evaluate: (answers: Partial<Record<string, Answer>>) => FixedChoiceResult;
  reference: ReferenceDoc | null;
  lang: "en" | "da";
  disclaimerTitle: string;
  sourcesTitle: string;
  footer?: string;
}) {
  const ids = items.map((item) => item.id).join("|");
  const definition = useMemo<AssessmentDefinition<string, Answer>>(
    () => ({
      startStepId: items[0].id,
      steps: items.map((item, index) => ({
        id: item.id,
        next: () => items[index + 1]?.id ?? null,
      })),
    }),
    // Item labels can change with language without changing navigation.
    [ids],
  );
  const flow = useAssessmentFlow(definition);
  const current = items.find((item) => item.id === flow.currentStepId);
  const result = evaluate(flow.state.answers);

  return (
    <>
      <Card>
        <Title>{title}</Title>
        <Subtle>{intro}</Subtle>
      </Card>
      {flow.state.completed ? (
        <AssessmentResultCard
          score={result.score}
          interpretation={result.interpretation}
          supportingText={result.supportingText}
          onReview={flow.back}
          onRestart={flow.restart}
          labels={getAssessmentUiLabels(lang)}
        />
      ) : current ? (
        <AssessmentQuestionCard
          title={current.title}
          subtitle={current.subtitle}
          progress={flow.progress}
          choices={current.choices}
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
        disclaimerTitle={disclaimerTitle}
        sourcesTitle={sourcesTitle}
      />
      {footer ? <Subtle style={{ textAlign: "center" }}>{footer}</Subtle> : null}
    </>
  );
}
