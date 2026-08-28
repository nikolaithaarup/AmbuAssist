import Constants from "expo-constants";
import { useState, type ReactNode } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../i18n/useT";
import { Background } from "../../ui/Background";
import { ToolPageHeader, ToolSurface } from "../../ui/ToolSurface";
import { Screen, Subtle } from "../../ui/Ui";
import { theme } from "../../ui/theme";

export type AboutSupportSection = "about" | "medical" | "contact" | "limitations" | "app";

const SUPPORT_EMAIL = "nikolai_91@live.com";

function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 9 }}>
      <Text style={{ color: theme.colors.accentMuted, lineHeight: 21 }}>•</Text>
      <Text
        style={{
          flex: 1,
          color: theme.colors.text,
          fontSize: 14,
          lineHeight: 21,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        color: theme.colors.text,
        fontSize: 15,
        lineHeight: 20,
        fontWeight: "900",
        marginTop: 5,
      }}
    >
      {children}
    </Text>
  );
}

function Body({ children }: { children: ReactNode }) {
  return (
    <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21 }}>
      {children}
    </Text>
  );
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        borderRadius: 13,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.warn,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "rgba(221,189,98,0.08)",
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21 }}>
        {children}
      </Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
      }}
    >
      <Subtle>{label}</Subtle>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 14,
          lineHeight: 20,
          fontWeight: "800",
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function SupportSection({
  id,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  id: AboutSupportSection;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <View
      testID={`about-support-section-${id}`}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={({ pressed }) => ({
          minHeight: 60,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 12,
          paddingHorizontal: 3,
          opacity: pressed ? 0.72 : 1,
        })}
      >
        <View style={{ flex: 1, gap: 3 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 17,
              lineHeight: 21,
              fontWeight: "900",
            }}
          >
            {title}
          </Text>
          {!open ? <Subtle>{subtitle}</Subtle> : null}
        </View>
        <Text
          accessibilityElementsHidden
          style={{ color: theme.colors.accentMuted, fontSize: 20 }}
        >
          {open ? "⌄" : "›"}
        </Text>
      </Pressable>
      {open ? (
        <View style={{ gap: 10, paddingBottom: 18, paddingHorizontal: 3 }}>
          {children}
        </View>
      ) : null}
    </View>
  );
}

