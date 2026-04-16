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

type Interpretation = {
  summary: string;
  detail: string;
  compensation: string;
  severity?: string;
};

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

  const result = useMemo<Interpretation | null>(() => {
    const pH = values.ph;
    const pCO2 = values.pco2;
    const HCO3 = values.hco3;
    const BE = values.be;

    if (pH === undefined || pCO2 === undefined || HCO3 === undefined) {
      return null;
    }

    const acidotic = pH < 7.35;
    const alkalotic = pH > 7.45;

    let summary = "";
    let detail = "";
    let compensation = "";
    let severity = "";

    if (acidotic) {
      if (pCO2 > 6 && HCO3 >= 22) {
        summary = t("bg_acidbase_resp_acidosis_title");
        detail = t("bg_acidbase_resp_acidosis_body");
        compensation =
          HCO3 > 26 || (BE !== undefined && BE > 2)
            ? t("bg_acidbase_comp_metabolic_present")
            : t("bg_acidbase_comp_metabolic_limited");
      } else if (HCO3 < 22 || (BE !== undefined && BE < -3)) {
        if (pCO2 > 6) {
          summary = t("bg_acidbase_mixed_acidosis_title");
          detail = t("bg_acidbase_mixed_acidosis_body");
          compensation = t("bg_acidbase_mixed_compensation");
        } else {
          summary = t("bg_acidbase_met_acidosis_title");
          detail = t("bg_acidbase_met_acidosis_body");
          compensation =
            pCO2 < 4.5
              ? t("bg_acidbase_comp_respiratory_present")
              : t("bg_acidbase_comp_respiratory_limited");
        }
      } else {
        summary = t("bg_acidbase_unclear_acidosis_title");
        detail = t("bg_acidbase_unclear_acidosis_body");
        compensation = t("bg_acidbase_verify_context");
      }
    } else if (alkalotic) {
      if (pCO2 < 4.5 && HCO3 <= 26) {
        summary = t("bg_acidbase_resp_alkalosis_title");
        detail = t("bg_acidbase_resp_alkalosis_body");
        compensation =
          HCO3 < 22 || (BE !== undefined && BE < -3)
            ? t("bg_acidbase_comp_metabolic_present")
            : t("bg_acidbase_comp_metabolic_limited");
      } else if (HCO3 > 26 || (BE !== undefined && BE > 3)) {
        if (pCO2 < 4.5) {
          summary = t("bg_acidbase_mixed_alkalosis_title");
          detail = t("bg_acidbase_mixed_alkalosis_body");
          compensation = t("bg_acidbase_mixed_compensation");
        } else {
          summary = t("bg_acidbase_met_alkalosis_title");
          detail = t("bg_acidbase_met_alkalosis_body");
          compensation =
            pCO2 > 6
              ? t("bg_acidbase_comp_respiratory_present")
              : t("bg_acidbase_comp_respiratory_limited");
        }
      } else {
        summary = t("bg_acidbase_unclear_alkalosis_title");
        detail = t("bg_acidbase_unclear_alkalosis_body");
        compensation = t("bg_acidbase_verify_context");
      }
    } else {
      if (pCO2 > 6 && (HCO3 > 26 || (BE !== undefined && BE > 2))) {
        summary = t("bg_acidbase_comp_resp_acidosis_title");
        detail = t("bg_acidbase_comp_resp_acidosis_body");
        compensation = t("bg_acidbase_compensated_note");
      } else if (pCO2 < 4.5 && (HCO3 < 22 || (BE !== undefined && BE < -3))) {
        summary = t("bg_acidbase_comp_resp_alkalosis_title");
        detail = t("bg_acidbase_comp_resp_alkalosis_body");
        compensation = t("bg_acidbase_compensated_note");
      } else {
        summary = t("bg_acidbase_near_normal_title");
        detail = t("bg_acidbase_near_normal_body");
        compensation = t("bg_acidbase_verify_context");
      }
    }

    if (pH < 7.2) severity = t("bg_acidbase_severe_acidemia");
    if (pH > 7.55) severity = t("bg_acidbase_severe_alkalemia");

    return { summary, detail, compensation, severity };
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
