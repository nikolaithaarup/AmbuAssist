import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  calculateWellsDvtScore,
  classifyWellsDvt,
  scoreWellsDvtCriterion,
  type WellsDvtCriterion,
  type WellsDvtSelections,
} from "../../../src/domain/wells-dvt/scoring";
import {
  FixedChoiceAssessment,
  type FixedChoiceItem,
} from "../../../src/features/assessment-flow/FixedChoiceAssessment";
import { useT } from "../../../src/i18n/useT";
import { getReference, type ReferenceDoc } from "../../../src/services/referenceService";
import { useSettings } from "../../../src/state/settings";
import { Background } from "../../../src/ui/Background";
import { Screen } from "../../../src/ui/Ui";

const items: readonly { id: WellsDvtCriterion; en: string; da: string }[] = [
  { id: "cancer", en: "Active cancer (treatment ongoing / within 6 months / palliative)", da: "Aktiv cancer (behandling igang / indenfor 6 mdr / palliativ)" },
  { id: "paralysis", en: "Paralysis, paresis, or immobilisation of lower extremity (cast/splint)", da: "Lammelse/parese eller immobilisering af underekstremitet (gips/skinne)" },
  { id: "bedridden", en: "Bedridden ≥ 3 days OR major surgery within 4 weeks", da: "Sengeleje ≥ 3 dage ELLER større operation indenfor 4 uger" },
  { id: "tenderness", en: "Localized tenderness along the deep venous system", da: "Ømhed langs det dybe venesystem" },
  { id: "swollen_leg", en: "Entire leg swollen", da: "Hævelse af hele underekstremiteten" },
  { id: "calf_3cm", en: "Calf swelling ≥ 3 cm compared with the other side", da: "Benomkreds ≥ 3 cm større end modsatte side" },
  { id: "pitting", en: "Pitting oedema confined to the symptomatic leg", da: "Pitting ødem (kun i symptomgivende ben)" },
  { id: "collateral", en: "Collateral superficial veins (non-varicose)", da: "Udvidede overfladiske vener (ikke varicer)" },
  { id: "previous", en: "Previously documented DVT", da: "Tidligere dokumenteret DVT" },
  { id: "alt_dx", en: "Alternative diagnosis at least as likely as DVT", da: "Anden diagnose mindst lige så sandsynlig som DVT" },
];

export default function WellsDvt() {
  const { t } = useT();
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";
  const [reference, setReference] = useState<ReferenceDoc | null>(null);
  useEffect(() => {
    let active = true;
    getReference("wells").then((value) => { if (active) setReference(value); }).catch(() => { if (active) setReference(null); });
    return () => { active = false; };
  }, []);

  const flowItems: FixedChoiceItem<boolean>[] = items.map((item) => {
    const points = scoreWellsDvtCriterion(item.id);
    return {
      id: item.id,
      title: item[lang],
      subtitle: `${points > 0 ? "+" : ""}${points} ${t("news2_points")}`,
      choices: [
        { value: false, label: t("no") },
        { value: true, label: t("yes") },
      ],
    };
  });
  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={{ gap: 12, marginTop: 12 }}>
            <FixedChoiceAssessment
              title={t("wells_title")}
              intro={t("wells_sub")}
              items={flowItems}
              evaluate={(answers) => {
                const selections = answers as WellsDvtSelections;
                const score = calculateWellsDvtScore(selections);
                const result = classifyWellsDvt(score);
                const three = result.three === "low" ? t("wells_three_low") : result.three === "moderate" ? t("wells_three_moderate") : t("wells_three_high");
                return {
                  score: `${t("wells_score")}: ${score}`,
                  interpretation: `${t("wells_twoLevel")}: ${result.likely ? t("wells_result_twolevel_likely") : t("wells_result_twolevel_unlikely")} · ${t("wells_threeLevel")}: ${three}`,
                  supportingText: `${t("wells_clinical_reminder")}\n\n${t("wells_result_disclaimer")}`,
                };
              }}
              reference={reference}
              lang={lang}
              disclaimerTitle={t("tool_disclaimer_title")}
              sourcesTitle={t("tool_sources_title")}
            />
          </View>
        </ScrollView>
      </Screen>
    </Background>
  );
}
