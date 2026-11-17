import Constants from "expo-constants";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useT } from "../../i18n/useT";
import {
  detectInstallPlatform,
  isStandaloneDisplay,
  type InstallPlatform,
} from "../../pwa/install";
import { Background } from "../../ui/Background";
import { usePressFeedback, useReducedMotionPreference } from "../../ui/motion";
import { Screen, Subtle } from "../../ui/Ui";
import { theme } from "../../ui/theme";
import { useAuth } from "../../auth/AuthProvider";
import { SupportQuickActions } from "./SupportQuickActions";

export type AboutSupportSection =
  | "about"
  | "sources"
  | "medical"
  | "contact"
  | "account"
  | "limitations"
  | "app";

const SUPPORT_EMAIL = "nikolai_91@live.com";

type PwaNavigator = Navigator & { standalone?: boolean };

function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 9 }}>
      <Text style={{ color: theme.colors.accentMuted, lineHeight: 21 }}>•</Text>
      <Text style={{ flex: 1, color: theme.colors.text, fontSize: 14, lineHeight: 21 }}>
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
  return <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21 }}>{children}</Text>;
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
      <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21 }}>{children}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
      <Subtle>{label}</Subtle>
      <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20, fontWeight: "800", marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

function DisclosureBody({ open, children }: { open: boolean; children: ReactNode }) {
  const reducedMotion = useReducedMotionPreference(true);
  const reveal = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    reveal.stopAnimation();
    if (reducedMotion) {
      reveal.setValue(open ? 1 : 0);
      return;
    }

    if (open) {
      reveal.setValue(0);
      Animated.timing(reveal, {
        toValue: 1,
        duration: 220,
        useNativeDriver: false,
        isInteraction: false,
      }).start();
    }
  }, [open, reducedMotion, reveal]);

  // Closed content is deliberately not mounted. React Native Web has
  // inconsistent support for CSS grid track animations on iOS Safari, which
  // previously allowed collapsed copy to retain layout height and appear open.
  if (!open) return null;

  return (
    <Animated.View
      testID="about-disclosure-body"
      style={{
        overflow: "hidden",
        opacity: reveal,
        transform: [
          {
            translateY: reveal.interpolate({
              inputRange: [0, 1],
              outputRange: [-8, 0],
            }),
          },
        ],
      }}
    >
      <View>
        {children}
      </View>
    </Animated.View>
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
  id: Exclude<AboutSupportSection, "limitations">;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const pressFeedback = usePressFeedback(0.985);

  return (
    <View testID={`about-support-section-${id}`} style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
      <Animated.View style={pressFeedback.animatedStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityState={{ expanded: open }}
          aria-expanded={open}
          onPress={onToggle}
          onPressIn={pressFeedback.onPressIn}
          onPressOut={pressFeedback.onPressOut}
          style={({ pressed }) => ({
            minHeight: 64,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 12,
            paddingHorizontal: 3,
            opacity: pressed ? 0.76 : 1,
          })}
        >
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: theme.colors.text, fontSize: 17, lineHeight: 21, fontWeight: "900" }}>
              {title}
            </Text>
            {!open ? <Subtle>{subtitle}</Subtle> : null}
          </View>
          <Text accessibilityElementsHidden style={{ color: theme.colors.accentMuted, fontSize: 20 }}>
            {open ? "⌄" : "›"}
          </Text>
        </Pressable>
      </Animated.View>
      <DisclosureBody open={open}>
        <View style={{ gap: 10, paddingBottom: 18, paddingHorizontal: 3 }}>{children}</View>
      </DisclosureBody>
    </View>
  );
}

function PlatformButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const reducedMotion = useReducedMotionPreference(true);
  const pressFeedback = usePressFeedback(0.975);

  return (
    <Animated.View style={[{ flex: 1 }, pressFeedback.animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        onPress={onPress}
        onPressIn={pressFeedback.onPressIn}
        onPressOut={pressFeedback.onPressOut}
        style={
          ({ pressed }) =>
            ({
              minHeight: 48,
              borderRadius: 13,
              borderWidth: 1,
              borderColor: selected ? "rgba(174,190,144,0.48)" : theme.colors.cardBorder,
              backgroundColor: selected ? theme.colors.accentSurface : "rgba(255,255,255,0.025)",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.76 : 1,
              transition: reducedMotion
                ? "none"
                : "background-color 180ms ease, border-color 180ms ease",
            }) as any
        }
      >
        <Text style={{ color: selected ? theme.colors.text : theme.colors.accentMuted, fontWeight: "900" }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function InstallStep({ number, children }: { number: number; children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 36 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.accentSurface,
          borderWidth: 1,
          borderColor: "rgba(174,190,144,0.3)",
        }}
      >
        <Text style={{ color: theme.colors.accentMuted, fontSize: 13, fontWeight: "900" }}>{number}</Text>
      </View>
      <Text style={{ flex: 1, color: theme.colors.text, fontSize: 14, lineHeight: 20 }}>{children}</Text>
    </View>
  );
}

function InstallGuide() {
  const { t } = useT();
  const [guideOpen, setGuideOpen] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>(() => {
    if (typeof navigator === "undefined") return "ios";
    return detectInstallPlatform(navigator.userAgent, navigator.maxTouchPoints);
  });
  const [standalone, setStandalone] = useState(() => {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      typeof window.matchMedia !== "function"
    ) return false;
    return isStandaloneDisplay(
      window.matchMedia("(display-mode: standalone)").matches,
      (navigator as PwaNavigator).standalone,
    );
  });
  const pressFeedback = usePressFeedback(0.985);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      typeof window.matchMedia !== "function"
    ) return;

    const displayMode = window.matchMedia("(display-mode: standalone)");
    const updateStandalone = () => {
      setStandalone(
        isStandaloneDisplay(
          displayMode.matches,
          (navigator as PwaNavigator).standalone,
        ),
      );
    };

    updateStandalone();
    if (typeof displayMode.addEventListener === "function") {
      displayMode.addEventListener("change", updateStandalone);
      return () => displayMode.removeEventListener("change", updateStandalone);
    }

    displayMode.addListener(updateStandalone);
    return () => displayMode.removeListener(updateStandalone);
  }, []);

  const steps =
    platform === "ios"
      ? [t("install_ios_1"), t("install_ios_2"), t("install_ios_3"), t("install_ios_4")]
      : [t("install_android_1"), t("install_android_2"), t("install_android_3"), t("install_android_4")];

  return (
    <View testID="about-install-card" style={{ gap: 0, borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
      {standalone ? (
        <View style={{ gap: 4, paddingVertical: 14 }} testID="about-install-standalone">
          <Text style={{ color: theme.colors.ok, fontSize: 15, fontWeight: "900" }}>
            {t("install_installed_title")}
          </Text>
          <Subtle>{t("install_installed_body")}</Subtle>
        </View>
      ) : (
        <>
          <Animated.View style={pressFeedback.animatedStyle}>
            <Pressable
              testID="about-install-toggle"
              accessibilityRole="button"
              accessibilityLabel={guideOpen ? t("install_hide_guide") : t("install_show_guide")}
              accessibilityState={{ expanded: guideOpen }}
              aria-expanded={guideOpen}
              onPress={() => setGuideOpen((current) => !current)}
              onPressIn={pressFeedback.onPressIn}
              onPressOut={pressFeedback.onPressOut}
              style={({ pressed }) => ({
                minHeight: 64,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                paddingVertical: 10,
                opacity: pressed ? 0.78 : 1,
              })}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "900" }}>
                  {t("install_entry_title")}
                </Text>
                </View>
              <Text accessibilityElementsHidden style={{ color: theme.colors.accentMuted, fontSize: 20 }}>
                {guideOpen ? "⌄" : "›"}
              </Text>
            </Pressable>
          </Animated.View>
          <DisclosureBody open={guideOpen}>
            <View style={{ gap: 11, paddingTop: 2, paddingBottom: 14 }} testID="about-install-guide">
              <View style={{ flexDirection: "row", gap: 8 }}>
                <PlatformButton
                  label={t("install_ios_tab")}
                  selected={platform === "ios"}
                  onPress={() => setPlatform("ios")}
                />
                <PlatformButton
                  label={t("install_android_tab")}
                  selected={platform === "android"}
                  onPress={() => setPlatform("android")}
                />
              </View>
              <View key={platform} style={{ gap: 6 }} testID={`about-install-steps-${platform}`}>
                {steps.map((step, index) => (
                  <InstallStep key={step} number={index + 1}>{step}</InstallStep>
                ))}
              </View>
              <Subtle>{t("install_updates")}</Subtle>
            </View>
          </DisclosureBody>
        </>
      )}
    </View>
  );
}

