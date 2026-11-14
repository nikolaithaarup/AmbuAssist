import { useMemo, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { ScrollView as ScrollViewType } from "react-native";

import { findInfectionPatterns } from "../../../../src/domain/bloodgas/infection";
import { findBloodGasPatterns } from "../../../../src/domain/bloodgas/patterns";
import { BloodGasPageHeader, ResultSection, VgasPo2Caution } from "../../../../src/features/bloodgas/BloodGasPresentation";
import { GroupedBloodGasInput } from "../../../../src/features/bloodgas/GroupedBloodGasInput";
import { getFormSummary } from "../../../../src/features/bloodgas/inputGroups";
import { makeEmptyBloodGasFormValues, parseBloodGasFormValues } from "../../../../src/features/bloodgas/helpers";
import type { BloodGasFieldKey, BloodGasFormValues } from "../../../../src/features/bloodgas/types";
import { useT } from "../../../../src/i18n/useT";
import type { Key } from "../../../../src/i18n/strings";
import { useSettings } from "../../../../src/state/settings";
import { Background } from "../../../../src/ui/Background";
import { CollapsibleCard } from "../../../../src/ui/CollapsibleCard";
import { PrimaryButton, ResponsiveColumn, ResponsiveColumns, Screen, Subtle, Title } from "../../../../src/ui/Ui";
import { ToolSurface } from "../../../../src/ui/ToolSurface";
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

  return <Background><Screen>
    <BloodGasPageHeader title={t("tool_bg_patterns_title")} />
    <ScrollView ref={scrollRef} contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
      <ResponsiveColumns>
        <ResponsiveColumn>
          <ToolSurface>
            <GroupedBloodGasInput values={form} onChange={onChange} isDa={isDa} />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Text style={{ color: theme.colors.accentMuted, fontWeight: "700" }}>{isDa ? `${formSummary.entered} indtastet` : `${formSummary.entered} entered`}</Text>
              {formSummary.issues ? <Text style={{ color: theme.colors.danger, fontWeight: "800" }}>{isDa ? `${formSummary.issues} skal kontrolleres` : `${formSummary.issues} need checking`}</Text> : null}
            </View>
            <PrimaryButton label={isDa ? "Vurder VGAS" : "Assess VGAS"} onPress={assess} />
            {submitted && formSummary.issues ? <Text style={{ color: theme.colors.danger, fontWeight: "800" }}>{isDa ? "Ret markerede værdier før vurdering." : "Correct marked values before assessment."}</Text> : null}
            {submitted && !formSummary.issues && formSummary.entered === 0 ? <Text style={{ color: theme.colors.danger, fontWeight: "800" }}>{isDa ? "Indtast mindst én værdi." : "Enter at least one value."}</Text> : null}
          </ToolSurface>
        </ResponsiveColumn>

        <ResponsiveColumn>
          {submitted && !formSummary.issues && formSummary.entered > 0 ? <View style={{ gap: 12 }}>
            <ToolSurface style={{ gap: 12 }}>
              <Title style={{ fontSize: 20 }}>{isDa ? "Vurdering" : "Assessment"}</Title>
              {concise.length ? concise.map((item, index) => <Text key={`${item}-${index}`} style={{ color: theme.colors.text, lineHeight: 21 }}>• {item}</Text>) : <Subtle>{isDa ? "Ingen tydelige mønsterfund. Kontrollér værdier, enheder og klinik." : "No clear pattern findings. Check values, units, and clinical context."}</Subtle>}
            </ToolSurface>

            <CollapsibleCard title={isDa ? "Syre-base" : "Acid-base"}>
              <ResultSection label={isDa ? "Fund" : "Findings"}>{acidBase.length ? acidBase.map((item, i) => <Text key={i} style={{ color: theme.colors.mutedText, lineHeight: 20 }}>• {item}</Text>) : <Subtle>{isDa ? "Ingen tydelige syre-base-mønstre." : "No clear acid-base patterns."}</Subtle>}</ResultSection>
            </CollapsibleCard>

            <CollapsibleCard title={isDa ? "VGAS og iltning" : "VGAS and oxygenation"}><VgasPo2Caution /></CollapsibleCard>

            <CollapsibleCard title={isDa ? "Elektrolytter og nyretal" : "Electrolytes and renal markers"}>{electrolytesRenal.map((item, i) => <Text key={i} style={{ color: theme.colors.mutedText, lineHeight: 20 }}>• {item}</Text>)}<Subtle>{isDa ? "Vurder med tidligere værdier, væskestatus, øvrige prøver og klinik." : "Assess with previous values, hydration status, other tests, and clinical context."}</Subtle></CollapsibleCard>

            <CollapsibleCard title={isDa ? "CRP / infektion" : "CRP / infection"}>
              {infection.length ? infection.map((item, i) => <Text key={i} style={{ color: theme.colors.mutedText, lineHeight: 20 }}>• {item}</Text>) : <Subtle>{isDa ? "CRP alene kan ikke afgøre infektionstype eller behandlingsbehov." : "CRP alone cannot determine infection type or treatment need."}</Subtle>}
            </CollapsibleCard>
          </View> : null}
        </ResponsiveColumn>
      </ResponsiveColumns>
    </ScrollView>
  </Screen></Background>;
}
