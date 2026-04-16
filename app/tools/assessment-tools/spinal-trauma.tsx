import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../../src/i18n/useT";
import { useSettings } from "../../../src/state/settings";
import {
  getReference,
  type ReferenceDoc,
} from "../../../src/services/referenceService";
import { Background } from "../../../src/ui/Background";
import { CollapsibleCard } from "../../../src/ui/CollapsibleCard";
import { Card, Screen, Subtle, Title } from "../../../src/ui/Ui";
import { theme } from "../../../src/ui/theme";

type AnswerKey = "yes" | "no";
type StepId = "penetrating" | "critical" | "tenderOrNeuro";
type OutcomeId = "none" | "spinal" | "timeCritical";

type Step = {
  id: StepId;
  titleKey: string;
  questionKey: string;
  noteKey?: string;
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

export default function SpinalTraumaFlow() {
  const { t } = useT();
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";

  const [reference, setReference] = useState<ReferenceDoc | null>(null);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReference() {
      const data = await getReference("spine");
      if (!active) return;
      setReference(data);
    }

    loadReference();

    return () => {
      active = false;
    };
  }, []);

  const currentStepId: StepId | null = useMemo(() => {
    let current: StepId | OutcomeId = "penetrating";

    const selMap = new Map<StepId, AnswerKey>();
    selections.forEach((s) => selMap.set(s.stepId, s.answer));

    for (let i = 0; i < 10; i++) {
      if (
        current === "none" ||
        current === "spinal" ||
        current === "timeCritical"
      ) {
        return null;
      }

      const step = steps.find((s) => s.id === current);
      if (!step) return null;

      const ans = selMap.get(step.id);
      if (!ans) return step.id;

      current =
        ans === "yes"
          ? (step.yesNext as StepId | OutcomeId)
          : (step.noNext as StepId | OutcomeId);
    }

    return null;
  }, [selections]);

  const currentStep = useMemo(
    () => (currentStepId ? steps.find((s) => s.id === currentStepId) : null),
    [currentStepId],
  );

  const outcome = useMemo(
    () => outcomeFromSelections(selections),
    [selections],
  );

  function answer(stepId: StepId, a: AnswerKey) {
    setSelections((prev) => {
      const idx = prev.findIndex((x) => x.stepId === stepId);
      const trimmed = idx >= 0 ? prev.slice(0, idx) : prev.slice();
      return [...trimmed, { stepId, answer: a }];
    });
  }

  function back() {
    setSelections((prev) => prev.slice(0, -1));
  }

  function reset() {
    setSelections([]);
    setShowInfo(false);
  }

  const selectionsPretty = useMemo(() => {
    return selections
      .map((s) => {
        const step = steps.find((x) => x.id === s.stepId);
        if (!step) return null;
        const aKey = s.answer === "yes" ? "yes" : "no";
        return {
          stepTitle: t(step.titleKey),
          answer: t(aKey),
        };
      })
      .filter(Boolean) as { stepTitle: string; answer: string }[];
  }, [selections, t]);

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("spine_title")}</Title>
          <Subtle>{t("spine_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Pressable
            onPress={() => setShowInfo((p) => !p)}
            style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
          >
            <Card>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                >
                  {t("spine_info_title")}
                </Text>
                <Text
                  style={{ color: theme.colors.mutedText, fontWeight: "800" }}
                >
                  {showInfo ? "▾" : "▸"}
                </Text>
              </View>

              {showInfo ? (
                <View style={{ marginTop: 10, gap: 10 }}>
                  <Text style={{ color: theme.colors.text, lineHeight: 18 }}>
                    {t("spine_info_trauma")}
                  </Text>

                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                    {t("spine_info_abc_title")}
                  </Text>
                  <Text style={{ color: theme.colors.text, lineHeight: 18 }}>
                    {t("spine_info_abc")}
                  </Text>

                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                    {t("spine_info_tender_title")}
                  </Text>
                  <Text style={{ color: theme.colors.text, lineHeight: 18 }}>
                    {t("spine_info_tender")}
                  </Text>

                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                    {t("spine_info_neuro_title")}
                  </Text>
                  <Text style={{ color: theme.colors.text, lineHeight: 18 }}>
                    {t("spine_info_neuro")}
                  </Text>
                </View>
              ) : (
                <Subtle style={{ marginTop: 6 }}>{t("spine_info_hint")}</Subtle>
              )}
            </Card>
          </Pressable>

          {currentStep ? (
            <Card>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                {t(currentStep.titleKey)}
              </Text>

              <Text
                style={{
                  color: theme.colors.text,
                  marginTop: 8,
                  lineHeight: 18,
                }}
              >
                {t(currentStep.questionKey)}
              </Text>

              {!!currentStep.noteKey && (
                <Text
                  style={{
                    color: theme.colors.mutedText,
                    marginTop: 8,
                    lineHeight: 18,
                    fontWeight: "700",
                  }}
                >
                  {t(currentStep.noteKey)}
                </Text>
              )}

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <Pressable
                  onPress={() => answer(currentStep.id, "yes")}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.colors.cardBorder,
                    backgroundColor: "rgba(220,220,220,0.18)",
                    alignItems: "center",
                  })}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                    {t("yes")}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => answer(currentStep.id, "no")}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.colors.cardBorder,
                    backgroundColor: "rgba(0,0,0,0.12)",
                    alignItems: "center",
                  })}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                    {t("no")}
                  </Text>
                </Pressable>
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <Pressable
                  onPress={back}
                  disabled={selections.length === 0}
                  style={({ pressed }) => ({
                    opacity:
                      selections.length === 0 ? 0.35 : pressed ? 0.75 : 1,
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
                    {t("back")}
                  </Text>
                </Pressable>

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
          ) : null}

          <Card>
            <Title>{t("spine_selections")}</Title>

            {selectionsPretty.length === 0 ? (
              <Subtle>{t("spine_selections_empty")}</Subtle>
            ) : (
              <View style={{ gap: 8, marginTop: 8 }}>
                {selectionsPretty.map((s, idx) => (
                  <View
                    key={`${s.stepTitle}-${idx}`}
                    style={{
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                      padding: 10,
                      backgroundColor: "rgba(0,0,0,0.12)",
                    }}
                  >
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "900" }}
                    >
                      {s.stepTitle}
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.mutedText,
                        fontWeight: "800",
                      }}
                    >
                      {t("answer")}: {s.answer}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Pressable
                onPress={back}
                disabled={selections.length === 0}
                style={({ pressed }) => ({
                  opacity: selections.length === 0 ? 0.35 : pressed ? 0.75 : 1,
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
                  {t("back")}
                </Text>
              </Pressable>

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

          <Card>
            <Title>{t("spine_result")}</Title>

            {!outcome ? (
              <Subtle>{t("spine_result_pending")}</Subtle>
            ) : (
              <View style={{ gap: 10, marginTop: 8 }}>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 20,
                    fontWeight: "900",
                  }}
                >
                  {outcome === "none"
                    ? t("spine_outcome_none_title")
                    : outcome === "spinal"
                      ? t("spine_outcome_spinal_title")
                      : t("spine_outcome_time_title")}
                </Text>

                <View
                  style={{
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.colors.cardBorder,
                    padding: 12,
                    backgroundColor: "rgba(0,0,0,0.14)",
                    gap: 8,
                  }}
                >
                  <Text style={{ color: theme.colors.text, lineHeight: 18 }}>
                    {outcome === "none"
                      ? t("spine_outcome_none_body")
                      : outcome === "spinal"
                        ? t("spine_outcome_spinal_body")
                        : t("spine_outcome_time_body")}
                  </Text>

                  <Text
                    style={{ color: theme.colors.mutedText, lineHeight: 18 }}
                  >
                    {outcome === "none"
                      ? t("spine_outcome_none_practical")
                      : outcome === "spinal"
                        ? t("spine_outcome_spinal_practical")
                        : t("spine_outcome_time_practical")}
                  </Text>

                  <Text
                    style={{
                      color: theme.colors.mutedText,
                      fontSize: 12,
                      lineHeight: 17,
                    }}
                  >
                    {t("spine_result_disclaimer")}
                  </Text>
                </View>
              </View>
            )}
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

          <Subtle style={{ textAlign: "center", marginTop: 2 }}>
            {t("spine_disclaimer")}
          </Subtle>
        </ScrollView>
      </Screen>
    </Background>
  );
}
