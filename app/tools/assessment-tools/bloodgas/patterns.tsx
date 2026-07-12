import { useMemo, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { ScrollView as ScrollViewType } from "react-native";

import { findInfectionPatterns } from "../../../../src/domain/bloodgas/infection";
import { findBloodGasPatterns } from "../../../../src/domain/bloodgas/patterns";
import { BloodGasPageHeader, BloodGasProvenance, ResultSection, VgasPo2Caution } from "../../../../src/features/bloodgas/BloodGasPresentation";
import { GroupedBloodGasInput } from "../../../../src/features/bloodgas/GroupedBloodGasInput";
import { getFormSummary } from "../../../../src/features/bloodgas/inputGroups";
import { makeEmptyBloodGasFormValues, parseBloodGasFormValues } from "../../../../src/features/bloodgas/helpers";
import type { BloodGasFieldKey, BloodGasFormValues } from "../../../../src/features/bloodgas/types";
import { useT } from "../../../../src/i18n/useT";
import type { Key } from "../../../../src/i18n/strings";
import { useSettings } from "../../../../src/state/settings";
import { Background } from "../../../../src/ui/Background";
import { CollapsibleCard } from "../../../../src/ui/CollapsibleCard";
import { Card, PrimaryButton, Screen, Subtle, Title } from "../../../../src/ui/Ui";
import { theme } from "../../../../src/ui/theme";

export default function PatternsPage() {
  const { t } = useT();
  const { settings } = useSettings();
  const isDa = settings.language === "da";
  const scrollRef = useRef<ScrollViewType>(null);
  const [form, setForm] = useState<BloodGasFormValues>(makeEmptyBloodGasFormValues());
  const [submitted, setSubmitted] = useState(false);

  const values = useMemo(() => parseBloodGasFormValues(form), [form]);
  const formSummary = useMemo(() => getFormSummary(form), [form]);
  const patternCodes = useMemo(() => findBloodGasPatterns(values), [values]);
  const infectionCodes = useMemo(() => findInfectionPatterns(values, false, false), [values]);
  const patterns = patternCodes.map((code) => t(code as Key));
  const infection = infectionCodes.map((code) => t(code as Key));
  const acidBase = patternCodes.filter((code) => /acidosis|dka/.test(code)).map((code) => t(code as Key));
  const electrolytesRenal = patternCodes.filter((code) => /hyponatremia|renal/.test(code)).map((code) => t(code as Key));

  const onChange = (key: BloodGasFieldKey, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
  };

  const assess = () => {
    setSubmitted(true);
    if (!formSummary.issues) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const concise = [...patterns, ...infection].slice(0, 4);
  if (concise.length < 4 && (form.po2.trim() || form.so2.trim())) concise.push(isDa ? "pO₂ på VGAS kan ikke bruges alene til sikker vurdering af iltning." : "VGAS pO₂ cannot assess oxygenation reliably on its own.");

  return <Background><Screen>
    <BloodGasPageHeader title={t("tool_bg_patterns_title")} subtitle={isDa ? "Manuel VGAS-indtastning og mønsterstøtte" : "Manual VGAS entry and pattern support"} />
    <ScrollView ref={scrollRef} contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
      <GroupedBloodGasInput values={form} onChange={onChange} isDa={isDa} />

      <Card style={{ padding: 12, gap: 7 }}>
        <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{isDa ? "Indtastede værdier" : "Entered values"}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Text style={{ color: theme.colors.accentMuted, fontWeight: "700" }}>{isDa ? `Indtastet: ${formSummary.entered} værdier` : `Entered: ${formSummary.entered} values`}</Text>
          {formSummary.issues ? <Text style={{ color: theme.colors.danger, fontWeight: "800" }}>{isDa ? `${formSummary.issues} skal kontrolleres` : `${formSummary.issues} need checking`}</Text> : null}
        </View>
      </Card>

      <PrimaryButton label={isDa ? "Vurder VGAS" : "Assess VGAS"} onPress={assess} />
      {submitted && formSummary.issues ? <Card style={{ borderColor: theme.colors.danger }}><Text style={{ color: theme.colors.danger, fontWeight: "800" }}>{isDa ? "Ret værdier markeret med fejl før vurdering." : "Correct values marked with errors before assessment."}</Text></Card> : null}

      {submitted && !formSummary.issues ? <View style={{ gap: 12 }}>
        <Card style={{ gap: 12 }}>
          <Title style={{ fontSize: 20 }}>{isDa ? "Samlet vurdering" : "Overall assessment"}</Title>
          {concise.length ? concise.map((item, index) => <Text key={`${item}-${index}`} style={{ color: theme.colors.text, lineHeight: 21 }}>• {item}</Text>) : <Subtle>{isDa ? "Ingen tydelige mønsterfund ud fra de indtastede værdier. Kontrollér værdier, enheder og klinik." : "No clear pattern findings from the entered values. Check values, units, and clinical context."}</Subtle>}
        </Card>

        <CollapsibleCard title={isDa ? "Syre-base" : "Acid-base"} subtitle={isDa ? "Respiratoriske og metaboliske mønstre" : "Respiratory and metabolic patterns"}>
          <ResultSection label={isDa ? "Fund" : "Findings"}>{acidBase.length ? acidBase.map((item, i) => <Text key={i} style={{ color: theme.colors.mutedText, lineHeight: 20 }}>• {item}</Text>) : <Subtle>{isDa ? "Ingen tydelige syre-base-mønstre i de indtastede værdier." : "No clear acid-base patterns in the entered values."}</Subtle>}</ResultSection>
        </CollapsibleCard>

        <CollapsibleCard title={isDa ? "VGAS og iltning" : "VGAS and oxygenation"} subtitle={isDa ? "Venøs pO₂ kræver forsigtig fortolkning" : "Venous pO₂ requires cautious interpretation"}><VgasPo2Caution /></CollapsibleCard>

        <CollapsibleCard title={isDa ? "Elektrolytter og nyretal" : "Electrolytes and renal markers"} subtitle={isDa ? "Detaljer fra mønsterstøtten" : "Pattern-support details"}>{electrolytesRenal.map((item, i) => <Text key={i} style={{ color: theme.colors.mutedText, lineHeight: 20 }}>• {item}</Text>)}<Subtle>{isDa ? "Vurder sammen med tidligere værdier, væskestatus, øvrige prøver og klinik." : "Assess with previous values, hydration status, other tests, and clinical context."}</Subtle></CollapsibleCard>

        <CollapsibleCard title={isDa ? "CRP / infektion" : "CRP / infection"} subtitle={isDa ? "CRP er uspecifik" : "CRP is nonspecific"}>
          {infection.length ? infection.map((item, i) => <Text key={i} style={{ color: theme.colors.mutedText, lineHeight: 20 }}>• {item}</Text>) : <Subtle>{isDa ? "CRP alene kan ikke afgøre infektionstype eller behandlingsbehov." : "CRP alone cannot determine infection type or treatment need."}</Subtle>}
        </CollapsibleCard>
      </View> : null}

      <BloodGasProvenance />
    </ScrollView>
  </Screen></Background>;
}
