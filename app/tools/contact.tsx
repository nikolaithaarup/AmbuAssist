// app/tools/contact.tsx
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../src/i18n/useT";
import { Background } from "../../src/ui/Background";
import { Card, Screen, Subtle, Title } from "../../src/ui/Ui";
import { theme } from "../../src/ui/theme";

const SUPPORT_EMAIL = "nikolai_91@live.com";

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

function ActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View
        style={{
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.colors.cardBorder,
          backgroundColor: "rgba(220,220,220,0.18)",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontWeight: "900",
            fontSize: 14,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ContactPage() {
  const { t } = useT();

  async function openEmail() {
    const subject = encodeURIComponent(t("contact_email_subject"));
    const body = encodeURIComponent(
      [
        t("contact_email_body_greeting"),
        "",
        t("contact_email_body_intro"),
        "",
        `${t("contact_email_body_tool")}:`,
        `${t("contact_email_body_happened")}:`,
        `${t("contact_email_body_expected")}:`,
        `${t("contact_email_body_language")}:`,
        `${t("contact_email_body_device")}:`,
        `${t("contact_email_body_version")}:`,
        "",
        `${t("contact_email_body_notes")}:`,
      ].join("\n"),
    );

    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
      }
    } catch {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    }
  }

  return (
    <Background>
      <Screen>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Title>{t("contact_title")}</Title>
          <Subtle>{t("contact_sub")}</Subtle>
        </View>

        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Card>
            <SectionTitle>{t("contact_getintouch_title")}</SectionTitle>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 14,
                lineHeight: 20,
                marginBottom: 10,
              }}
            >
              {t("contact_getintouch_body")}
            </Text>

            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                padding: 12,
                backgroundColor: "rgba(0,0,0,0.10)",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: theme.colors.mutedText,
                  fontSize: 12,
                  lineHeight: 18,
                  marginBottom: 4,
                }}
              >
                {t("contact_support_email_label")}
              </Text>

              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 15,
                  fontWeight: "900",
                }}
              >
                {SUPPORT_EMAIL}
              </Text>
            </View>

            <ActionButton
              label={t("contact_email_button")}
              onPress={openEmail}
            />
          </Card>

          <Card>
            <SectionTitle>{t("contact_include_title")}</SectionTitle>

            <Bullet>{t("contact_include_1")}</Bullet>
            <Bullet>{t("contact_include_2")}</Bullet>
            <Bullet>{t("contact_include_3")}</Bullet>
            <Bullet>{t("contact_include_4")}</Bullet>
            <Bullet>{t("contact_include_5")}</Bullet>
          </Card>

          <Card>
            <SectionTitle>{t("contact_medical_title")}</SectionTitle>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 14,
                lineHeight: 20,
                marginBottom: 10,
              }}
            >
              {t("contact_medical_body")}
            </Text>

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
                {t("contact_medical_warning")}
              </Text>
            </View>
          </Card>

          <Card>
            <SectionTitle>{t("contact_suggestions_title")}</SectionTitle>

            <Bullet>{t("contact_suggestions_1")}</Bullet>
            <Bullet>{t("contact_suggestions_2")}</Bullet>
            <Bullet>{t("contact_suggestions_3")}</Bullet>
            <Bullet>{t("contact_suggestions_4")}</Bullet>
          </Card>
        </ScrollView>
      </Screen>
    </Background>
  );
}
