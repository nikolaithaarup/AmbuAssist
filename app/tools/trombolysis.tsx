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
import { useSettings } from "../../src/state/settings";
import { Background } from "../../src/ui/Background";
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

  // Before 08:00, thrombolysis responsibility still belongs to the previous day.
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

          <Card>
            <Title>{t("tool_disclaimer_title")}</Title>
            <Text
              style={{
                color: theme.colors.mutedText,
                marginTop: 10,
                lineHeight: 20,
              }}
            >
              {t("trombolysis_disclaimer")}
            </Text>
          </Card>
        </ScrollView>
      </Screen>
    </Background>
  );
}
