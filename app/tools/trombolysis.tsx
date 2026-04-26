import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  getHospitalPhoneNumber,
  type HospitalPhoneNumber,
} from "../../src/dev/hospitalNumbers";
import { chip } from "../../src/features/destination/ui";
import { useT } from "../../src/i18n/useT";
import {
  getReference,
  type ReferenceDoc,
} from "../../src/services/referenceService";
import { useSettings } from "../../src/state/settings";
import { Background } from "../../src/ui/Background";
import { CollapsibleCard } from "../../src/ui/CollapsibleCard";
import { Card, Row, Screen, Subtle, Title } from "../../src/ui/Ui";
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

function SourceItem({
  title,
  subtitle,
  url,
}: {
  title: string;
  subtitle?: string;
  url?: string;
}) {
  const openSource = async () => {
    if (!url) return;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Kunne ikke åbne link", url);
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert("Fejl", "Linket kunne ikke åbnes.");
    }
  };

  if (url) {
    return (
      <Pressable
        onPress={openSource}
        style={({ pressed }) => ({
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.06)",
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text
          style={{
            color: "#8ec5ff",
            fontSize: 14,
            fontWeight: "800",
            lineHeight: 18,
            textDecorationLine: "underline",
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
              marginTop: 4,
            }}
          >
            {subtitle}
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <View
      style={{
        paddingVertical: 10,
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
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
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
  const [loadingReference, setLoadingReference] = useState(true);

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
      setLoadingReference(true);

      try {
        const result = await getReference("trombolysis");
        if (!active) return;
        setReference(result);
      } catch (error) {
        console.error("Error loading trombolysis reference:", error);
        if (!active) return;
        setReference(null);
      } finally {
        if (active) {
          setLoadingReference(false);
        }
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
        <View
          style={{
            gap: 6,
            marginTop: 12,
            alignItems: "center",
          }}
        >
          <Title style={{ textAlign: "center" }}>
            {t("trombolysis_title")}
          </Title>
          <Subtle style={{ textAlign: "center" }}>
            {t("trombolysis_sub")}
          </Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            <Title>{t("trombolysis_current_title")}</Title>

            <View style={{ gap: 10, marginTop: 12 }}>
              <Row>
                <Text style={{ color: theme.colors.mutedText, width: 120 }}>
                  {t("trombolysis_current_time")}
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "800",
                    flex: 1,
                  }}
                >
                  {formatDateTime(now, lang)}
                </Text>
              </Row>

              <Row>
                <Text style={{ color: theme.colors.mutedText, width: 120 }}>
                  {t("trombolysis_responsible")}
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 20,
                    flex: 1,
                  }}
                >
                  {hospitalLabel}
                </Text>
              </Row>
            </View>
          </Card>

          <Card>
            <Title>{t("trombolysis_contact_title")}</Title>

            <View style={{ marginTop: 12, gap: 14 }}>
              {loadingHospitalPhone ? (
                <>
                  <ActivityIndicator />
                  <Text style={{ color: theme.colors.mutedText }}>
                    {t("trombolysis_loading_number")}
                  </Text>
                </>
              ) : hospitalPhone ? (
                <>
                  <Row style={{ alignItems: "flex-start" }}>
                    <Text style={{ color: theme.colors.mutedText, width: 130 }}>
                      {t("trombolysis_number_label")}
                    </Text>

                    <Text
                      style={{
                        color: theme.colors.text,
                        fontWeight: "900",
                        fontSize: 18,
                        flex: 1,
                      }}
                    >
                      {hospitalPhone.phone}
                    </Text>
                  </Row>

                  {hospitalPhone.specialtyKey === "main" && (
                    <Row style={{ alignItems: "flex-start" }}>
                      <Text
                        style={{ color: theme.colors.mutedText, width: 130 }}
                      >
                        {t("trombolysis_number_label")}
                      </Text>

                      <Text
                        style={{
                          color: theme.colors.mutedText,
                          fontSize: 12,
                          flex: 1,
                          lineHeight: 18,
                        }}
                      >
                        {t("trombolysis_main_fallback")}
                      </Text>
                    </Row>
                  )}

                  <Pressable
                    onPress={() => callHospitalNumber(hospitalPhone.phone)}
                    style={chip(false)}
                  >
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontWeight: "800",
                        textAlign: "center",
                      }}
                    >
                      {t("trombolysis_call_btn")}
                    </Text>
                  </Pressable>
                </>
              ) : (
                <Text style={{ color: theme.colors.mutedText }}>
                  {t("trombolysis_number_not_found")}
                </Text>
              )}
            </View>
          </Card>

          <Card>
            <Title>{t("trombolysis_info_title")}</Title>

            <View style={{ gap: 10, marginTop: 10 }}>
              <Text style={{ color: theme.colors.mutedText, lineHeight: 20 }}>
                {t("trombolysis_rule")}
              </Text>

              <Text style={{ color: theme.colors.mutedText, lineHeight: 20 }}>
                {t("trombolysis_next_switch")}{" "}
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {formatDateTime(responsibility.switchAt, lang)}
                </Text>
              </Text>
            </View>
          </Card>

          <CollapsibleCard
            title={t("tool_disclaimer_title")}
            subtitle={disclaimerText}
          >
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                padding: 12,
                backgroundColor: "rgba(255,209,102,0.10)",
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {disclaimerText}
              </Text>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title={t("tool_sources_title")}
            subtitle={sourcesSubText}
          >
            {loadingReference ? (
              <View style={{ gap: 10 }}>
                <ActivityIndicator />
                <Text style={{ color: theme.colors.mutedText }}>
                  {t("loading")}
                </Text>
              </View>
            ) : (
              <>
                <Subtle style={{ marginBottom: 8 }}>{sourcesSubText}</Subtle>

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
              </>
            )}
          </CollapsibleCard>
        </ScrollView>
      </Screen>
    </Background>
  );
}