export function AboutSupportScreen({ initialSection }: { initialSection?: AboutSupportSection }) {
  const { t, lang } = useT();
  const { state, logout } = useAuth();
  const appVersion = Constants.expoConfig?.version ?? "–";
  const initialOpen = initialSection === "limitations" ? "medical" : initialSection;
  const [openSection, setOpenSection] = useState<Exclude<AboutSupportSection, "limitations"> | null>(initialOpen ?? null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const toggle = (section: Exclude<AboutSupportSection, "limitations">) => {
    setOpenSection((old) => old === section ? null : section);
  };

  const openEmail = async (bug = false) => {
    const subject = encodeURIComponent(bug
      ? (lang === "da" ? "Fejl i AmbuAssist" : "AmbuAssist bug report")
      : t("contact_email_subject"));
    const body = encodeURIComponent(bug
      ? (lang === "da"
        ? "Hej Nikolai,\n\nHvor i appen?\n\nHvad skete der?\n\nHvad forventede du?\n\n"
        : "Hi Nikolai,\n\nWhere in the app?\n\nWhat happened?\n\nWhat did you expect?\n\n")
      : t("contact_email_body_greeting") + "\n\n");
    const mailto = "mailto:" + SUPPORT_EMAIL + "?subject=" + subject + "&body=" + body;
    try {
      await Linking.openURL((await Linking.canOpenURL(mailto)) ? mailto : "mailto:" + SUPPORT_EMAIL);
    } catch {
      try { await Linking.openURL("mailto:" + SUPPORT_EMAIL); } catch { /* User can find the address under Kontakt. */ }
    }
  };
  const openStudio = async () => {
    try { await Linking.openURL("https://synapsestudio.dk"); }
    catch { /* The address is also shown in the button label/context. */ }
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
          <View testID="about-product-identity">
            <SupportQuickActions
              language={lang}
              onEmail={() => void openEmail()}
              onReport={() => void openEmail(true)}
              onStudio={() => void openStudio()}
            onSibling={() => void Linking.openURL("https://flashmedic.synapsestudio.dk") }
            />
          </View>

          <Text style={{ color: theme.colors.mutedText, fontSize: 12, lineHeight: 18, paddingHorizontal: 2 }}>
            {lang === "da"
              ? "Til faglig støtte – ikke en erstatning for klinisk vurdering. Akut behandling må aldrig forsinkes."
              : "For clinical support, not a replacement for judgement. Never delay urgent treatment."}
          </Text>

          <View testID="about-details" style={{ borderTopWidth: 1, borderTopColor: theme.colors.divider }}>
            <SupportSection
              id="about"
              title={t("about_project_title")}
              subtitle=""
              open={openSection === "about"}
              onToggle={() => toggle("about")}
            >
              <Body>{lang === "da" ? "AmbuAssist samler praktiske værktøjer og opslagsinformation til ambulancetjenesten. Udviklet af Nikolai gennem SynapseStudio." : "AmbuAssist brings practical tools and reference material together for ambulance clinicians. Created by Nikolai at SynapseStudio."}</Body>
            </SupportSection>

            <SupportSection
              id="medical"
              title={t("about_disclaimer_title")}
              subtitle=""
              open={openSection === "medical"}
              onToggle={() => toggle("medical")}
            >
              <Body>{lang === "da" ? "AmbuAssist er beslutningsstøtte, ikke en erstatning for klinisk vurdering eller gældende instrukser. Kontrollér oplysninger før anvendelse." : "AmbuAssist supports decisions; it does not replace clinical judgement or current protocols. Verify information before use."}</Body>
            </SupportSection>

            <SupportSection
              id="app"
              title={t("about_privacy_row_title")}
              subtitle=""
              open={openSection === "app"}
              onToggle={() => toggle("app")}
            >
              <Body>{t("about_privacy_local")}</Body>
              <Body>{t("about_privacy_auth")}</Body>
              <InfoRow label={t("about_info_version")} value={appVersion} />
            </SupportSection>

            <SupportSection
              id="account"
              title={t("account_title")}
              subtitle=""
              open={openSection === "account"}
              onToggle={() => toggle("account")}
            >
              <Body>
                {state.status === "authorized" && state.session.assurance === "offline-cache"
                  ? t("account_offline")
                  : t("account_remembered")}
              </Body>
              <Pressable
                testID="about-support-logout"
                accessibilityRole="button"
                accessibilityLabel={t("account_logout")}
                accessibilityState={{ disabled: loggingOut }}
                disabled={loggingOut}
                onPress={() => void signOut()}
                style={({ pressed }) => ({
                  minHeight: 48,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  opacity: loggingOut || pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {loggingOut ? t("account_logging_out") : t("account_logout")}
                </Text>
              </Pressable>
              {logoutError ? <Warning>{t("account_logout_error")}</Warning> : null}
            </SupportSection>
            <InstallGuide />
          </View>

          <View testID="about-footer" style={{ alignItems: "center", paddingTop: 2 }}>
            <Subtle>SynapseStudio · AmbuAssist v{appVersion}</Subtle>
          </View>
        </ScrollView>
      </Screen>
    </Background>
  );
}
