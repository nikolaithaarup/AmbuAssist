import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../i18n/useT";
import { CollapsibleCard } from "../../ui/CollapsibleCard";
import { Card, Row, Subtle, Title } from "../../ui/Ui";
import { theme } from "../../ui/theme";
import type { ReferenceDoc } from "../../services/referenceService";

type Lang = "en" | "da";

type ResultKind =
  | "IMAGING"
  | "BPPV_EPLEY"
  | "OTHER_DIAG"
  | "CENTRAL_STROKE"
  | "PERIPHERAL_NEURITIS"
  | "INDETERMINATE";

type NodeId =
  | "START_RED_FLAGS"
  | "PATTERN"
  | "DIX_HALLPIKE"
  | "HINTS_PLUS"
  | "RESULT_IMAGING"
  | "RESULT_BPPV"
  | "RESULT_OTHER"
  | "RESULT_CENTRAL"
  | "RESULT_PERIPHERAL"
  | "RESULT_INDET";

type Option = {
  id: string;
  label: Record<Lang, string>;
  next: NodeId;
  summaryLabel?: Record<Lang, string>;
};

type Node =
  | {
      id: NodeId;
      kind: "QUESTION";
      title: Record<Lang, string>;
      subtitle?: Record<Lang, string>;
      options: Option[];
    }
  | {
      id: NodeId;
      kind: "RESULT";
      result: ResultKind;
      title: Record<Lang, string>;
      body: Record<Lang, string>;
    };

