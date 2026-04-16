import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { useT } from "../../../../src/i18n/useT";
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

  const patterns = useMemo(() => {
    const findings: string[] = [];

    const {
      ph,
      pco2,
      po2,
      hco3,
      be,
      so2,
      na,
      glucose,
      lactate,
      urea,
      creatinine,
    } = values;

    const hasAnyInput = Object.values(values).some((v) => v !== undefined);
    if (!hasAnyInput) return findings;

    if (
      ph !== undefined &&
      hco3 !== undefined &&
      glucose !== undefined &&
      ph < 7.3 &&
      hco3 < 18 &&
      glucose > 11
    ) {
      findings.push(t("bg_pattern_dka"));
    }

    if (
      glucose !== undefined &&
      glucose > 30 &&
      (ph === undefined || ph >= 7.3) &&
      (hco3 === undefined || hco3 >= 18)
    ) {
      findings.push(t("bg_pattern_hhs"));
    }

    if (lactate !== undefined && lactate > 2) {
      findings.push(t("bg_pattern_lactate_elevated"));
    }

    if (lactate !== undefined && lactate > 4) {
      findings.push(t("bg_pattern_lactate_high"));
    }

    if (
      lactate !== undefined &&
      glucose !== undefined &&
      lactate > 2 &&
      glucose > 7 &&
      (ph === undefined || ph >= 7.35)
    ) {
      findings.push(t("bg_pattern_dehydration"));
    }

    if (ph !== undefined && pco2 !== undefined && ph < 7.35 && pco2 > 6) {
      findings.push(t("bg_pattern_respiratory_acidosis"));
    }

    if (
      ph !== undefined &&
      hco3 !== undefined &&
      (hco3 < 22 || (be !== undefined && be < -3)) &&
      ph < 7.35
    ) {
      findings.push(t("bg_pattern_metabolic_acidosis"));
    }

    if (na !== undefined && na < 130) {
      findings.push(t("bg_pattern_hyponatremia"));
    }

    if (po2 !== undefined && po2 < 8) {
      findings.push(t("bg_pattern_hypoxemia"));
    }

    if (so2 !== undefined && so2 < 90) {
      findings.push(t("bg_pattern_low_so2"));
    }

    if (
      creatinine !== undefined &&
      creatinine > 110 &&
      urea !== undefined &&
      urea > 8
    ) {
      findings.push(t("bg_pattern_renal_impairment"));
    }

    return findings;
  }, [values, t]);

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

  const renderedSources =
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
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("tool_bg_patterns_title")}</Title>
          <Subtle>{t("tool_bg_patterns_desc")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <BloodGasInputCard
            values={form}
            onChange={handleChange}
            fields={PATTERN_FIELDS}
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
              <View style={{ gap: 8, marginTop: 10 }}>
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
