import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { useT } from "../../../../src/i18n/useT";
import type { Key } from "../../../../src/i18n/strings";
import { findBloodGasPatterns } from "../../../../src/domain/bloodgas/patterns";
import { useSettings } from "../../../../src/state/settings";
import {
  getReference,
  type ReferenceDoc,
} from "../../../../src/services/referenceService";
import { Background } from "../../../../src/ui/Background";
import { CollapsibleCard } from "../../../../src/ui/CollapsibleCard";
import { Card, Screen, Subtle, Title } from "../../../../src/ui/Ui";
import { theme } from "../../../../src/ui/theme";

import { BloodGasInputCard } from "../../../../src/features/bloodgas/BloodGasInputCard";
import { BloodGasPageHeader, ResultSection } from "../../../../src/features/bloodgas/BloodGasPresentation";
import { SourceItem } from "../../../../src/features/bloodgas/SourceItem";
import {
  makeEmptyBloodGasFormValues,
  parseBloodGasFormValues,
} from "../../../../src/features/bloodgas/helpers";
import type {
  BloodGasFieldKey,
  BloodGasFormValues,
} from "../../../../src/features/bloodgas/types";

const PATTERN_FIELDS: BloodGasFieldKey[] = [
  "ph",
  "pco2",
  "po2",
  "hco3",
  "be",
  "so2",
  "na",
  "k",
  "ca",
  "cl",
  "glucose",
  "lactate",
  "urea",
  "creatinine",
  "hct",
  "hgb",
];

export default function PatternsPage() {
  const { t } = useT();
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";

  const [reference, setReference] = useState<ReferenceDoc | null>(null);
  const [form, setForm] = useState<BloodGasFormValues>(
    makeEmptyBloodGasFormValues(),
  );

  useEffect(() => {
    let active = true;

    async function loadReference() {
      const data = await getReference("bg_patterns");
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

  const patterns = useMemo(
    () => findBloodGasPatterns(values).map((code) => t(code as Key)),
    [values, t],
  );

  const fallbackSources = [
    {
      id: "bg-patterns-fallback-1",
      title: t("bg_patterns_source_fallback_1_title"),
      subtitle: t("bg_patterns_source_fallback_1_sub"),
    },
    {
      id: "bg-patterns-fallback-2",
      title: t("bg_patterns_source_fallback_2_title"),
      subtitle: t("bg_patterns_source_fallback_2_sub"),
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
        <BloodGasPageHeader title={t("tool_bg_patterns_title")} subtitle={t("tool_bg_patterns_desc")} />

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <BloodGasInputCard
            values={form}
            onChange={handleChange}
            fields={PATTERN_FIELDS}
            title={lang === "da" ? "Blodgas- og laboratorieværdier" : "Blood gas and laboratory values"}
          />

          <Card>
            <Title>{t("result")}</Title>

            {patterns.length === 0 ? (
              <Text
                style={{
                  color: theme.colors.mutedText,
                  marginTop: 10,
                  lineHeight: 20,
                }}
              >
                {t("bg_patterns_enter_values")}
              </Text>
            ) : (
              <ResultSection label={lang === "da" ? "Understøttende fund" : "Supporting findings"} tone="caution">
              <View style={{ gap: 8 }}>
                {patterns.map((pattern, i) => (
                  <Text
                    key={`${pattern}-${i}`}
                    style={{
                      color: theme.colors.mutedText,
                      lineHeight: 20,
                    }}
                  >
                    • {pattern}
                  </Text>
                ))}
              </View>
              </ResultSection>
            )}
          </Card>

          <CollapsibleCard
            title={t("tool_disclaimer_title")}
            subtitle={
              reference?.disclaimer[lang] ?? t("bg_patterns_disclaimer")
            }
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
                {reference?.disclaimer[lang] ?? t("bg_patterns_disclaimer")}
              </Text>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title={t("tool_sources_title")}
            subtitle={
              reference?.sourcesSub[lang] ?? t("bg_patterns_sources_sub")
            }
          >
            <Subtle style={{ marginBottom: 8 }}>
              {reference?.sourcesSub[lang] ?? t("bg_patterns_sources_sub")}
            </Subtle>

            <View style={{ marginTop: 8 }}>
              {renderedSources.map((source) => (
                <SourceItem
                  key={source.id}
                  title={source.title}
                  subtitle={source.subtitle}
                  url={source.url}
                />
              ))}
            </View>
          </CollapsibleCard>
        </ScrollView>
      </Screen>
    </Background>
  );
}
