import { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../src/i18n/useT";
import { Background } from "../../src/ui/Background";
import { Screen, Subtle, Title } from "../../src/ui/Ui";
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
  return <Text style={{ color: theme.colors.mutedText, fontSize: 12, fontWeight: "700", marginTop: 9, marginBottom: 3 }}>{label}</Text>;
}

export default function Exams() {
  const { t } = useT();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const order: { key: string; titleKey: string }[] = [
      { key: "abdomen", titleKey: "ex_group_abdomen" },
      { key: "cns", titleKey: "ex_group_cns" },
      { key: "back", titleKey: "ex_group_back" },
      { key: "thorax", titleKey: "ex_group_thorax" },
      { key: "uro", titleKey: "ex_group_uro" },
      { key: "ob", titleKey: "ex_group_ob" },
      { key: "trauma", titleKey: "ex_group_trauma" },
    ];
    return order.map(group => ({
      ...group,
      items: EXAMS.filter(exam => exam.tags?.includes(group.key as NonNullable<Exam["tags"]>[number])),
    })).filter(group => group.items.length > 0);
  }, []);

  return (
    <Background>
      <Screen>
        <View style={{ gap: 4, marginTop: Platform.OS === "web" ? 0 : 12 }}>
          <Title>{t("exams_title")}</Title>
          <Subtle>{t("exams_sub")}</Subtle>
        </View>
        <ScrollView contentContainerStyle={{ gap: 0, width: "100%", maxWidth: 800, alignSelf: "center", paddingBottom: 30 }}>
          {groups.map(group => {
            const expanded = openGroup === group.key;
            return (
              <View key={group.key} style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
                <Pressable
                  testID={"exams-group-" + group.key}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  onPress={() => {
                    setOpenGroup(prev => prev === group.key ? null : group.key);
                    setOpenId(null);
                  }}
                  style={({ pressed }) => ({ minHeight: 56, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 6, paddingVertical: 12, opacity: pressed ? 0.7 : 1 })}
                >
                  <Text style={{ flex: 1, color: theme.colors.text, fontWeight: "800", fontSize: 16 }}>{t(group.titleKey as Parameters<typeof t>[0])}</Text>
                  <Text style={{ color: theme.colors.mutedText, fontSize: 13 }}>{group.items.length}</Text>
                  <Text style={{ color: theme.colors.accentMuted, fontSize: 18, width: 24, textAlign: "center" }}>{expanded ? "−" : "+"}</Text>
                </Pressable>
                {expanded ? <View testID={"exams-items-" + group.key} style={{ paddingBottom: 8 }}>
                  {group.items.map(exam => {
                    const itemOpen = openId === exam.id;
                    return <View key={exam.id} style={{ borderTopWidth: 1, borderTopColor: theme.colors.divider }}>
                      <Pressable
                        testID={"exams-item-" + exam.id}
                        accessibilityRole="button"
                        accessibilityState={{ expanded: itemOpen }}
                        onPress={() => setOpenId(prev => prev === exam.id ? null : exam.id)}
                        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 11, paddingLeft: 12, paddingRight: 6, minHeight: 48, opacity: pressed ? 0.72 : 1 })}
                      >
                        <Text style={{ flex: 1, color: theme.colors.text, fontSize: 14, fontWeight: "700" }}>{t(exam.titleKey)}</Text>
                        <Text style={{ color: theme.colors.mutedText, fontSize: 17, width: 24, textAlign: "center" }}>{itemOpen ? "−" : "+"}</Text>
                      </Pressable>
                      {itemOpen ? <View testID={"exams-detail-" + exam.id} style={{ marginLeft: 12, paddingLeft: 12, paddingBottom: 16, borderLeftWidth: 2, borderLeftColor: theme.colors.accentMuted }}>
                        <SectionLabel label={t("ex_label_how")} />
                        <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21 }}>{t(exam.howKey)}</Text>
                        <SectionLabel label={t("ex_label_positive")} />
                        <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21 }}>{t(exam.positiveKey)}</Text>
                        <SectionLabel label={t("ex_label_indicates")} />
                        <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21 }}>{t(exam.indicatesKey)}</Text>
                        {exam.prehospitalKey ? <>
                          <SectionLabel label={t("ex_label_prehospital")} />
                          <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21 }}>{t(exam.prehospitalKey)}</Text>
                        </> : null}
                      </View> : null}
                    </View>;
                  })}
                </View> : null}
              </View>
            );
          })}
          <View style={{ paddingHorizontal: 6, paddingTop: 20 }}>
            <Text testID="exams-caution" style={{ color: theme.colors.mutedText, fontSize: 12, lineHeight: 18 }}>{t("exams_page_disclaimer")}</Text>
          </View>
        </ScrollView>
      </Screen>
    </Background>
  );
}
