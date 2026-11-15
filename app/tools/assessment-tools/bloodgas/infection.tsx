import { useEffect, useMemo, useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";

import { useT } from "../../../../src/i18n/useT";
import type { Key } from "../../../../src/i18n/strings";
import { findInfectionPatterns } from "../../../../src/domain/bloodgas/infection";
import { useSettings } from "../../../../src/state/settings";
import {
  getReference,
  type ReferenceDoc,
} from "../../../../src/services/referenceService";
import { Background } from "../../../../src/ui/Background";
import { ClinicalDisclosure } from "../../../../src/ui/ClinicalDisclosure";
import { ResponsiveColumn, ResponsiveColumns, Row, Screen, Subtle } from "../../../../src/ui/Ui";
import { theme } from "../../../../src/ui/theme";

import { BloodGasInputCard } from "../../../../src/features/bloodgas/BloodGasInputCard";
import { BloodGasPageHeader, ResultSection } from "../../../../src/features/bloodgas/BloodGasPresentation";
import {
  makeEmptyBloodGasFormValues,
  parseBloodGasFormValues,
} from "../../../../src/features/bloodgas/helpers";
import type {
  BloodGasFieldKey,
  BloodGasFormValues,
} from "../../../../src/features/bloodgas/types";

const INFECTION_FIELDS: BloodGasFieldKey[] = ["crp", "lactate", "glucose"];

export default function InfectionPage() {
  const { t } = useT();
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";

  const [reference, setReference] = useState<ReferenceDoc | null>(null);
  const [form, setForm] = useState<BloodGasFormValues>(
    makeEmptyBloodGasFormValues(),
  );

  const [nitrite, setNitrite] = useState(false);
  const [leukocytes, setLeukocytes] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReference() {
      const data = await getReference("bg_infection");
      if (!active) return;
      setReference(data);
    }

    loadReference();

    return () => {
      active = false;
    };
  }, []);

  const values = useMemo(() => parseBloodGasFormValues(form), [form]);

  const handleChange = (key: BloodGasFieldKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const results = useMemo(
    () =>
      findInfectionPatterns(values, nitrite, leukocytes).map((code) =>
        t(code as Key),
      ),
    [values, nitrite, leukocytes, t],
  );

  const fallbackSources = [
    {
      id: "bg-infection-fallback-1",
      title: t("bg_infection_source_fallback_1_title"),
      subtitle: t("bg_infection_source_fallback_1_sub"),
    },
    {
      id: "bg-infection-fallback-2",
      title: t("bg_infection_source_fallback_2_title"),
      subtitle: t("bg_infection_source_fallback_2_sub"),
    },
  ];

  const renderedSources: Array<{
    id: string;
    title: string;
    subtitle: string;
    url?: string;
  }> =
    reference?.sources && reference.sources.length > 0
      ? reference.sources.map((source) => ({
          id: source.id,
          title: source.title[lang],
          subtitle: source.subtitle[lang],
          url: (source as any).url?.[lang] ?? (source as any).url ?? undefined,
        }))
      : fallbackSources;

  return (
    <Background>
      <Screen>
        <BloodGasPageHeader title={t("tool_bg_infection_title")} />

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <ResponsiveColumns>
            <ResponsiveColumn>
              <BloodGasInputCard values={form} onChange={handleChange} fields={INFECTION_FIELDS} />
              <View style={{ gap: 4, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.divider }}>
              <Row
                style={{ minHeight: 48, justifyContent: "space-between", alignItems: "center" }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                  {t("bg_label_nitrite")}
                </Text>
                <Switch value={nitrite} onValueChange={setNitrite} />
              </Row>

              <Row
                style={{ minHeight: 48, justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: theme.colors.divider }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                  {t("bg_label_leukocytes")}
                </Text>
                <Switch value={leukocytes} onValueChange={setLeukocytes} />
              </Row>
              </View>
              <Subtle style={{ fontSize: 12, lineHeight: 18 }}>{lang === "da" ? "CRP alene afgør ikke infektionstype eller behandling." : "CRP alone does not determine infection type or treatment."}</Subtle>
            </ResponsiveColumn>

            {results.length > 0 ? <ResponsiveColumn>
              <View style={{ gap: 12, paddingTop: 2 }}>
                  <ResultSection label={lang === "da" ? "Fund" : "Findings"} tone="caution">
                    <View style={{ gap: 8 }}>{results.map((r, i) => <Text key={`${r}-${i}`} style={{ color: theme.colors.mutedText, lineHeight: 20 }}>• {r}</Text>)}</View>
                  </ResultSection>
              </View>
            </ResponsiveColumn> : null}
          </ResponsiveColumns>
          <ClinicalDisclosure
            compact
            disclaimer={reference?.disclaimer[lang] ?? t("bg_infection_disclaimer")}
            sourcesIntro={reference?.sourcesSub[lang] ?? t("bg_infection_sources_sub")}
            sources={renderedSources}
          />
        </ScrollView>
      </Screen>
    </Background>
  );
}
