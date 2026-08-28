import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useT } from "../../../src/i18n/useT";
import type { Key } from "../../../src/i18n/strings";
import {
  getReference,
  type ReferenceDoc,
} from "../../../src/services/referenceService";
import { useSettings } from "../../../src/state/settings";
import { Background } from "../../../src/ui/Background";
import { ClinicalDisclosure } from "../../../src/ui/ClinicalDisclosure";
import { Screen, Subtle } from "../../../src/ui/Ui";
import { theme } from "../../../src/ui/theme";
import { ToolPageHeader, ToolSurface } from "../../../src/ui/ToolSurface";
import type { AssessmentDefinition } from "../../../src/domain/assessment-flow/flow";
import {
  AssessmentQuestionCard,
  AssessmentResultCard,
  getAssessmentUiLabels,
  useAssessmentFlow,
} from "../../../src/features/assessment-flow/AssessmentFlow";
import { getSpinalTraumaTransition, isSpinalTraumaStep } from "../../../src/domain/assessments/spinalTrauma";

type AnswerKey = "yes" | "no";
type StepId = "penetrating" | "critical" | "tenderOrNeuro";
type OutcomeId = "none" | "spinal" | "timeCritical";

type Step = {
  id: StepId;
  titleKey: Key;
  questionKey: Key;
  noteKey?: Key;
  yesNext?: StepId | OutcomeId;
  noNext?: StepId | OutcomeId;
};

type Selection = { stepId: StepId; answer: AnswerKey };

const steps: Step[] = [
  {
    id: "penetrating",
    titleKey: "spine_step1_title",
    questionKey: "spine_step1_q",
    noteKey: "spine_step1_note",
    yesNext: "none",
    noNext: "critical",
  },
  {
    id: "critical",
    titleKey: "spine_step2_title",
    questionKey: "spine_step2_q",
    noteKey: "spine_step2_note",
    yesNext: "timeCritical",
    noNext: "tenderOrNeuro",
  },
  {
    id: "tenderOrNeuro",
    titleKey: "spine_step3_title",
    questionKey: "spine_step3_q",
    noteKey: "spine_step3_note",
    yesNext: "spinal",
    noNext: "none",
  },
];

const flowDefinition: AssessmentDefinition<StepId, AnswerKey> = {
  startStepId: "penetrating",
  steps: steps.map((step) => ({
    id: step.id,
    next: (answer) => {
      const next = getSpinalTraumaTransition(step.id, answer);
      return isSpinalTraumaStep(next) ? next : null;
    },
  })),
  totalSteps: (answers) => {
    if (answers.penetrating === "yes") return 1;
    if (answers.critical === "yes") return 2;
    return 3;
  },
};

function outcomeFromSelections(selections: Selection[]): OutcomeId | null {
  let current: StepId | OutcomeId = "penetrating";
  const selMap = new Map<StepId, AnswerKey>();
  selections.forEach((s) => selMap.set(s.stepId, s.answer));

  for (let i = 0; i < 10; i++) {
    if (
      current === "none" ||
      current === "spinal" ||
      current === "timeCritical"
    ) {
      return current;
    }

    const step = steps.find((s) => s.id === current);
    if (!step) return null;

    const ans = selMap.get(step.id);
    if (!ans) return null;

    current =
      ans === "yes"
        ? (step.yesNext as StepId | OutcomeId)
        : (step.noNext as StepId | OutcomeId);
  }

  return null;
}