export function AboutSupportScreen({
  initialSection,
}: {
  initialSection?: AboutSupportSection;
}) {
  const { t } = useT();
  const appVersion = Constants.expoConfig?.version ?? "unknown";
  const [openSection, setOpenSection] = useState<AboutSupportSection | null>(
    initialSection ?? null,
  );

  const openEmail = async () => {
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
    const detailedUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(
        (await Linking.canOpenURL(detailedUrl))
          ? detailedUrl
          : `mailto:${SUPPORT_EMAIL}`,
      );
    } catch {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    }
  };

  return (
    <Background>
      <Screen>
        <ScrollView
          contentContainerStyle={{ gap: 12, paddingBottom: 28 }}
          keyboardShouldPersistTaps="handled"
        >
          <ToolPageHeader title={t("about_support_title")} subtitle={t("about_support_sub")} />

          <ToolSurface style={{ paddingVertical: 0, paddingHorizontal: 14, gap: 0 }}>
            <SupportSection
              id="about"
              title={t("about_what_title")}
              subtitle={t("about_sub")}
              open={openSection === "about"}
              onToggle={() => setOpenSection((current) => current === "about" ? null : "about")}
            >
              <Body>{t("about_what_body")}</Body>
              <SectionHeading>{t("about_purpose_title")}</SectionHeading>
              <Bullet>{t("about_purpose_1")}</Bullet>
              <Bullet>{t("about_purpose_2")}</Bullet>
              <Bullet>{t("about_purpose_3")}</Bullet>
              <SectionHeading>{t("about_design_title")}</SectionHeading>
              <Bullet>{t("about_design_1")}</Bullet>
              <Bullet>{t("about_design_2")}</Bullet>
              <Bullet>{t("about_design_3")}</Bullet>
              <Bullet>{t("about_design_4")}</Bullet>
              <SectionHeading>{t("about_feedback_title")}</SectionHeading>
              <Body>{t("about_feedback_body")}</Body>
            </SupportSection>

            <SupportSection
              id="medical"
              title={t("meddisc_title")}
              subtitle={t("meddisc_sub")}
              open={openSection === "medical"}
              onToggle={() => setOpenSection((current) => current === "medical" ? null : "medical")}
            >
              <SectionHeading>{t("meddisc_section_use_title")}</SectionHeading>
              <Bullet>{t("meddisc_use_1")}</Bullet>
              <Bullet>{t("meddisc_use_2")}</Bullet>
              <Bullet>{t("meddisc_use_3")}</Bullet>
              <Bullet>{t("meddisc_use_4")}</Bullet>
              <SectionHeading>{t("meddisc_section_users_title")}</SectionHeading>
              <Bullet>{t("meddisc_users_1")}</Bullet>
              <Bullet>{t("meddisc_users_2")}</Bullet>
              <Bullet>{t("meddisc_users_3")}</Bullet>
              <SectionHeading>{t("meddisc_section_warning_title")}</SectionHeading>
              <Warning>{t("meddisc_warning_body")}</Warning>
              <SectionHeading>{t("meddisc_section_method_title")}</SectionHeading>
              <Bullet>{t("meddisc_method_1")}</Bullet>
              <Bullet>{t("meddisc_method_2")}</Bullet>
              <Bullet>{t("meddisc_method_3")}</Bullet>
              <Bullet>{t("meddisc_method_4")}</Bullet>
              <SectionHeading>{t("meddisc_section_sources_title")}</SectionHeading>
              <Body>{t("meddisc_sources_body")}</Body>
              <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                {t("meddisc_sources_note_title")}
              </Text>
              <Subtle>{t("meddisc_sources_note_body")}</Subtle>
              <SectionHeading>{t("meddisc_section_region_title")}</SectionHeading>
              <Bullet>{t("meddisc_region_1")}</Bullet>
              <Bullet>{t("meddisc_region_2")}</Bullet>
              <Bullet>{t("meddisc_region_3")}</Bullet>
              <SectionHeading>{t("meddisc_section_emergency_title")}</SectionHeading>
              <Body>{t("meddisc_emergency_body")}</Body>
              <SectionHeading>{t("meddisc_section_updates_title")}</SectionHeading>
              <Bullet>{t("meddisc_updates_1")}</Bullet>
              <Bullet>{t("meddisc_updates_2")}</Bullet>
              <Bullet>{t("meddisc_updates_3")}</Bullet>
              <Subtle style={{ textAlign: "center", marginTop: 4 }}>
                {t("meddisc_footer")}
              </Subtle>
            </SupportSection>

            <SupportSection
              id="contact"
              title={t("contact_title")}
              subtitle={t("contact_sub")}
              open={openSection === "contact"}
              onToggle={() => setOpenSection((current) => current === "contact" ? null : "contact")}
            >
              <SectionHeading>{t("contact_getintouch_title")}</SectionHeading>
              <Body>{t("contact_getintouch_body")}</Body>
              <Subtle>{t("contact_support_email_label")}</Subtle>
              <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                {SUPPORT_EMAIL}
              </Text>
              <Pressable
                testID="about-support-email"
                accessibilityRole="link"
                accessibilityLabel={t("contact_email_button")}
                onPress={() => void openEmail()}
                style={({ pressed }) => ({
                  minHeight: 48,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 14,
                  backgroundColor: pressed
                    ? "rgba(145,169,108,0.24)"
                    : theme.colors.accentSurface,
                  opacity: pressed ? 0.82 : 1,
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  {t("contact_email_button")}
                </Text>
              </Pressable>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <Pressable
                  testID="about-support-report-error"
                  accessibilityRole="link"
                  accessibilityLabel={t("contact_report_error")}
                  onPress={() => void openEmail()}
                  style={({ pressed }) => ({ minHeight: 48, flexGrow: 1, flexBasis: "46%", borderRadius: 14, borderWidth: 1, borderColor: theme.colors.cardBorder, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, opacity: pressed ? 0.72 : 1 })}
                >
                  <Text style={{ color: theme.colors.accentMuted, fontWeight: "900", textAlign: "center" }}>{t("contact_report_error")}</Text>
                </Pressable>
                <Pressable
                  testID="about-support-suggest-improvement"
                  accessibilityRole="link"
                  accessibilityLabel={t("contact_suggest_improvement")}
                  onPress={() => void openEmail()}
                  style={({ pressed }) => ({ minHeight: 48, flexGrow: 1, flexBasis: "46%", borderRadius: 14, borderWidth: 1, borderColor: theme.colors.cardBorder, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, opacity: pressed ? 0.72 : 1 })}
                >
                  <Text style={{ color: theme.colors.accentMuted, fontWeight: "900", textAlign: "center" }}>{t("contact_suggest_improvement")}</Text>
                </Pressable>
              </View>
              <SectionHeading>{t("contact_include_title")}</SectionHeading>
              <Bullet>{t("contact_include_1")}</Bullet>
              <Bullet>{t("contact_include_2")}</Bullet>
              <Bullet>{t("contact_include_3")}</Bullet>
              <Bullet>{t("contact_include_4")}</Bullet>
              <Bullet>{t("contact_include_5")}</Bullet>
              <SectionHeading>{t("contact_medical_title")}</SectionHeading>
              <Body>{t("contact_medical_body")}</Body>
              <Warning>{t("contact_medical_warning")}</Warning>
              <SectionHeading>{t("contact_suggestions_title")}</SectionHeading>
              <Bullet>{t("contact_suggestions_1")}</Bullet>
              <Bullet>{t("contact_suggestions_2")}</Bullet>
              <Bullet>{t("contact_suggestions_3")}</Bullet>
              <Bullet>{t("contact_suggestions_4")}</Bullet>
            </SupportSection>

            <SupportSection
              id="limitations"
              title={t("about_limit_title")}
              subtitle={t("about_limit_sub")}
              open={openSection === "limitations"}
              onToggle={() => setOpenSection((current) => current === "limitations" ? null : "limitations")}
            >
              <Warning>{t("about_limit_body")}</Warning>
              <Body>{t("meddisc_emergency_body")}</Body>
            </SupportSection>

            <SupportSection
              id="app"
              title={t("about_info_title")}
              subtitle={t("about_info_sub")}
              open={openSection === "app"}
              onToggle={() => setOpenSection((current) => current === "app" ? null : "app")}
            >
              <InfoRow label={t("about_info_name")} value="AmbuAssist" />
              <InfoRow label={t("about_info_version")} value={appVersion} />
              <InfoRow
                label={t("about_info_use")}
                value={t("about_info_use_value")}
              />
              <InfoRow
                label={t("about_info_focus")}
                value={t("about_info_focus_value")}
              />
            </SupportSection>
          </ToolSurface>
        </ScrollView>
      </Screen>
    </Background>
  );
}
