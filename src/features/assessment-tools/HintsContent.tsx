import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import type { AssessmentDefinition } from "../../domain/assessment-flow/flow";
import {
  getHintsTransition,
  isHintsStep,
  type HintsOptionId,
  type HintsResultId,
  type HintsStepId,
} from "../../domain/assessments/hints";
import { useT } from "../../i18n/useT";
import type { ReferenceDoc } from "../../services/referenceService";
import { Card, Row, Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";
import {
  AssessmentQuestionCard,
  AssessmentResultCard,
  getAssessmentUiLabels,
  useAssessmentFlow,
} from "../assessment-flow/AssessmentFlow";
import { AssessmentReferenceCards } from "../assessment-flow/AssessmentReferenceCards";

type Lang = "en" | "da";
type Localized = Record<Lang, string>;
type Question = {
  title: Localized;
  subtitle: Localized;
  options: readonly { id: HintsOptionId; label: Localized; summary: Localized }[];
};

const QUESTIONS: Record<HintsStepId, Question> = {
  red_flags: {
    title: { en: "Any red flags for central vertigo?", da: "Er der røde flag for central vertigo?" },
    subtitle: {
      en: "Neurologic symptoms/deficits, significant headache or neck pain, or unable to stand unaided.",
      da: "Neurologiske udfald/symptomer, betydelig hovedpine/nakkesmerter, eller kan ikke stå uden støtte.",
    },
    options: [
      { id: "rf_yes", label: { en: "Yes", da: "Ja" }, summary: { en: "Red flags present", da: "Røde flag til stede" } },
      { id: "rf_no", label: { en: "No", da: "Nej" }, summary: { en: "No red flags", da: "Ingen røde flag" } },
    ],
  },
  pattern: {
    title: { en: "What pattern fits best?", da: "Hvilket mønster passer bedst?" },
    subtitle: { en: "Choose the description that matches the presentation.", da: "Vælg den beskrivelse der matcher præsentationen bedst." },
    options: [
      {
        id: "pattern_bppv",
        label: {
          en: "Short episodes (< 2 min) triggered by head movement; no continuous vertigo; spontaneous/gaze-evoked nystagmus absent.",
          da: "Korte anfald (< 2 min) udløst af hovedbevægelse; ingen kontinuerlig svimmelhed; spontan/blik-udløst nystagmus fraværende.",
        },
        summary: { en: "Short positional episodes (BPPV pattern)", da: "Korte positionsudløste anfald (BPPV-mønster)" },
      },
      {
        id: "pattern_avs",
        label: {
          en: "Many hours/days of ongoing, continuous vertigo, worse with head movement; spontaneous or gaze-evoked nystagmus present.",
          da: "Mange timer/dage med vedvarende, kontinuerlig svimmelhed, værre ved hovedbevægelse; spontan eller blik-udløst nystagmus til stede.",
        },
        summary: { en: "Acute vestibular syndrome (HINTS+ indicated)", da: "Akut vestibulært syndrom (HINTS+ relevant)" },
      },
      { id: "pattern_unclear", label: { en: "Not sure / mixed picture", da: "Ikke sikker / blandet billede" }, summary: { en: "Pattern unclear", da: "Mønster uklart" } },
    ],
  },
  dix_hallpike: {
    title: { en: "Dix–Hallpike test result", da: "Resultat af Dix–Hallpike" },
    subtitle: { en: "HINTS+ is not indicated here. Evaluate for positional nystagmus.", da: "HINTS+ er ikke indiceret her. Vurder positionsudløst nystagmus." },
    options: [
      {
        id: "dh_positive",
        label: { en: "Positive: vertical upward + torsional nystagmus", da: "Positiv: vertikal opad + rotatorisk nystagmus" },
        summary: { en: "Dix–Hallpike positive", da: "Dix–Hallpike positiv" },
      },
      {
        id: "dh_negative",
        label: { en: "Negative or atypical response", da: "Negativ eller atypisk respons" },
        summary: { en: "Dix–Hallpike negative/atypical", da: "Dix–Hallpike negativ/atypisk" },
      },
    ],
  },
  hints_plus: {
    title: { en: "HINTS+ interpretation (Acute Vestibular Syndrome)", da: "HINTS+ fortolkning (Akut vestibulært syndrom)" },
    subtitle: {
      en: "Select what you found. (If any central sign is present → central until proven otherwise.)",
      da: "Vælg hvad du fandt. (Hvis der er et centralt tegn → centralt indtil andet er bevist.)",
    },
    options: [
      {
        id: "hints_central_any",
        label: {
          en: "Any of: bidirectional nystagmus OR vertical skew deviation OR normal head impulse test OR new hearing loss",
          da: "Et af: bidirektionel nystagmus ELLER vertikal skew deviation ELLER normal head impulse test ELLER nyt høretab",
        },
        summary: { en: "≥1 central sign on HINTS+", da: "≥1 centralt tegn på HINTS+" },
      },
      {
        id: "hints_peripheral_all",
        label: {
          en: "All four: unidirectional nystagmus AND no vertical skew deviation AND abnormal head impulse test AND no new hearing loss",
          da: "Alle fire: ensrettet nystagmus OG ingen vertikal skew deviation OG abnorm head impulse test OG intet nyt høretab",
        },
        summary: { en: "All peripheral pattern signs", da: "Alle perifere mønster-tegn" },
      },
      { id: "hints_unclear", label: { en: "Unclear / incomplete exam", da: "Uklart / ufuldstændigt" }, summary: { en: "HINTS+ unclear", da: "HINTS+ uklart" } },
    ],
  },
};

const RESULTS: Record<HintsResultId, { title: Localized; body: Localized }> = {
  imaging: {
    title: { en: "Imaging indicated / specialist referral", da: "Billeddiagnostik indiceret / specialistvurdering" },
    body: {
      en: "Red flags suggest a possible central cause. Treat as high risk and follow your local stroke/neurology pathway.",
      da: "Røde flag taler for mulig central årsag. Håndtér som høj risiko og følg lokal stroke/neurologi-procedure.",
    },
  },
  bppv: {
    title: { en: "Likely BPPV", da: "Sandsynlig BPPV" },
    body: {
      en: "Findings are consistent with benign paroxysmal positional vertigo. Consider Epley manoeuvre and reassess.",
      da: "Fund passer med benign paroksystisk positionssvimmelhed. Overvej Epley-manøvre og revurdér.",
    },
  },
  other: {
    title: { en: "Consider other diagnoses", da: "Overvej andre diagnoser" },
    body: {
      en: "A negative/atypical Dix–Hallpike suggests non-posterior-canal BPPV or another cause. Consider supine roll test (horizontal canal) and broader differential.",
      da: "Negativ/atypisk Dix–Hallpike kan tyde på ikke-posterior-kanal BPPV eller anden årsag. Overvej supine roll test (horisontal kanal) og bredere differentialdiagnoser.",
    },
  },
  central: {
    title: { en: "Central pattern → Stroke until proven otherwise", da: "Centralt mønster → Stroke indtil andet er bevist" },
    body: {
      en: "Any central sign on HINTS+ is concerning for posterior circulation stroke. Escalate and follow stroke pathway / imaging per protocol.",
      da: "Et centralt tegn på HINTS+ er bekymrende for bagre kredsløbs-stroke. Eskalér og følg stroke-protokol / billeddiagnostik.",
    },
  },
  peripheral: {
    title: { en: "Peripheral pattern → Vestibular neuritis likely", da: "Perifert mønster → Vestibularisneuritis sandsynlig" },
    body: {
      en: "HINTS+ findings fit a peripheral vestibular cause. Manage per local protocol and safety-net if symptoms change.",
      da: "HINTS+ fund passer med perifer vestibulær årsag. Behandl efter lokal guideline og sikkerhedsnet ved ændring i symptomer.",
    },
  },
  indeterminate: {
    title: { en: "Indeterminate", da: "Uafklaret" },
    body: {
      en: "The pattern/exam is unclear. When in doubt, treat as higher risk and consider imaging/escalation per protocol.",
      da: "Mønster/undersøgelse er uklar. Ved tvivl: håndtér som højere risiko og overvej billeddiagnostik/eskalation efter lokale retningslinjer.",
    },
  },
};

const definition: AssessmentDefinition<HintsStepId, HintsOptionId> = {
  startStepId: "red_flags",
  steps: (Object.keys(QUESTIONS) as HintsStepId[]).map((id) => ({
    id,
    next: (answer) => {
      const next = getHintsTransition(id, answer);
      return isHintsStep(next) ? next : null;
    },
  })),
  totalSteps: (answers) => {
    if (answers.red_flags === "rf_yes") return 1;
    if (answers.pattern === "pattern_unclear") return 2;
    return 3;
  },
};

function resultFromAnswers(
  path: readonly HintsStepId[],
  answers: Partial<Record<HintsStepId, HintsOptionId>>,
): HintsResultId | null {
  const last = path.at(-1);
  const answer = last ? answers[last] : undefined;
  if (!last || !answer) return null;
  const next = getHintsTransition(last, answer);
  return isHintsStep(next) ? null : next;
}

export default function HintsContent({ lang, reference }: { lang: Lang; reference: ReferenceDoc | null }) {
  const { t } = useT();
  const flow = useAssessmentFlow(definition);
  const [flowExpanded, setFlowExpanded] = useState(false);
  const current = flow.currentStepId ? QUESTIONS[flow.currentStepId] : null;
  const resultId = useMemo(
    () => resultFromAnswers(flow.state.path, flow.state.answers),
    [flow.state.answers, flow.state.path],
  );
  const result = resultId ? RESULTS[resultId] : null;
  const restart = () => {
    setFlowExpanded(false);
    flow.restart();
  };

  return (
    <>
      <Card>
        <Title>{t("tool_hints_title")}</Title>
        <Subtle>{t("tool_hints_desc")}</Subtle>
      </Card>
      {flow.state.completed && result ? (
        <AssessmentResultCard
          title={t("hints_result")}
          score={result.title[lang]}
          interpretation={result.body[lang]}
          supportingText={t("hints_result_disclaimer")}
          onReview={flow.back}
          onRestart={restart}
          labels={getAssessmentUiLabels(lang)}
        />
      ) : current && flow.currentStepId ? (
        <AssessmentQuestionCard
          title={current.title[lang]}
          subtitle={current.subtitle[lang]}
          progress={flow.progress}
          choices={current.options.map((option) => ({ value: option.id, label: option.label[lang] }))}
          selected={flow.state.answers[flow.currentStepId]}
          onSelect={(answer) => flow.answer(flow.currentStepId!, answer)}
          onBack={flow.back}
          canGoBack={flow.state.position > 0}
          labels={getAssessmentUiLabels(lang)}
        />
      ) : null}

      <Card>
        <Title style={{ fontSize: 18 }}>{t("hints_selections")}</Title>
        {flow.state.path.map((stepId, index) => {
          const answer = flow.state.answers[stepId];
          const selected = QUESTIONS[stepId].options.find((option) => option.id === answer);
          return selected ? (
            <Text key={stepId} style={{ color: theme.colors.text, fontWeight: "800", lineHeight: 21 }}>
              {index + 1}. {selected.summary[lang]}
            </Text>
          ) : null;
        })}
      </Card>

      <Card>
        <Row>
          <Title style={{ fontSize: 18 }}>{t("hints_flowchart")}</Title>
          <Pressable onPress={() => setFlowExpanded((open) => !open)} style={({ pressed }) => ({ marginLeft: "auto", minHeight: 44, paddingHorizontal: 14, justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: theme.colors.cardBorder, opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{flowExpanded ? (lang === "da" ? "Skjul" : "Hide") : (lang === "da" ? "Vis" : "Show")}</Text>
          </Pressable>
        </Row>
        <Subtle>
          {lang === "da"
            ? "Brug diagrammet som visuelt overblik."
            : "Use the diagram as a visual overview."}
        </Subtle>
        {flowExpanded ? (
          <View style={{ marginTop: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <Image source={require("../../../assets/hints-flowchart.png")} style={{ width: 980, height: 720, borderRadius: 12 }} resizeMode="contain" />
            </ScrollView>
            <Subtle style={{ marginTop: 8 }}>
              {lang === "da"
                ? "Tip: Scroll for at zoome/tilpasse på web."
                : "Tip: Scroll to pan/zoom on web."}
            </Subtle>
          </View>
        ) : null}
      </Card>
      <AssessmentReferenceCards
        reference={reference}
        lang={lang}
      />
    </>
  );
}