export default function SpinalTraumaFlow() {
  const { t } = useT();
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";

  const [reference, setReference] = useState<ReferenceDoc | null>(null);
  const flow = useAssessmentFlow(flowDefinition);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReference() {
      try {
        const data = await getReference("spine");
        if (!active) return;
        setReference(data);
      } catch (error) {
        console.error("Failed to load spine reference:", error);
        if (!active) return;
        setReference(null);
      }
    }

    loadReference();

    return () => {
      active = false;
    };
  }, []);

  const selections = flow.state.path.flatMap((stepId) => {
    const answer = flow.state.answers[stepId];
    return answer ? [{ stepId, answer }] : [];
  });
  const currentStepId = flow.currentStepId;

  const currentStep = useMemo(
    () => (currentStepId ? steps.find((s) => s.id === currentStepId) : null),
    [currentStepId],
  );

  const outcome = useMemo(
    () => outcomeFromSelections(selections),
    [selections],
  );

  const disclaimerText = reference?.disclaimer?.[lang] ?? "";
  const sourcesSubText = reference?.sourcesSub?.[lang] ?? "";
  const labels = getAssessmentUiLabels(lang);
  const outcomeTitle = outcome === "none"
    ? t("spine_outcome_none_title")
    : outcome === "spinal"
      ? t("spine_outcome_spinal_title")
      : t("spine_outcome_time_title");
  const outcomeBody = outcome === "none"
    ? t("spine_outcome_none_body")
    : outcome === "spinal"
      ? t("spine_outcome_spinal_body")
      : t("spine_outcome_time_body");
  const outcomePractical = outcome === "none"
    ? t("spine_outcome_none_practical")
    : outcome === "spinal"
      ? t("spine_outcome_spinal_practical")
      : t("spine_outcome_time_practical");

  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <ToolPageHeader title={t("spine_title")} subtitle={t("spine_sub")} />

          <ToolSurface style={{ paddingVertical: 4 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("spine_info_title")}
              accessibilityState={{ expanded: showInfo }}
              onPress={() => setShowInfo((current) => !current)}
              style={({ pressed }) => ({ minHeight: 52, flexDirection: "row", alignItems: "center", gap: 12, opacity: pressed ? 0.72 : 1 })}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 15 }}>{t("spine_info_title")}</Text>
                {!showInfo ? <Subtle>{t("spine_info_hint")}</Subtle> : null}
              </View>
              <Text accessibilityElementsHidden style={{ color: theme.colors.accentMuted, fontSize: 20 }}>{showInfo ? "⌄" : "›"}</Text>
            </Pressable>
            {showInfo ? (
              <View style={{ gap: 9, paddingBottom: 10 }}>
                <Text style={{ color: theme.colors.text, lineHeight: 20 }}>{t("spine_info_trauma")}</Text>
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{t("spine_info_abc_title")}</Text>
                <Subtle>{t("spine_info_abc")}</Subtle>
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{t("spine_info_tender_title")}</Text>
                <Subtle>{t("spine_info_tender")}</Subtle>
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{t("spine_info_neuro_title")}</Text>
                <Subtle>{t("spine_info_neuro")}</Subtle>
              </View>
            ) : null}
          </ToolSurface>

          {flow.state.completed && outcome ? (
            <AssessmentResultCard
              title={t("spine_result")}
              score={outcomeTitle}
              interpretation={outcomeBody}
              supportingText={`${outcomePractical}\n\n${t("spine_result_disclaimer")}`}
              onReview={flow.back}
              onRestart={() => {
                flow.restart();
                setShowInfo(false);
              }}
              labels={labels}
            />
          ) : currentStep ? (
            <AssessmentQuestionCard
              title={t(currentStep.questionKey)}
              subtitle={`${t(currentStep.titleKey)}${currentStep.noteKey ? ` · ${t(currentStep.noteKey)}` : ""}`}
              progress={flow.progress}
              choices={[
                { label: t("yes"), value: "yes" as const },
                { label: t("no"), value: "no" as const },
              ]}
              selected={flow.state.answers[currentStep.id]}
              onSelect={(answer) => flow.answer(currentStep.id, answer)}
              onBack={flow.back}
              canGoBack={flow.state.position > 0}
              labels={labels}
            />
          ) : null}

          <ClinicalDisclosure
            disclaimer={disclaimerText}
            sourcesIntro={sourcesSubText}
            sources={(reference?.sources ?? []).map((source) => ({
              id: source.id,
              title: source.title?.[lang] ?? source.title?.en ?? "",
              subtitle: source.subtitle?.[lang] ?? source.subtitle?.en ?? "",
              url: source.url?.[lang] ?? source.url?.en,
            }))}
          />

          <Subtle style={{ textAlign: "center", marginTop: 2 }}>
            {t("spine_disclaimer")}
          </Subtle>
        </ScrollView>
      </Screen>
    </Background>
  );
}