const NODES: Node[] = [
  {
    id: "START_RED_FLAGS",
    kind: "QUESTION",
    title: {
      en: "Any red flags for central vertigo?",
      da: "Er der røde flag for central vertigo?",
    },
    subtitle: {
      en: "Neurologic symptoms/deficits, significant headache or neck pain, or unable to stand unaided.",
      da: "Neurologiske udfald/symptomer, betydelig hovedpine/nakkesmerter, eller kan ikke stå uden støtte.",
    },
    options: [
      {
        id: "rf_yes",
        label: { en: "Yes", da: "Ja" },
        summaryLabel: { en: "Red flags present", da: "Røde flag til stede" },
        next: "RESULT_IMAGING",
      },
      {
        id: "rf_no",
        label: { en: "No", da: "Nej" },
        summaryLabel: { en: "No red flags", da: "Ingen røde flag" },
        next: "PATTERN",
      },
    ],
  },
  {
    id: "PATTERN",
    kind: "QUESTION",
    title: {
      en: "What pattern fits best?",
      da: "Hvilket mønster passer bedst?",
    },
    subtitle: {
      en: "Choose the description that matches the presentation.",
      da: "Vælg den beskrivelse der matcher præsentationen bedst.",
    },
    options: [
      {
        id: "pattern_bppv",
        label: {
          en: "Short episodes (< 2 min) triggered by head movement; no continuous vertigo; spontaneous/gaze-evoked nystagmus absent.",
          da: "Korte anfald (< 2 min) udløst af hovedbevægelse; ingen kontinuerlig svimmelhed; spontan/blik-udløst nystagmus fraværende.",
        },
        summaryLabel: {
          en: "Short positional episodes (BPPV pattern)",
          da: "Korte positionsudløste anfald (BPPV-mønster)",
        },
        next: "DIX_HALLPIKE",
      },
      {
        id: "pattern_avs",
        label: {
          en: "Many hours/days of ongoing, continuous vertigo, worse with head movement; spontaneous or gaze-evoked nystagmus present.",
          da: "Mange timer/dage med vedvarende, kontinuerlig svimmelhed, værre ved hovedbevægelse; spontan eller blik-udløst nystagmus til stede.",
        },
        summaryLabel: {
          en: "Acute vestibular syndrome (HINTS+ indicated)",
          da: "Akut vestibulært syndrom (HINTS+ relevant)",
        },
        next: "HINTS_PLUS",
      },
      {
        id: "pattern_unclear",
        label: {
          en: "Not sure / mixed picture",
          da: "Ikke sikker / blandet billede",
        },
        summaryLabel: { en: "Pattern unclear", da: "Mønster uklart" },
        next: "RESULT_INDET",
      },
    ],
  },
  {
    id: "DIX_HALLPIKE",
    kind: "QUESTION",
    title: {
      en: "Dix–Hallpike test result",
      da: "Resultat af Dix–Hallpike",
    },
    subtitle: {
      en: "HINTS+ is not indicated here. Evaluate for positional nystagmus.",
      da: "HINTS+ er ikke indiceret her. Vurder positionsudløst nystagmus.",
    },
    options: [
      {
        id: "dh_positive",
        label: {
          en: "Positive: vertical upward + torsional nystagmus",
          da: "Positiv: vertikal opad + rotatorisk nystagmus",
        },
        summaryLabel: {
          en: "Dix–Hallpike positive",
          da: "Dix–Hallpike positiv",
        },
        next: "RESULT_BPPV",
      },
      {
        id: "dh_negative",
        label: {
          en: "Negative or atypical response",
          da: "Negativ eller atypisk respons",
        },
        summaryLabel: {
          en: "Dix–Hallpike negative/atypical",
          da: "Dix–Hallpike negativ/atypisk",
        },
        next: "RESULT_OTHER",
      },
    ],
  },
  {
    id: "HINTS_PLUS",
    kind: "QUESTION",
    title: {
      en: "HINTS+ interpretation (Acute Vestibular Syndrome)",
      da: "HINTS+ fortolkning (Akut vestibulært syndrom)",
    },
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
        summaryLabel: {
          en: "≥1 central sign on HINTS+",
          da: "≥1 centralt tegn på HINTS+",
        },
        next: "RESULT_CENTRAL",
      },
      {
        id: "hints_peripheral_all",
        label: {
          en: "All four: unidirectional nystagmus AND no vertical skew deviation AND abnormal head impulse test AND no new hearing loss",
          da: "Alle fire: ensrettet nystagmus OG ingen vertikal skew deviation OG abnorm head impulse test OG intet nyt høretab",
        },
        summaryLabel: {
          en: "All peripheral pattern signs",
          da: "Alle perifere mønster-tegn",
        },
        next: "RESULT_PERIPHERAL",
      },
      {
        id: "hints_unclear",
        label: {
          en: "Unclear / incomplete exam",
          da: "Uklart / ufuldstændigt",
        },
        summaryLabel: { en: "HINTS+ unclear", da: "HINTS+ uklart" },
        next: "RESULT_INDET",
      },
    ],
  },
  {
    id: "RESULT_IMAGING",
    kind: "RESULT",
    result: "IMAGING",
    title: {
      en: "Imaging indicated / specialist referral",
      da: "Billeddiagnostik indiceret / specialistvurdering",
    },
    body: {
      en: "Red flags suggest a possible central cause. Treat as high risk and follow your local stroke/neurology pathway.",
      da: "Røde flag taler for mulig central årsag. Håndtér som høj risiko og følg lokal stroke/neurologi-procedure.",
    },
  },
  {
    id: "RESULT_BPPV",
    kind: "RESULT",
    result: "BPPV_EPLEY",
    title: { en: "Likely BPPV", da: "Sandsynlig BPPV" },
    body: {
      en: "Findings are consistent with benign paroxysmal positional vertigo. Consider Epley manoeuvre and reassess.",
      da: "Fund passer med benign paroksystisk positionssvimmelhed. Overvej Epley-manøvre og revurdér.",
    },
  },
  {
    id: "RESULT_OTHER",
    kind: "RESULT",
    result: "OTHER_DIAG",
    title: { en: "Consider other diagnoses", da: "Overvej andre diagnoser" },
    body: {
      en: "A negative/atypical Dix–Hallpike suggests non-posterior-canal BPPV or another cause. Consider supine roll test (horizontal canal) and broader differential.",
      da: "Negativ/atypisk Dix–Hallpike kan tyde på ikke-posterior-kanal BPPV eller anden årsag. Overvej supine roll test (horisontal kanal) og bredere differentialdiagnoser.",
    },
  },
  {
    id: "RESULT_CENTRAL",
    kind: "RESULT",
    result: "CENTRAL_STROKE",
    title: {
      en: "Central pattern → Stroke until proven otherwise",
      da: "Centralt mønster → Stroke indtil andet er bevist",
    },
    body: {
      en: "Any central sign on HINTS+ is concerning for posterior circulation stroke. Escalate and follow stroke pathway / imaging per protocol.",
      da: "Et centralt tegn på HINTS+ er bekymrende for bagre kredsløbs-stroke. Eskalér og følg stroke-protokol / billeddiagnostik.",
    },
  },
  {
    id: "RESULT_PERIPHERAL",
    kind: "RESULT",
    result: "PERIPHERAL_NEURITIS",
    title: {
      en: "Peripheral pattern → Vestibular neuritis likely",
      da: "Perifert mønster → Vestibularisneuritis sandsynlig",
    },
    body: {
      en: "HINTS+ findings fit a peripheral vestibular cause. Manage per local protocol and safety-net if symptoms change.",
      da: "HINTS+ fund passer med perifer vestibulær årsag. Behandl efter lokal guideline og sikkerhedsnet ved ændring i symptomer.",
    },
  },
  {
    id: "RESULT_INDET",
    kind: "RESULT",
    result: "INDETERMINATE",
    title: { en: "Indeterminate", da: "Uafklaret" },
    body: {
      en: "The pattern/exam is unclear. When in doubt, treat as higher risk and consider imaging/escalation per protocol.",
      da: "Mønster/undersøgelse er uklar. Ved tvivl: håndtér som højere risiko og overvej billeddiagnostik/eskalation efter lokale retningslinjer.",
    },
  },
];

