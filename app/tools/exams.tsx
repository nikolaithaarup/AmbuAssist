import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../src/i18n/useT";
import { Background } from "../../src/ui/Background";
import { CollapsibleCard } from "../../src/ui/CollapsibleCard";
import { Card, Screen, Subtle, Title } from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";

type Exam = {
  id: string;
  titleKey: any;
  howKey: any;
  positiveKey: any;
  indicatesKey: any;
  prehospitalKey?: any;
  tags?: ("abdomen" | "cns" | "back" | "thorax" | "uro" | "ob" | "trauma")[];
};

const EXAMS: Exam[] = [
  {
    id: "mcburney",
    titleKey: "ex_mcburney_title",
    howKey: "ex_mcburney_how",
    positiveKey: "ex_mcburney_pos",
    indicatesKey: "ex_mcburney_ind",
    prehospitalKey: "ex_mcburney_pre",
    tags: ["abdomen"],
  },
  {
    id: "murphy",
    titleKey: "ex_murphy_title",
    howKey: "ex_murphy_how",
    positiveKey: "ex_murphy_pos",
    indicatesKey: "ex_murphy_ind",
    prehospitalKey: "ex_murphy_pre",
    tags: ["abdomen"],
  },
  {
    id: "blumberg",
    titleKey: "ex_blumberg_title",
    howKey: "ex_blumberg_how",
    positiveKey: "ex_blumberg_pos",
    indicatesKey: "ex_blumberg_ind",
    prehospitalKey: "ex_blumberg_pre",
    tags: ["abdomen"],
  },
  {
    id: "rovsing",
    titleKey: "ex_rovsing_title",
    howKey: "ex_rovsing_how",
    positiveKey: "ex_rovsing_pos",
    indicatesKey: "ex_rovsing_ind",
    tags: ["abdomen"],
  },
  {
    id: "psoas",
    titleKey: "ex_psoas_title",
    howKey: "ex_psoas_how",
    positiveKey: "ex_psoas_pos",
    indicatesKey: "ex_psoas_ind",
    tags: ["abdomen"],
  },
  {
    id: "obturator",
    titleKey: "ex_obturator_title",
    howKey: "ex_obturator_how",
    positiveKey: "ex_obturator_pos",
    indicatesKey: "ex_obturator_ind",
    tags: ["abdomen"],
  },
  {
    id: "brudzinski",
    titleKey: "ex_brudzinski_title",
    howKey: "ex_brudzinski_how",
    positiveKey: "ex_brudzinski_pos",
    indicatesKey: "ex_brudzinski_ind",
    prehospitalKey: "ex_brudzinski_pre",
    tags: ["cns"],
  },
  {
    id: "kernig",
    titleKey: "ex_kernig_title",
    howKey: "ex_kernig_how",
    positiveKey: "ex_kernig_pos",
    indicatesKey: "ex_kernig_ind",
    tags: ["cns"],
  },
  {
    id: "babinski",
    titleKey: "ex_babinski_title",
    howKey: "ex_babinski_how",
    positiveKey: "ex_babinski_pos",
    indicatesKey: "ex_babinski_ind",
    prehospitalKey: "ex_babinski_pre",
    tags: ["cns"],
  },
  {
    id: "dix_hallpike",
    titleKey: "ex_dix_hallpike_title",
    howKey: "ex_dix_hallpike_how",
    positiveKey: "ex_dix_hallpike_pos",
    indicatesKey: "ex_dix_hallpike_ind",
    prehospitalKey: "ex_dix_hallpike_pre",
    tags: ["cns"],
  },
  {
    id: "lasegue",
    titleKey: "ex_lasegue_title",
    howKey: "ex_lasegue_how",
    positiveKey: "ex_lasegue_pos",
    indicatesKey: "ex_lasegue_ind",
    prehospitalKey: "ex_lasegue_pre",
    tags: ["back"],
  },
  {
    id: "becks",
    titleKey: "ex_becks_title",
    howKey: "ex_becks_how",
    positiveKey: "ex_becks_pos",
    indicatesKey: "ex_becks_ind",
    prehospitalKey: "ex_becks_pre",
    tags: ["thorax"],
  },
  {
    id: "pulsus",
    titleKey: "ex_pulsus_title",
    howKey: "ex_pulsus_how",
    positiveKey: "ex_pulsus_pos",
    indicatesKey: "ex_pulsus_ind",
    tags: ["thorax"],
  },
  {
    id: "kussmaul",
    titleKey: "ex_kussmaul_title",
    howKey: "ex_kussmaul_how",
    positiveKey: "ex_kussmaul_pos",
    indicatesKey: "ex_kussmaul_ind",
    tags: ["thorax"],
  },
  {
    id: "giordano",
    titleKey: "ex_giordano_title",
    howKey: "ex_giordano_how",
    positiveKey: "ex_giordano_pos",
    indicatesKey: "ex_giordano_ind",
    tags: ["uro"],
  },
  {
    id: "ob_painless_bleeding",
    titleKey: "ex_ob_painless_bleeding_title",
    howKey: "ex_ob_painless_bleeding_how",
    positiveKey: "ex_ob_painless_bleeding_pos",
    indicatesKey: "ex_ob_painless_bleeding_ind",
    tags: ["ob"],
  },
  {
    id: "ob_boardlike_uterus",
    titleKey: "ex_ob_boardlike_uterus_title",
    howKey: "ex_ob_boardlike_uterus_how",
    positiveKey: "ex_ob_boardlike_uterus_pos",
    indicatesKey: "ex_ob_boardlike_uterus_ind",
    tags: ["ob"],
  },
  {
    id: "ob_prev_csection_pain",
    titleKey: "ex_ob_prev_csection_pain_title",
    howKey: "ex_ob_prev_csection_pain_how",
    positiveKey: "ex_ob_prev_csection_pain_pos",
    indicatesKey: "ex_ob_prev_csection_pain_ind",
    tags: ["ob"],
  },
  {
    id: "ob_no_fetal_movement",
    titleKey: "ex_ob_no_fetal_movement_title",
    howKey: "ex_ob_no_fetal_movement_how",
    positiveKey: "ex_ob_no_fetal_movement_pos",
    indicatesKey: "ex_ob_no_fetal_movement_ind",
    prehospitalKey: "ex_ob_no_fetal_movement_pre",
    tags: ["ob"],
  },
  {
    id: "battles",
    titleKey: "ex_battles_title",
    howKey: "ex_battles_how",
    positiveKey: "ex_battles_pos",
    indicatesKey: "ex_battles_ind",
    tags: ["trauma"],
  },
  {
    id: "raccoon",
    titleKey: "ex_raccoon_title",
    howKey: "ex_raccoon_how",
    positiveKey: "ex_raccoon_pos",
    indicatesKey: "ex_raccoon_ind",
    tags: ["trauma"],
  },
];

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      style={{
        color: theme.colors.mutedText,
        fontSize: 12,
        fontWeight: "800",
        marginTop: 10,
      }}
    >
      {label}
    </Text>
  );
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

