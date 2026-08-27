import { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useT } from "../i18n/useT";
import { Subtle, Title } from "./Ui";
import { theme } from "./theme";

export type ClinicalDisclosureSource = {
  id: string;
  title: string;
  subtitle?: string;
  url?: string;
};

export function formatClinicalDisclosureTriggerLabel(
  label: string,
  singularSource: string,
  pluralSources: string,
  sourceCount: number,
) {
  if (sourceCount <= 0) return label;
  const countLabel = sourceCount === 1 ? singularSource : pluralSources;
  return `${label} · ${sourceCount} ${countLabel}`;
}

export function ClinicalDisclosure({
  disclaimer,
  sourcesIntro,
  sources,
}: {
  disclaimer: string;
  sourcesIntro?: string;
  sources: readonly ClinicalDisclosureSource[];
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const sourceCount = sources.length;
  const triggerLabel = formatClinicalDisclosureTriggerLabel(
    t("clinical_disclosure_label"),
    t("clinical_disclosure_source"),
    t("clinical_disclosure_sources"),
    sourceCount,
  );
  const close = () => setOpen(false);

  return (
    <>
      <Pressable
        testID="clinical-disclosure-trigger"
        accessibilityRole="button"
        accessibilityLabel={triggerLabel}
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          minHeight: 48,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.colors.cardBorder,
          backgroundColor: "rgba(255,255,255,0.035)",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: pressed ? 0.68 : 1,
        })}
      >
        <Text accessibilityElementsHidden style={{ color: theme.colors.accentMuted, fontSize: 16 }}>ⓘ</Text>
        <Text style={{ color: theme.colors.accentMuted, fontWeight: "800", textAlign: "center", lineHeight: 20 }}>
          {triggerLabel}
        </Text>
      </Pressable>

      <Modal
        testID="clinical-disclosure-modal"
        visible={open}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        onRequestClose={close}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            accessibilityLabel={t("clinical_disclosure_close")}
            onPress={close}
            style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.58)" }}
          />
          <View
            accessibilityViewIsModal
            style={{
              maxHeight: "88%",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
              backgroundColor: theme.colors.card,
              paddingTop: 18,
              paddingHorizontal: 18,
              paddingBottom: 12,
              gap: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Title style={{ flex: 1, fontSize: 21 }}>{t("clinical_disclosure_title")}</Title>
              <Pressable
                testID="clinical-disclosure-close"
                accessibilityRole="button"
                accessibilityLabel={t("clinical_disclosure_close")}
                onPress={close}
                style={({ pressed }) => ({
                  minWidth: 48,
                  minHeight: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  opacity: pressed ? 0.65 : 1,
                })}
              >
                <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "800" }}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              testID="clinical-disclosure-scroll"
              contentContainerStyle={{ gap: 22, paddingBottom: 28 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <View style={{ gap: 8 }}>
                <Title style={{ fontSize: 18 }}>{t("tool_disclaimer_title")}</Title>
                {disclaimer ? (
                  <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21 }}>{disclaimer}</Text>
                ) : (
                  <Subtle>{t("clinical_disclosure_missing_disclaimer")}</Subtle>
                )}
              </View>

              <View style={{ gap: 8 }}>
                <Title style={{ fontSize: 18 }}>{t("tool_sources_title")}</Title>
                {sourcesIntro ? <Subtle>{sourcesIntro}</Subtle> : null}
                {sourceCount > 0 ? sources.map((source) => (
                  <Pressable
                    key={source.id}
                    accessibilityRole={source.url ? "link" : undefined}
                    accessibilityLabel={source.subtitle ? `${source.title}. ${source.subtitle}` : source.title}
                    disabled={!source.url}
                    onPress={async () => {
                      if (!source.url) return;
                      try {
                        if (!(await Linking.canOpenURL(source.url))) throw new Error("unsupported");
                        await Linking.openURL(source.url);
                      } catch {
                        Alert.alert(t("clinical_disclosure_link_error"), source.url);
                      }
                    }}
                    style={({ pressed }) => ({
                      minHeight: 48,
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.divider,
                      opacity: pressed ? 0.68 : 1,
                    })}
                  >
                    <Text style={{ color: theme.colors.text, fontWeight: "800", lineHeight: 20 }}>{source.title}</Text>
                    {source.subtitle ? <Subtle style={{ marginTop: 3 }}>{source.subtitle}</Subtle> : null}
                    {source.url ? (
                      <Text style={{ color: theme.colors.accentMuted, fontWeight: "800", marginTop: 7 }}>
                        {t("clinical_disclosure_open_source")}
                      </Text>
                    ) : null}
                  </Pressable>
                )) : (
                  <Subtle>{t("clinical_disclosure_no_sources")}</Subtle>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
