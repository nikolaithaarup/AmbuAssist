import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../../src/i18n/useT";
import { Background } from "../../../src/ui/Background";
import { CollapsibleCard } from "../../../src/ui/CollapsibleCard";
import { Card, Screen, Subtle, Title } from "../../../src/ui/Ui";
import { theme } from "../../../src/ui/theme";

type Item = {
  key: string;
  labelEn: string;
  labelDa: string;
  points: number;
};

const items: Item[] = [
  {
    key: "cancer",
    labelEn: "Active cancer (treatment ongoing / within 6 months / palliative)",
    labelDa: "Aktiv cancer (behandling igang / indenfor 6 mdr / palliativ)",
    points: 1,
  },
  {
    key: "paralysis",
    labelEn:
      "Paralysis, paresis, or immobilisation of lower extremity (cast/splint)",
    labelDa:
      "Lammelse/parese eller immobilisering af underekstremitet (gips/skinne)",
    points: 1,
  },
  {
    key: "bedridden",
    labelEn: "Bedridden ≥ 3 days OR major surgery within 4 weeks",
    labelDa: "Sengeleje ≥ 3 dage ELLER større operation indenfor 4 uger",
    points: 1,
  },
  {
    key: "tenderness",
    labelEn: "Localized tenderness along the deep venous system",
    labelDa: "Ømhed langs det dybe venesystem",
    points: 1,
  },
  {
    key: "swollen_leg",
    labelEn: "Entire leg swollen",
    labelDa: "Hævelse af hele underekstremiteten",
    points: 1,
  },
  {
    key: "calf_3cm",
    labelEn: "Calf swelling ≥ 3 cm compared with the other side",
    labelDa: "Benomkreds ≥ 3 cm større end modsatte side",
    points: 1,
  },
  {
    key: "pitting",
    labelEn: "Pitting oedema confined to the symptomatic leg",
    labelDa: "Pitting ødem (kun i symptomgivende ben)",
    points: 1,
  },
  {
    key: "collateral",
    labelEn: "Collateral superficial veins (non-varicose)",
    labelDa: "Udvidede overfladiske vener (ikke varicer)",
    points: 1,
  },
  {
    key: "previous",
    labelEn: "Previously documented DVT",
    labelDa: "Tidligere dokumenteret DVT",
    points: 1,
  },
  {
    key: "alt_dx",
    labelEn: "Alternative diagnosis at least as likely as DVT",
    labelDa: "Anden diagnose mindst lige så sandsynlig som DVT",
    points: -2,
  },
];

function classifyWells(score: number) {
  const likely = score >= 2;
  const three = score <= 0 ? "low" : score <= 2 ? "moderate" : "high";
  return { likely, three };
}

function SourceItem({ title, subtitle }: { title: string; subtitle?: string }) {
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

export default function WellsDvt() {
  const { t, lang } = useT();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const score = useMemo(() => {
    return items.reduce(
      (sum, it) => sum + (checked[it.key] ? it.points : 0),
      0,
    );
  }, [checked]);

  const result = useMemo(() => classifyWells(score), [score]);

  const threeLabel =
    result.three === "low"
      ? t("wells_three_low")
      : result.three === "moderate"
        ? t("wells_three_moderate")
        : t("wells_three_high");

  function reset() {
    setChecked({});
  }

  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <View style={{ gap: 6, marginTop: 12 }}>
            <Title>{t("wells_title")}</Title>
            <Subtle>{t("wells_sub")}</Subtle>
          </View>

          <Card>
            {items.map((it) => {
              const isOn = !!checked[it.key];
              const label = lang === "da" ? it.labelDa : it.labelEn;

              return (
                <Pressable
                  key={it.key}
                  onPress={() =>
                    setChecked((p) => ({ ...p, [it.key]: !p[it.key] }))
                  }
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "flex-start",
                    paddingVertical: 8,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      marginTop: 1,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                      backgroundColor: isOn
                        ? "rgba(140,233,154,0.28)"
                        : "transparent",
                    }}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontSize: 15,
                        fontWeight: "700",
                      }}
                    >
                      {label}
                    </Text>
                    <Text
                      style={{ color: theme.colors.mutedText, fontSize: 13 }}
                    >
                      {it.points > 0 ? `+${it.points}` : it.points}{" "}
                      {t("news2_points")}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </Card>

          <Card>
            <Title>{t("result")}</Title>
            <View style={{ gap: 6 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 18,
                  fontWeight: "900",
                }}
              >
                {t("wells_score")}: {score}
              </Text>

              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 16,
                  fontWeight: "800",
                }}
              >
                {t("wells_twoLevel")}:{" "}
                {result.likely
                  ? t("wells_result_twolevel_likely")
                  : t("wells_result_twolevel_unlikely")}
              </Text>

              <Text style={{ color: theme.colors.mutedText, fontSize: 14 }}>
                {t("wells_threeLevel")}: {threeLabel}
              </Text>

              <View
                style={{
                  marginTop: 6,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  padding: 12,
                  backgroundColor: result.likely
                    ? "rgba(255,107,107,0.12)"
                    : "rgba(140,233,154,0.10)",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 14,
                    lineHeight: 18,
                  }}
                >
                  {t("wells_clinical_reminder")}
                </Text>

                <Text
                  style={{
                    color: theme.colors.mutedText,
                    fontSize: 12,
                    lineHeight: 17,
                  }}
                >
                  {t("wells_result_disclaimer")}
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <Pressable
                  onPress={reset}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.colors.cardBorder,
                    backgroundColor: "rgba(0,0,0,0.10)",
                    alignItems: "center",
                  })}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                    {t("reset")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Card>

          <CollapsibleCard
            title={t("tool_disclaimer_title")}
            subtitle={t("wells_page_disclaimer")}
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
                {t("wells_page_disclaimer")}
              </Text>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title={t("tool_sources_title")}
            subtitle={t("wells_sources_sub")}
          >
            <Subtle style={{ marginBottom: 8 }}>
              {t("wells_sources_sub")}
            </Subtle>

            <View style={{ marginTop: 4 }}>
              <SourceItem
                title={t("wells_source_1_title")}
                subtitle={t("wells_source_1_sub")}
              />
              <SourceItem
                title={t("wells_source_2_title")}
                subtitle={t("wells_source_2_sub")}
              />
              <SourceItem
                title={t("wells_source_3_title")}
                subtitle={t("wells_source_3_sub")}
              />
            </View>
          </CollapsibleCard>
        </ScrollView>
      </Screen>
    </Background>
  );
}
