import Constants from "expo-constants";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Image,
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
import { ToolPageHeader, ToolSurface } from "../../ui/ToolSurface";
import { Screen, Subtle } from "../../ui/Ui";
import { theme } from "../../ui/theme";

export type AboutSupportSection =
  | "about"
  | "sources"
  | "medical"
  | "contact"
  | "limitations"
  | "app";

const SUPPORT_EMAIL = "nikolai_91@live.com";
const AMBUASSIST_ICON = require("../../../assets/icon.png");

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
    <ToolSurface tone="accent" testID="about-install-card" style={{ gap: 0, paddingVertical: 0 }}>
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
                {!guideOpen ? <Subtle>{t("install_intro")}</Subtle> : null}
              </View>
              <Text accessibilityElementsHidden style={{ color: theme.colors.accentMuted, fontSize: 20 }}>
                {guideOpen ? "⌄" : "›"}
              </Text>
            </Pressable>
          </Animated.View>
          <DisclosureBody open={guideOpen}>
            <View style={{ gap: 11, paddingTop: 2, paddingBottom: 14 }} testID="about-install-guide">
              <Body>{t("install_optional")}</Body>
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
    </ToolSurface>
  );
}

export function AboutSupportScreen({ initialSection }: { initialSection?: AboutSupportSection }) {
  const { t } = useT();
  const appVersion = Constants.expoConfig?.version ?? "unknown";
  const initialOpen = initialSection === "limitations" ? "medical" : initialSection;
  const [openSection, setOpenSection] = useState<Exclude<AboutSupportSection, "limitations"> | null>(
    initialOpen ?? null,
  );

  const toggleSection = (section: Exclude<AboutSupportSection, "limitations">) => {
    setOpenSection((current) => current === section ? null : section);
  };

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
      await Linking.openURL((await Linking.canOpenURL(detailedUrl)) ? detailedUrl : `mailto:${SUPPORT_EMAIL}`);
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
          <ToolPageHeader title={t("about_support_title")} />

          <View testID="about-product-identity" style={{ gap: 10, paddingHorizontal: 2 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 18,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.colors.backgroundBase,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                }}
              >
                <Image source={AMBUASSIST_ICON} resizeMode="contain" style={{ width: 58, height: 58 }} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ color: theme.colors.text, fontSize: 24, lineHeight: 29, fontWeight: "900" }}>
                  AmbuAssist
                </Text>
                <Text style={{ color: theme.colors.accentMuted, fontSize: 14, lineHeight: 19 }}>
                  {t("homeTagline")}
                </Text>
              </View>
            </View>
            <Body>{t("about_compact_body")}</Body>
          </View>

          <Warning>{t("about_safety_summary")}</Warning>

          <InstallGuide />

          <Text style={{ color: theme.colors.mutedText, fontSize: 13, lineHeight: 18, fontWeight: "800", paddingTop: 4, paddingHorizontal: 2 }}>
            {t("about_help_title")}
          </Text>

          <ToolSurface style={{ paddingVertical: 0, paddingHorizontal: 14, gap: 0 }}>
            <SupportSection
              id="about"
              title={t("about_project_title")}
              subtitle={t("about_project_sub")}
              open={openSection === "about"}
              onToggle={() => toggleSection("about")}
            >
              <SectionHeading>{t("about_purpose_title")}</SectionHeading>
              <Bullet>{t("about_purpose_1")}</Bullet>
              <Bullet>{t("about_purpose_2")}</Bullet>
              <Bullet>{t("about_purpose_3")}</Bullet>
              <SectionHeading>{t("about_design_title")}</SectionHeading>
              <Bullet>{t("about_design_1")}</Bullet>
              <Bullet>{t("about_design_2")}</Bullet>
              <Bullet>{t("about_design_3")}</Bullet>
              <Bullet>{t("about_design_4")}</Bullet>
            </SupportSection>

            <SupportSection
              id="sources"
              title={t("about_sources_title")}
              subtitle={t("about_sources_sub")}
              open={openSection === "sources"}
              onToggle={() => toggleSection("sources")}
            >
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
              <SectionHeading>{t("meddisc_section_updates_title")}</SectionHeading>
              <Bullet>{t("meddisc_updates_1")}</Bullet>
              <Bullet>{t("meddisc_updates_2")}</Bullet>
              <Bullet>{t("meddisc_updates_3")}</Bullet>
            </SupportSection>

            <SupportSection
              id="medical"
              title={t("about_disclaimer_title")}
              subtitle={t("meddisc_sub")}
              open={openSection === "medical"}
              onToggle={() => toggleSection("medical")}
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
              <SectionHeading>{t("meddisc_section_region_title")}</SectionHeading>
              <Bullet>{t("meddisc_region_1")}</Bullet>
              <Bullet>{t("meddisc_region_2")}</Bullet>
              <Bullet>{t("meddisc_region_3")}</Bullet>
              <SectionHeading>{t("meddisc_section_emergency_title")}</SectionHeading>
              <Body>{t("meddisc_emergency_body")}</Body>
              <Subtle style={{ textAlign: "center", marginTop: 4 }}>{t("meddisc_footer")}</Subtle>
            </SupportSection>

            <SupportSection
              id="app"
              title={t("about_privacy_row_title")}
              subtitle={t("about_privacy_sub")}
              open={openSection === "app"}
              onToggle={() => toggleSection("app")}
            >
              <Bullet>{t("about_privacy_local")}</Bullet>
              <Bullet>{t("about_privacy_auth")}</Bullet>
              <Bullet>{t("about_privacy_usage")}</Bullet>
              <Warning>{t("about_privacy_feedback")}</Warning>
              <InfoRow label={t("about_info_name")} value="AmbuAssist" />
              <InfoRow label={t("about_info_version")} value={appVersion} />
              <InfoRow label={t("about_info_use")} value={t("about_info_use_value")} />
              <InfoRow label={t("about_info_focus")} value={t("about_info_focus_value")} />
            </SupportSection>

            <SupportSection
              id="contact"
              title={t("about_contact_row_title")}
              subtitle={t("contact_sub")}
              open={openSection === "contact"}
              onToggle={() => toggleSection("contact")}
            >
              <Body>{t("contact_getintouch_body")}</Body>
              <Subtle>{t("contact_support_email_label")}</Subtle>
              <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{SUPPORT_EMAIL}</Text>
              <Pressable
                testID="about-support-email"
                accessibilityRole="link"
                accessibilityLabel={t("contact_email_button")}
                onPress={() => void openEmail()}
                style={({ pressed }) => ({
                  minHeight: 50,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 14,
                  backgroundColor: pressed ? "rgba(145,169,108,0.24)" : theme.colors.accentSurface,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{t("contact_email_button")}</Text>
              </Pressable>
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
          </ToolSurface>

          <View testID="about-footer" style={{ alignItems: "center", gap: 2, paddingTop: 5 }}>
            <Subtle>{t("about_info_version")} {appVersion}</Subtle>
            <Subtle>{t("about_made_by")}</Subtle>
          </View>
        </ScrollView>
      </Screen>
    </Background>
  );
}