export default function Exams() {
  const { t } = useT();
  const [openId, setOpenId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const order: { key: string; titleKey: any }[] = [
      { key: "abdomen", titleKey: "ex_group_abdomen" },
      { key: "cns", titleKey: "ex_group_cns" },
      { key: "back", titleKey: "ex_group_back" },
      { key: "thorax", titleKey: "ex_group_thorax" },
      { key: "uro", titleKey: "ex_group_uro" },
      { key: "ob", titleKey: "ex_group_ob" },
      { key: "trauma", titleKey: "ex_group_trauma" },
    ];

    return order
      .map((g) => ({
        ...g,
        items: EXAMS.filter((e) => e.tags?.includes(g.key as any)),
      }))
      .filter((g) => g.items.length > 0);
  }, []);

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("exams_title")}</Title>
          <Subtle>{t("exams_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          {groups.map((g) => (
            <View key={g.key} style={{ gap: 10 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 16,
                  fontWeight: "900",
                  marginTop: 6,
                }}
              >
                {t(g.titleKey)}
              </Text>

              {g.items.map((ex) => {
                const isOpen = openId === ex.id;

                return (
                  <Card key={ex.id}>
                    <Pressable
                      onPress={() =>
                        setOpenId((prev) => (prev === ex.id ? null : ex.id))
                      }
                      style={({ pressed }) => [
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        },
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <Text
                        style={{
                          color: theme.colors.text,
                          fontSize: 15,
                          fontWeight: "900",
                          flex: 1,
                        }}
                      >
                        {t(ex.titleKey)}
                      </Text>
                      <Text
                        style={{
                          color: theme.colors.mutedText,
                          fontSize: 18,
                          fontWeight: "900",
                          marginLeft: 12,
                        }}
                      >
                        {isOpen ? "−" : "+"}
                      </Text>
                    </Pressable>

                    {isOpen && (
                      <View style={{ marginTop: 10 }}>
                        <SectionLabel label={t("ex_label_how")} />
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontSize: 14,
                            lineHeight: 18,
                          }}
                        >
                          {t(ex.howKey)}
                        </Text>

                        <SectionLabel label={t("ex_label_positive")} />
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontSize: 14,
                            lineHeight: 18,
                          }}
                        >
                          {t(ex.positiveKey)}
                        </Text>

                        <SectionLabel label={t("ex_label_indicates")} />
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontSize: 14,
                            lineHeight: 18,
                          }}
                        >
                          {t(ex.indicatesKey)}
                        </Text>

                        {!!ex.prehospitalKey && (
                          <>
                            <SectionLabel label={t("ex_label_prehospital")} />
                            <Text
                              style={{
                                color: theme.colors.text,
                                fontSize: 14,
                                lineHeight: 18,
                              }}
                            >
                              {t(ex.prehospitalKey)}
                            </Text>
                          </>
                        )}

                        <View
                          style={{
                            marginTop: 12,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: theme.colors.cardBorder,
                            padding: 10,
                            backgroundColor: "rgba(0,0,0,0.10)",
                          }}
                        >
                          <Text
                            style={{
                              color: theme.colors.mutedText,
                              fontSize: 12,
                              lineHeight: 17,
                            }}
                          >
                            {t("exams_item_disclaimer")}
                          </Text>
                        </View>
                      </View>
                    )}
                  </Card>
                );
              })}
            </View>
          ))}

          <CollapsibleCard
            title={t("tool_disclaimer_title")}
            subtitle={t("exams_page_disclaimer")}
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
                {t("exams_page_disclaimer")}
              </Text>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title={t("tool_sources_title")}
            subtitle={t("exams_sources_sub")}
          >
            <Subtle style={{ marginBottom: 8 }}>
              {t("exams_sources_sub")}
            </Subtle>

            <View style={{ marginTop: 8 }}>
              <SourceItem
                title={t("exams_source_1_title")}
                subtitle={t("exams_source_1_sub")}
              />
              <SourceItem
                title={t("exams_source_2_title")}
                subtitle={t("exams_source_2_sub")}
              />
              <SourceItem
                title={t("exams_source_3_title")}
                subtitle={t("exams_source_3_sub")}
              />
            </View>
          </CollapsibleCard>
        </ScrollView>
      </Screen>
    </Background>
  );
}