function getNode(id: NodeId): Node {
  const n = NODES.find((x) => x.id === id);
  if (!n) throw new Error(`Unknown node: ${id}`);
  return n;
}

type StepChoice = {
  nodeId: NodeId;
  optionId: string;
  label: Record<Lang, string>;
};

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

type Props = {
  lang: Lang;
  reference: ReferenceDoc | null;
};

export default function HintsContent({ lang, reference }: Props) {
  const { t } = useT();

  const [currentId, setCurrentId] = useState<NodeId>("START_RED_FLAGS");
  const [history, setHistory] = useState<StepChoice[]>([]);
  const [flowExpanded, setFlowExpanded] = useState(false);

  const current = useMemo(() => getNode(currentId), [currentId]);
  const isResult = current.kind === "RESULT";

  const onPick = (opt: Option) => {
    if (current.kind !== "QUESTION") return;

    const choice: StepChoice = {
      nodeId: current.id,
      optionId: opt.id,
      label: opt.summaryLabel ?? opt.label,
    };

    setHistory((prev) => [...prev, choice]);
    setCurrentId(opt.next);
  };

  const onBack = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      const last = prev[prev.length - 1];
      setCurrentId(last.nodeId);
      return next;
    });
  };

  const onReset = () => {
    setHistory([]);
    setCurrentId("START_RED_FLAGS");
    setFlowExpanded(false);
  };

  return (
    <>
      <Card>
        <Title>{t("tool_hints_title")}</Title>
        <Subtle>{t("tool_hints_desc")}</Subtle>
      </Card>

      <Card>
        <View style={{ gap: 6 }}>
          <Title style={{ fontSize: 20 }}>
            {current.kind === "RESULT"
              ? t("hints_result")
              : current.title[lang]}
          </Title>

          {current.kind === "QUESTION" && current.subtitle && (
            <Subtle>{current.subtitle[lang]}</Subtle>
          )}

          {current.kind === "RESULT" && (
            <>
              <Subtle>{current.title[lang]}</Subtle>
              <Text style={{ color: theme.colors.text, lineHeight: 20 }}>
                {current.body[lang]}
              </Text>
              <Text
                style={{
                  color: theme.colors.mutedText,
                  fontSize: 12,
                  lineHeight: 17,
                  marginTop: 8,
                }}
              >
                {t("hints_result_disclaimer")}
              </Text>
            </>
          )}
        </View>

        {current.kind === "QUESTION" && (
          <View style={{ gap: 10, marginTop: 12 }}>
            {current.options.map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => onPick(opt)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor: "rgba(220,220,220,0.12)",
                })}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "800",
                    lineHeight: 20,
                  }}
                >
                  {opt.label[lang]}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Row>
          <Pressable
            onPress={onBack}
            disabled={history.length === 0}
            style={({ pressed }) => ({
              opacity: history.length === 0 ? 0.4 : pressed ? 0.7 : 1,
              marginTop: 14,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
              backgroundColor: "rgba(0,0,0,0.14)",
            })}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
              {t("back")}
            </Text>
          </Pressable>

          <Pressable
            onPress={onReset}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              marginTop: 14,
              marginLeft: "auto",
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
              backgroundColor: "rgba(255,107,107,0.10)",
            })}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
              {t("reset")}
            </Text>
          </Pressable>
        </Row>
      </Card>

      <Card>
        <Title style={{ fontSize: 18 }}>{t("hints_selections")}</Title>

        {history.length === 0 ? (
          <Text style={{ color: theme.colors.mutedText }}>
            {t("hints_none")}
          </Text>
        ) : (
          <View style={{ gap: 8, marginTop: 10 }}>
            {history.map((h, idx) => (
              <View
                key={`${h.nodeId}_${h.optionId}_${idx}`}
                style={{
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderTopColor: theme.colors.cardBorder,
                  paddingTop: idx === 0 ? 0 : 8,
                  marginTop: idx === 0 ? 0 : 8,
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {idx + 1}. {h.label[lang]}
                </Text>
              </View>
            ))}

            {isResult && (
              <View
                style={{
                  marginTop: 8,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  padding: 12,
                  backgroundColor: "rgba(220,220,220,0.10)",
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  {t("hints_conclusion")}
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    marginTop: 4,
                    lineHeight: 20,
                  }}
                >
                  {current.kind === "RESULT" ? current.title[lang] : ""}
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>

      <Card>
        <Row>
          <Title style={{ fontSize: 18 }}>{t("hints_flowchart")}</Title>

          <Pressable
            onPress={() => setFlowExpanded((p) => !p)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              marginLeft: "auto",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
              backgroundColor: "rgba(220,220,220,0.18)",
            })}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
              {flowExpanded ? t("hide") : t("show")}
            </Text>
          </Pressable>
        </Row>

        <Text
          style={{
            color: theme.colors.mutedText,
            marginTop: 10,
            fontSize: 13,
            lineHeight: 18,
          }}
        >
          {t("hints_tip")}
        </Text>

        {flowExpanded && (
          <View style={{ marginTop: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <ScrollView showsVerticalScrollIndicator>
                <Image
                  source={require("../../../assets/hints-flowchart.png")}
                  style={{
                    width: 980,
                    height: 720,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.cardBorder,
                  }}
                  resizeMode="contain"
                />
              </ScrollView>
            </ScrollView>

            <Subtle style={{ marginTop: 8 }}>
              {lang === "da"
                ? "Tip: Scroll for at zoome/tilpasse på web."
                : "Tip: Scroll to pan/zoom on web."}
            </Subtle>
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
            />
          ))}
        </View>
      </CollapsibleCard>
    </>
  );
}
