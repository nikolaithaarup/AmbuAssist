import Constants from "expo-constants";
import { useState, type ReactNode } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../../i18n/useT";
import { useAuth } from "../../auth/AuthProvider";
import { Background } from "../../ui/Background";
import { Screen, Subtle } from "../../ui/Ui";
import { theme } from "../../ui/theme";
import { SupportQuickActions } from "./SupportQuickActions";

export type AboutSupportSection = "about" | "medical" | "contact" | "limitations" | "account" | "app";

const SUPPORT_EMAIL = "nikolai_91@live.com";
const STUDIO_URL = "https://synapsestudio.dk";

function SupportSection({ id, title, subtitle, open, onToggle, children }: {
  id: AboutSupportSection;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <View testID={"about-support-section-" + id} style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={({ pressed }) => ({
          minHeight: 59, paddingHorizontal: 2, paddingVertical: 11,
          flexDirection: "row", alignItems: "center", gap: 8, opacity: pressed ? 0.7 : 1,
        })}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 16 }}>{title}</Text>
          {!open ? <Subtle>{subtitle}</Subtle> : null}
        </View>
        <Text style={{ color: theme.colors.accentMuted, fontSize: 20 }}>{open ? "⌄" : "›"}</Text>
      </Pressable>
      {open ? <View style={{ gap: 9, paddingBottom: 16, paddingHorizontal: 2 }}>{children}</View> : null}
    </View>
  );
}

function Body({ children }: { children: ReactNode }) {
  return <Text style={{ color: theme.colors.text, lineHeight: 21, fontSize: 14 }}>{children}</Text>;
}

export function AboutSupportScreen({ initialSection }: { initialSection?: AboutSupportSection }) {
  const { t, lang } = useT();
  const { state, logout } = useAuth();
  const [openSection, setOpenSection] = useState<AboutSupportSection | null>(initialSection === "limitations" ? "medical" : initialSection === "contact" ? null : initialSection ?? null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const appVersion = Constants.expoConfig?.version ?? "–";
  const toggle = (section: AboutSupportSection) => setOpenSection((old) => old === section ? null : section);
  const openEmail = async (bug = false) => {
    const subject = encodeURIComponent(bug
      ? (lang === "da" ? "Fejl i AmbuAssist" : "AmbuAssist bug report")
      : t("contact_email_subject"));
    const body = encodeURIComponent(bug
      ? (lang === "da"
        ? "Hej Nikolai,\n\nHvor i appen?\n\nHvad skete der?\n\nHvad forventede du?\n\n"
        : "Hi Nikolai,\n\nWhere in the app?\n\nWhat happened?\n\nWhat did you expect?\n\n")
      : t("contact_email_body_greeting") + "\n\n");
    try {
      await Linking.openURL("mailto:" + SUPPORT_EMAIL + "?subject=" + subject + "&body=" + body);
    } catch {
      Alert.alert(lang === "da" ? "Kunne ikke åbne e-mail" : "Could not open email", SUPPORT_EMAIL);
    }
  };
  const openStudio = async () => {
    try { await Linking.openURL(STUDIO_URL); }
    catch { Alert.alert("SynapseStudio", STUDIO_URL); }
  };
  const signOut = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError(false);
    try { await logout(); }
    catch { setLogoutError(true); setLoggingOut(false); }
  };

  return (
    <Background>
      <Screen>
        <ScrollView contentContainerStyle={{ gap: 15, paddingBottom: 26 }} keyboardShouldPersistTaps="handled">
          <SupportQuickActions
            language={lang}
            onEmail={() => void openEmail()}
            onReport={() => void openEmail(true)}
            onStudio={() => void openStudio()}
          />
          <Text style={{ color: theme.colors.mutedText, fontSize: 12, lineHeight: 18, paddingHorizontal: 2 }}>
            {lang === "da"
              ? "Til faglig støtte – ikke en erstatning for klinisk vurdering. Akut behandling må aldrig forsinkes."
              : "For clinical support, not a replacement for judgement. Never delay urgent treatment."}
          </Text>

          <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.divider }}>
            <SupportSection
              id="about"
              title={t("about_what_title")}
              subtitle=""
              open={openSection === "about"}
              onToggle={() => toggle("about")}
            >
              <Body>{t("about_what_body")}</Body>
              <Body>{t("about_purpose_1")}</Body>
            </SupportSection>
            <SupportSection
              id="medical"
              title={t("meddisc_title")}
              subtitle=""
              open={openSection === "medical"}
              onToggle={() => toggle("medical")}
            >
              <Body>{t("meddisc_warning_body")}</Body>
              <Body>{t("meddisc_sources_body")}</Body>
              <Body>{t("meddisc_emergency_body")}</Body>
            </SupportSection>
            <SupportSection
              id="app"
              title={t("about_info_title")}
              subtitle=""
              open={openSection === "app"}
              onToggle={() => toggle("app")}
            >
              <Body>AmbuAssist · {t("about_info_version")} {appVersion}</Body>
              <Body>{t("about_info_use_value")}</Body>
            </SupportSection>
            <SupportSection
              id="account"
              title={t("account_title")}
              subtitle=""
              open={openSection === "account"}
              onToggle={() => toggle("account")}
            >
              <Body>{state.status === "authorized" && state.session.assurance === "offline-cache" ? t("account_offline") : t("account_remembered")}</Body>
              <Pressable
                testID="about-support-logout"
                accessibilityRole="button"
                accessibilityLabel={t("account_logout")}
                disabled={loggingOut}
                accessibilityState={{ disabled: loggingOut }}
                onPress={() => void signOut()}
                style={({ pressed }) => ({
                  minHeight: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed || loggingOut ? 0.6 : 1,
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {loggingOut ? t("account_logging_out") : t("account_logout")}
                </Text>
              </Pressable>
              {logoutError ? <Body>{t("account_logout_error")}</Body> : null}
            </SupportSection>
          </View>
          <Subtle style={{ textAlign: "center" }}>AmbuAssist · v{appVersion} · SynapseStudio</Subtle>
        </ScrollView>
      </Screen>
    </Background>
  );
}
