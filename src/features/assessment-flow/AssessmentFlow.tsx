import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  answerAssessmentStep,
  createAssessmentFlowState,
  getAssessmentProgress,
  getCurrentAssessmentStepId,
  goBackInAssessment,
  restartAssessment,
  type AssessmentDefinition,
  type AssessmentFlowState,
} from "../../domain/assessment-flow/flow";
import { Card, Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";
import { hapticReset, hapticToolOpen } from "../../ui/haptics";

export type AssessmentChoice<Answer> = {
  value: Answer;
  label: string;
  detail?: string;
  badge?: string;
};

export type AssessmentUiLabels = {
  step: (current: number, total: number) => string;
  back: string;
  result: string;
  review: string;
  restart: string;
};

export function getAssessmentUiLabels(lang: "en" | "da"): AssessmentUiLabels {
  return lang === "da"
    ? { step: (current, total) => `Trin ${current} af ${total}`, back: "Tilbage", result: "Resultat", review: "Gennemgå svar", restart: "Start forfra" }
    : { step: (current, total) => `Step ${current} of ${total}`, back: "Back", result: "Result", review: "Review answers", restart: "Restart" };
}

export function useAssessmentFlow<StepId extends string, Answer>(
  definition: AssessmentDefinition<StepId, Answer>,
) {
  const [state, setState] = useState<AssessmentFlowState<StepId, Answer>>(() =>
    createAssessmentFlowState(definition),
  );

  const answer = useCallback(
    (stepId: StepId, value: Answer) => {
      setState((current) => answerAssessmentStep(definition, current, stepId, value));
      hapticToolOpen();
    },
    [definition],
  );
  const back = useCallback(() => setState(goBackInAssessment), []);
  const restart = useCallback(() => {
    hapticReset();
    setState(restartAssessment(definition));
  }, [definition]);

  return {
    state,
    currentStepId: getCurrentAssessmentStepId(state),
    progress: getAssessmentProgress(definition, state),
    answer,
    back,
    restart,
  };
}

export function AssessmentQuestionCard<Answer>({
  title,
  subtitle,
  progress,
  choices,
  selected,
  onSelect,
  onBack,
  canGoBack,
  labels = getAssessmentUiLabels("da"),
}: {
  title: string;
  subtitle?: string;
  progress: { current: number; total: number };
  choices: readonly AssessmentChoice<Answer>[];
  selected: Answer | undefined;
  onSelect: (answer: Answer) => void;
  onBack: () => void;
  canGoBack: boolean;
  labels?: AssessmentUiLabels;
}) {
  return (
    <Card>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <Subtle>{labels.step(progress.current, progress.total)}</Subtle>
        <Subtle>{Math.round((progress.current / progress.total) * 100)}%</Subtle>
      </View>
      <View style={{ height: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${(progress.current / progress.total) * 100}%`, backgroundColor: theme.colors.accent }} />
      </View>
      <Title style={{ fontSize: 22, lineHeight: 29 }}>{title}</Title>
      {subtitle ? <Subtle style={{ fontSize: 14, lineHeight: 20 }}>{subtitle}</Subtle> : null}
      <View style={{ gap: 10, marginTop: 4 }}>
        {choices.map((choice, index) => {
          const active = Object.is(choice.value, selected);
          return (
            <Pressable
              key={`${choice.label}-${index}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={choice.detail ? `${choice.label}. ${choice.detail}` : choice.label}
              onPress={() => onSelect(choice.value)}
              style={({ pressed }) => ({
                minHeight: 54,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: active ? theme.colors.accent : theme.colors.cardBorder,
                backgroundColor: active ? theme.colors.accentSurface : "rgba(0,0,0,0.10)",
                paddingHorizontal: 14,
                paddingVertical: 13,
                opacity: pressed ? 0.72 : 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              })}
            >
              {choice.badge ? (
                <View style={{ minWidth: 28, height: 28, borderRadius: 9, borderWidth: 1, borderColor: theme.colors.cardBorder, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{choice.badge}</Text>
                </View>
              ) : null}
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 15, lineHeight: 21 }}>{choice.label}</Text>
                {choice.detail ? <Subtle>{choice.detail}</Subtle> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {canGoBack ? (
        <Pressable accessibilityRole="button" accessibilityLabel={labels.back} onPress={onBack} style={({ pressed }) => ({ minHeight: 48, justifyContent: "center", alignItems: "center", opacity: pressed ? 0.65 : 1 })}>
          <Text style={{ color: theme.colors.accentMuted, fontWeight: "900" }}>← {labels.back}</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

export function AssessmentResultCard({
  title,
  score,
  interpretation,
  supportingText,
  onReview,
  onRestart,
  labels = getAssessmentUiLabels("da"),
}: {
  title?: string;
  score: string;
  interpretation: string;
  supportingText?: string;
  onReview: () => void;
  onRestart: () => void;
  labels?: AssessmentUiLabels;
}) {
  return (
    <Card>
      <Title style={{ fontSize: 19 }}>{title ?? labels.result}</Title>
      <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900", lineHeight: 34 }}>{score}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 22 }}>{interpretation}</Text>
      {supportingText ? <Subtle>{supportingText}</Subtle> : null}
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        <Pressable accessibilityRole="button" onPress={onReview} style={({ pressed }) => ({ minHeight: 50, flexGrow: 1, flexBasis: "45%", borderRadius: 14, borderWidth: 1, borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.accentSurface, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
          <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{labels.review}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onRestart} style={({ pressed }) => ({ minHeight: 50, flexGrow: 1, flexBasis: "45%", borderRadius: 14, borderWidth: 1, borderColor: theme.colors.cardBorder, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
          <Text style={{ color: theme.colors.accentMuted, fontWeight: "900" }}>{labels.restart}</Text>
        </Pressable>
      </View>
    </Card>
  );
}
