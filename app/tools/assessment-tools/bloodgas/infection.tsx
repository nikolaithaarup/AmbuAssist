import { useEffect, useMemo, useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";

import { useT } from "../../../../src/i18n/useT";
import { useSettings } from "../../../../src/state/settings";
import {
  getReference,
  type ReferenceDoc,
} from "../../../../src/services/referenceService";
import { Background } from "../../../../src/ui/Background";
import { CollapsibleCard } from "../../../../src/ui/CollapsibleCard";
import { Card, Row, Screen, Subtle, Title } from "../../../../src/ui/Ui";
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

  const results = useMemo(() => {
    const findings: string[] = [];
    const { crp, lactate, glucose } = values;

    const hasAnyInput =
      crp !== undefined ||
      lactate !== undefined ||
      glucose !== undefined ||
      nitrite ||
      leukocytes;

    if (!hasAnyInput) return findings;

    if (crp !== undefined) {
      if (crp > 100) {
        findings.push(t("bg_infection_crp_high"));
      } else if (crp > 50) {
        findings.push(t("bg_infection_crp_moderate"));
      }
    }

    if (lactate !== undefined && lactate > 2) {
      findings.push(t("bg_infection_lactate_elevated"));
    }

    if (glucose !== undefined && glucose > 11) {
      findings.push(t("bg_infection_stress_hyperglycemia"));
    }

    if (nitrite && leukocytes) {
      findings.push(t("bg_infection_uti_pattern"));
    } else if (leukocytes) {
      findings.push(t("bg_infection_leukocytes_only"));
    } else if (nitrite) {
      findings.push(t("bg_infection_nitrite_only"));
    }

    return findings;
  }, [values, nitrite, leukocytes, t]);

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
          <Title>{t("tool_bg_infection_title")}</Title>
          <Subtle>{t("tool_bg_infection_desc")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <BloodGasInputCard
            values={form}
            onChange={handleChange}
            fields={INFECTION_FIELDS}
          />

          <Card>
            <View style={{ gap: 14 }}>
              <Row
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                  {t("bg_label_nitrite")}
                </Text>
                <Switch value={nitrite} onValueChange={setNitrite} />
              </Row>

              <Row
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                  {t("bg_label_leukocytes")}
                </Text>
                <Switch value={leukocytes} onValueChange={setLeukocytes} />
              </Row>
            </View>
          </Card>

          <Card>
            <Title>{t("result")}</Title>

            {results.length === 0 ? (
              <Text
                style={{
                  color: theme.colors.mutedText,
                  marginTop: 10,
                  lineHeight: 20,
                }}
              >
                {t("bg_infection_enter_values")}
              </Text>
            ) : (
              <View style={{ gap: 8, marginTop: 10 }}>
                {results.map((r, i) => (
                  <Text
                    key={`${r}-${i}`}
                    style={{
                      color: theme.colors.mutedText,
                      lineHeight: 20,
                    }}
                  >
                    • {r}
                  </Text>
                ))}
              </View>
            )}
          </Card>

          <CollapsibleCard
            title={t("tool_disclaimer_title")}
            subtitle={
              reference?.disclaimer[lang] ?? t("bg_infection_disclaimer")
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
                {reference?.disclaimer[lang] ?? t("bg_infection_disclaimer")}
              </Text>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title={t("tool_sources_title")}
            subtitle={
              reference?.sourcesSub[lang] ?? t("bg_infection_sources_sub")
            }
          >
            <Subtle style={{ marginBottom: 8 }}>
              {reference?.sourcesSub[lang] ?? t("bg_infection_sources_sub")}
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
