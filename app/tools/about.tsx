// app/tools/about.tsx
import { ScrollView, Text, View } from "react-native";
import { useT } from "../../src/i18n/useT";
import { Background } from "../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";

const APP_VERSION = "1.0.0";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: "900",
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 15,
          lineHeight: 20,
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
        {children}
      </Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
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
          color: theme.colors.mutedText,
          fontSize: 12,
          lineHeight: 16,
          marginBottom: 3,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: "800",
          lineHeight: 18,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function AboutPage() {
  const { t } = useT();

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("about_title")}</Title>
          <Subtle>{t("about_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            <SectionTitle>{t("about_what_title")}</SectionTitle>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {t("about_what_body")}
            </Text>
          </Card>

          <Card>
            <SectionTitle>{t("about_purpose_title")}</SectionTitle>

            <Bullet>{t("about_purpose_1")}</Bullet>
            <Bullet>{t("about_purpose_2")}</Bullet>
            <Bullet>{t("about_purpose_3")}</Bullet>
          </Card>

          <Card>
            <SectionTitle>{t("about_limit_title")}</SectionTitle>

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
                {t("about_limit_body")}
              </Text>
            </View>
          </Card>

          <Card>
            <SectionTitle>{t("about_info_title")}</SectionTitle>

            <InfoRow label={t("about_info_name")} value="AmbuAssist" />
            <InfoRow label={t("about_info_version")} value={APP_VERSION} />
            <InfoRow
              label={t("about_info_use")}
              value={t("about_info_use_value")}
            />
            <InfoRow
              label={t("about_info_focus")}
              value={t("about_info_focus_value")}
            />
          </Card>

          <Card>
            <SectionTitle>{t("about_design_title")}</SectionTitle>

            <Bullet>{t("about_design_1")}</Bullet>
            <Bullet>{t("about_design_2")}</Bullet>
            <Bullet>{t("about_design_3")}</Bullet>
            <Bullet>{t("about_design_4")}</Bullet>
          </Card>

          <Card>
            <SectionTitle>{t("about_feedback_title")}</SectionTitle>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {t("about_feedback_body")}
            </Text>
          </Card>
        </ScrollView>
      </Screen>
    </Background>
  );
}
