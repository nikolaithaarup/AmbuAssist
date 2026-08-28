import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  getHospitalPhoneNumber,
  type HospitalPhoneNumber,
} from "../../src/dev/hospitalNumbers";
import { useT } from "../../src/i18n/useT";
import {
  getReference,
  type ReferenceDoc,
} from "../../src/services/referenceService";
import { useSettings } from "../../src/state/settings";
import { Background } from "../../src/ui/Background";
import { ClinicalDisclosure } from "../../src/ui/ClinicalDisclosure";
import { Screen, Subtle } from "../../src/ui/Ui";
import {
  ToolActionButton,
  ToolPageHeader,
  ToolResultRow,
  ToolSectionLabel,
  ToolSurface,
} from "../../src/ui/ToolSurface";
import { theme } from "../../src/ui/theme";

type ThromHospital = "RH" | "BBH";
const TROMBOLYSE_SPECIALTY_KEY = "trombolyse" as const;

function formatDateTime(date: Date, lang: "da" | "en") {
  const locale = lang === "da" ? "da-DK" : "en-GB";

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getOperationalDay(now: Date) {
  const operationalDate = new Date(now);

  if (now.getHours() < 8) {
    operationalDate.setDate(operationalDate.getDate() - 1);
  }

  return operationalDate;
}

function getResponsibleHospital(now: Date): {
  hospitalCode: ThromHospital;
  specialtyKey: typeof TROMBOLYSE_SPECIALTY_KEY;
  operationalDate: Date;
  switchAt: Date;
} {
  const operationalDate = getOperationalDay(now);
  const dayOfMonth = operationalDate.getDate();

  const hospitalCode: ThromHospital = dayOfMonth % 2 === 1 ? "RH" : "BBH";

  const switchAt = new Date(operationalDate);
  switchAt.setHours(8, 0, 0, 0);
  switchAt.setDate(switchAt.getDate() + 1);

  return {
    hospitalCode,
    specialtyKey: TROMBOLYSE_SPECIALTY_KEY,
    operationalDate,
    switchAt,
  };
}

export default function TrombolysisPage() {
  const { t } = useT();
  const { settings } = useSettings();
  const lang = settings.language === "da" ? "da" : "en";

  const [now, setNow] = useState(() => new Date());
  const [hospitalPhone, setHospitalPhone] =
    useState<HospitalPhoneNumber | null>(null);
  const [loadingHospitalPhone, setLoadingHospitalPhone] = useState(true);

  const [reference, setReference] = useState<ReferenceDoc | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => clearInterval(timer);
  }, []);

  const responsibility = useMemo(() => getResponsibleHospital(now), [now]);

  const hospitalLabel = useMemo(() => {
    return responsibility.hospitalCode === "RH"
      ? t("trombolysis_rh")
      : t("trombolysis_bbh");
  }, [responsibility.hospitalCode, t]);

  useEffect(() => {
    let active = true;

    async function loadPhone() {
      setLoadingHospitalPhone(true);

      try {
        const result = await getHospitalPhoneNumber(
          responsibility.hospitalCode,
          responsibility.specialtyKey,
        );

        if (!active) return;
        setHospitalPhone(result);
      } catch (error) {
        console.error("Error loading thrombolysis phone:", error);
        if (!active) return;
        setHospitalPhone(null);
      } finally {
        if (active) {
          setLoadingHospitalPhone(false);
        }
      }
    }

    loadPhone();

    return () => {
      active = false;
    };
  }, [responsibility]);

  useEffect(() => {
    let active = true;

    async function loadReference() {
      try {
        const result = await getReference("trombolysis");
        if (!active) return;
        setReference(result);
      } catch (error) {
        console.error("Error loading trombolysis reference:", error);
        if (!active) return;
        setReference(null);
      }
    }

    loadReference();

    return () => {
      active = false;
    };
  }, []);

  const callHospitalNumber = async (phone: string) => {
    try {
      const url = `tel:${phone}`;
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(t("trombolysis_call_error_title"), phone);
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert(
        t("trombolysis_call_error_title"),
        t("trombolysis_call_error_body"),
      );
    }
  };

  const disclaimerText =
    reference?.disclaimer?.[lang] || t("trombolysis_disclaimer");

  const sourcesSubText =
    reference?.sourcesSub?.[lang] ||
    (lang === "da"
      ? "Kildegrundlag for trombolysevisitation, kontakt og ansvarshospital."
      : "Source basis for thrombolysis destination, contact and responsible hospital.");

  const renderedSources =
    reference?.sources && reference.sources.length > 0
      ? reference.sources.map((source) => ({
          id: source.id ?? source.title?.[lang] ?? source.title?.en,
          title: source.title?.[lang] || source.title?.en || "",
          subtitle: source.subtitle?.[lang] || source.subtitle?.en || "",
          url: source.url?.[lang] || source.url?.en,
        }))
      : [
          {
            id: "trombolysis-clinical-verification",
            title:
              lang === "da"
                ? "Klinisk verifikation kræves"
                : "Clinical verification required",
            subtitle:
              lang === "da"
                ? "Resultater i dette værktøj er vejledende og skal altid verificeres mod gældende lokale instrukser, lægelig konference og klinisk vurdering."
                : "Results in this tool are advisory and must always be verified against current local protocols, medical consultation and clinical judgement.",
            url: undefined,
          },
        ];

  return (
    <Background>
      <Screen>
        <ToolPageHeader title={t("trombolysis_title")} subtitle={t("trombolysis_sub")} />

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <ToolSurface tone="accent" testID="trombolysis-primary-result">
            <ToolSectionLabel>{t("trombolysis_responsible")}</ToolSectionLabel>
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 27, lineHeight: 33 }}>
              {hospitalLabel}
            </Text>
            <View style={{ gap: 10 }}>
              {loadingHospitalPhone ? (
                <View style={{ minHeight: 58, alignItems: "center", justifyContent: "center", gap: 7 }}>
                  <ActivityIndicator />
                  <Subtle>
                    {t("trombolysis_loading_number")}
                  </Subtle>
                </View>
              ) : hospitalPhone ? (
                <>
                  <ToolResultRow label={t("trombolysis_number_label")} value={hospitalPhone.phone} prominent />

                  {hospitalPhone.specialtyKey === "main" && (
                    <Subtle>{t("trombolysis_main_fallback")}</Subtle>
                  )}

                  <ToolActionButton
                    tone="call"
                    label={t("trombolysis_call_btn")}
                    accessibilityLabel={`${t("trombolysis_call_btn")}: ${hospitalLabel}, ${hospitalPhone.phone}`}
                    onPress={() => callHospitalNumber(hospitalPhone.phone)}
                  />
                </>
              ) : (
                <Text style={{ color: theme.colors.mutedText }}>
                  {t("trombolysis_number_not_found")}
                </Text>
              )}
            </View>
          </ToolSurface>

          <ToolSurface>
            <ToolSectionLabel>{t("trombolysis_info_title")}</ToolSectionLabel>
            <ToolResultRow label={t("trombolysis_current_time")} value={formatDateTime(now, lang)} />
            <ToolResultRow label={t("trombolysis_next_switch")} value={formatDateTime(responsibility.switchAt, lang)} />
            <Subtle style={{ lineHeight: 19 }}>{t("trombolysis_rule")}</Subtle>
          </ToolSurface>

          <ClinicalDisclosure
            disclaimer={disclaimerText}
            sourcesIntro={sourcesSubText}
            sources={renderedSources}
          />
        </ScrollView>
      </Screen>
    </Background>
  );
}
