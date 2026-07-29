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
import { CollapsibleCard } from "../../../../src/ui/CollapsibleCard";
import { Card, Row, Screen, Subtle, Title } from "../../../../src/ui/Ui";
import { theme } from "../../../../src/ui/theme";

import { BloodGasInputCard } from "../../../../src/features/bloodgas/BloodGasInputCard";
import { BloodGasPageHeader, BloodGasProvenance, ResultSection } from "../../../../src/features/bloodgas/BloodGasPresentation";
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
        <BloodGasPageHeader title={t("tool_bg_infection_title")} subtitle={t("tool_bg_infection_desc")} />

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <BloodGasInputCard
            values={form}
            onChange={handleChange}
            fields={INFECTION_FIELDS}
            title={lang === "da" ? "Blodprøver" : "Blood tests"}
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
              <ResultSection label={lang === "da" ? "Understøttende fund" : "Supporting findings"} tone="caution">
              <View style={{ gap: 8 }}>
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
              </ResultSection>
            )}
          </Card>

          <Card style={{ gap: 8 }}>
            <Text style={{ color: theme.colors.warn, fontWeight: "900" }}>{lang === "da" ? "CRP / infektion" : "CRP / infection"}</Text>
            <Subtle style={{ lineHeight: 20 }}>{lang === "da" ? "CRP skal vurderes sammen med klinik, vitalparametre, varighed, fokus og lokale retningslinjer. CRP alene kan ikke afgøre infektionstype eller behandlingsbehov." : "CRP must be assessed with clinical context, vital signs, duration, focus, and local guidelines. CRP alone cannot determine infection type or treatment need."}</Subtle>
          </Card>
          <BloodGasProvenance />
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
