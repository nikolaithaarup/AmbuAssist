import { ScrollView, Text, View } from "react-native";
import { useT } from "../../src/i18n/useT";
import { Background } from "../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";

function Bullet({ text }: { text: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          lineHeight: 22,
          marginTop: 1,
        }}
      >
        •
      </Text>

      <Text
        style={{
          color: theme.colors.text,
          fontSize: 14,
          lineHeight: 20,
          flex: 1,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function InfoBox({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warning";
}) {
  const backgroundColor =
    tone === "warning" ? "rgba(255,209,102,0.10)" : "rgba(255,255,255,0.04)";

  return (
    <View
      style={{
        marginTop: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        padding: 12,
        backgroundColor,
        gap: 10,
      }}
    >
      {children}
    </View>
  );
}

export default function MedicalDisclaimer() {
  const { t } = useT();

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("meddisc_title")}</Title>
          <Subtle>{t("meddisc_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            <Title>{t("meddisc_section_use_title")}</Title>

            <View style={{ gap: 10, marginTop: 10 }}>
              <Bullet text={t("meddisc_use_1")} />
              <Bullet text={t("meddisc_use_2")} />
              <Bullet text={t("meddisc_use_3")} />
              <Bullet text={t("meddisc_use_4")} />
            </View>
          </Card>

          <Card>
            <Title>{t("meddisc_section_users_title")}</Title>

            <View style={{ gap: 10, marginTop: 10 }}>
              <Bullet text={t("meddisc_users_1")} />
              <Bullet text={t("meddisc_users_2")} />
              <Bullet text={t("meddisc_users_3")} />
            </View>
          </Card>

          <Card>
            <Title>{t("meddisc_section_warning_title")}</Title>

            <InfoBox tone="warning">
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  lineHeight: 20,
                  fontWeight: "800",
                }}
              >
                {t("meddisc_warning_body")}
              </Text>
            </InfoBox>
          </Card>

          <Card>
            <Title>{t("meddisc_section_method_title")}</Title>

            <View style={{ gap: 10, marginTop: 10 }}>
              <Bullet text={t("meddisc_method_1")} />
              <Bullet text={t("meddisc_method_2")} />
              <Bullet text={t("meddisc_method_3")} />
              <Bullet text={t("meddisc_method_4")} />
            </View>
          </Card>

          <Card>
            <Title>{t("meddisc_section_sources_title")}</Title>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 14,
                lineHeight: 20,
                marginTop: 10,
              }}
            >
              {t("meddisc_sources_body")}
            </Text>

            <InfoBox>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  lineHeight: 20,
                  fontWeight: "800",
                }}
              >
                {t("meddisc_sources_note_title")}
              </Text>

              <Text
                style={{
                  color: theme.colors.mutedText,
                  fontSize: 13,
                  lineHeight: 19,
                }}
              >
                {t("meddisc_sources_note_body")}
              </Text>
            </InfoBox>
          </Card>

          <Card>
            <Title>{t("meddisc_section_region_title")}</Title>

            <View style={{ gap: 10, marginTop: 10 }}>
              <Bullet text={t("meddisc_region_1")} />
              <Bullet text={t("meddisc_region_2")} />
              <Bullet text={t("meddisc_region_3")} />
            </View>
          </Card>

          <Card>
            <Title>{t("meddisc_section_emergency_title")}</Title>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 14,
                lineHeight: 20,
                marginTop: 10,
              }}
            >
              {t("meddisc_emergency_body")}
            </Text>
          </Card>

          <Card>
            <Title>{t("meddisc_section_updates_title")}</Title>

            <View style={{ gap: 10, marginTop: 10 }}>
              <Bullet text={t("meddisc_updates_1")} />
              <Bullet text={t("meddisc_updates_2")} />
              <Bullet text={t("meddisc_updates_3")} />
            </View>
          </Card>

          <Subtle style={{ textAlign: "center", marginTop: 4 }}>
            {t("meddisc_footer")}
          </Subtle>
        </ScrollView>
      </Screen>
    </Background>
  );
}
