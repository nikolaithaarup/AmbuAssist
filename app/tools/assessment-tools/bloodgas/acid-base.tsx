import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { useT } from "../../../../src/i18n/useT";
import type { Key } from "../../../../src/i18n/strings";
import { interpretAcidBase } from "../../../../src/domain/bloodgas/acidBase";
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

const ACID_BASE_FIELDS: BloodGasFieldKey[] = ["ph", "pco2", "hco3", "be"];

export default function AcidBasePage() {
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
      const data = await getReference("bg_acidbase");
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

  const result = useMemo(() => {
    const interpretation = interpretAcidBase(values);
    if (!interpretation) return null;
    return {
      summary: t(interpretation.summaryCode as Key),
      detail: t(interpretation.detailCode as Key),
      compensation: t(interpretation.compensationCode as Key),
      severity: interpretation.severityCode
        ? t(interpretation.severityCode as Key)
        : "",
    };
  }, [values, t]);

  const fallbackSources = [
    {
      id: "bg-acidbase-fallback-1",
      title: t("bg_acidbase_source_fallback_1_title"),
      subtitle: t("bg_acidbase_source_fallback_1_sub"),
    },
    {
      id: "bg-acidbase-fallback-2",
      title: t("bg_acidbase_source_fallback_2_title"),
      subtitle: t("bg_acidbase_source_fallback_2_sub"),
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
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("tool_bg_acidbase_title")}</Title>
          <Subtle>{t("tool_bg_acidbase_desc")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <BloodGasInputCard
            values={form}
            onChange={handleChange}
            fields={ACID_BASE_FIELDS}
          />

          <Card>
            <Title>{t("result")}</Title>

            {!result ? (
              <Text
                style={{
                  color: theme.colors.mutedText,
                  marginTop: 10,
                  lineHeight: 20,
                }}
              >
                {t("bg_acidbase_enter_values")}
              </Text>
            ) : (
              <View style={{ gap: 10, marginTop: 10 }}>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 18,
                  }}
                >
                  {result.summary}
                </Text>

                {!!result.severity && (
                  <Text style={{ color: theme.colors.warn, fontWeight: "800" }}>
                    {result.severity}
                  </Text>
                )}

                <Text style={{ color: theme.colors.mutedText, lineHeight: 20 }}>
                  {result.detail}
                </Text>

                <Text style={{ color: theme.colors.mutedText, lineHeight: 20 }}>
                  {result.compensation}
                </Text>
              </View>
            )}
          </Card>

          <CollapsibleCard
            title={t("tool_disclaimer_title")}
            subtitle={
              reference?.disclaimer[lang] ?? t("bg_acidbase_disclaimer")
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
                {reference?.disclaimer[lang] ?? t("bg_acidbase_disclaimer")}
              </Text>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title={t("tool_sources_title")}
            subtitle={
              reference?.sourcesSub[lang] ?? t("bg_acidbase_sources_sub")
            }
          >
            <Subtle style={{ marginBottom: 8 }}>
              {reference?.sourcesSub[lang] ?? t("bg_acidbase_sources_sub")}
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
