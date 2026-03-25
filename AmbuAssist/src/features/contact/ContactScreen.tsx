// src/features/contact/ContactScreen.tsx
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";

import { useT } from "../../i18n/useT";
import { useSettings } from "../../state/settings";
import { Background } from "../../ui/Background";
import {
  Card,
  Input,
  Label,
  PrimaryButton,
  Row,
  Screen,
  Subtle,
  Title,
} from "../../ui/Ui";
import { theme } from "../../ui/theme";

type Props = {
  /** Use your FlashMedic backend base URL, e.g. https://your-api.com */
  apiBaseUrl: string;
};

function t2(lang: "en" | "da", da: string, en: string) {
  return lang === "da" ? da : en;
}

export default function ContactScreen({ apiBaseUrl }: Props) {
  const router = useRouter();
  const { settings } = useSettings();
  const { t } = useT();

  const lang = settings.language;

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sending, setSending] = useState(false);

  const appName = "AmbuAssist";
  const appVersion = Constants.expoConfig?.version ?? "unknown";

  const deviceInfo = useMemo(() => {
    const parts = [
      // On native this is often filled; on web it might be undefined (fine)
      (Constants as any)?.deviceName,
      Platform.OS,
      String(Platform.Version ?? ""),
    ].filter(Boolean);
    return parts.join(" ");
  }, []);

  const handleSend = async () => {
    if (!contactMessage.trim()) {
      Alert.alert(
        t2(lang, "Fejl", "Error"),
        t2(lang, "Skriv venligst en besked.", "Please write a message."),
      );
      return;
    }

    if (!apiBaseUrl?.trim()) {
      Alert.alert(
        t2(lang, "Fejl", "Error"),
        t2(
          lang,
          "apiBaseUrl mangler. Tilføj backend URL i din navigation/route.",
          "apiBaseUrl is missing. Provide your backend base URL.",
        ),
      );
      return;
    }

    try {
      setSending(true);

      const res = await fetch(`${apiBaseUrl}/contact/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName.trim() || null,
          email: contactEmail.trim() || null,
          message: contactMessage.trim(),
          appName,
          appVersion,
          platform: Platform.OS,
          deviceInfo: deviceInfo || null,
        }),
      });

      if (!res.ok) throw new Error("server");

      Alert.alert(
        t2(lang, "Tak!", "Thanks!"),
        t2(lang, "Din besked er sendt.", "Your message has been sent."),
      );

      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch {
      Alert.alert(
        t2(lang, "Fejl", "Error"),
        t2(lang, "Kunne ikke sende. Prøv igen.", "Could not send. Try again."),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Background>
      <Screen>
        {/* Header row: title + back */}
        <View style={{ marginTop: 12, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Title>{t2(lang, "Kontakt", "Contact")}</Title>
              <Subtle>
                {t2(
                  lang,
                  "Send feedback, fejl og forslag direkte til udvikleren.",
                  "Send feedback, bugs, and ideas directly to the developer.",
                )}
              </Subtle>
            </View>

            <Pressable
              onPress={() => router.back()}
              hitSlop={14}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                backgroundColor: "rgba(220,220,220,0.18)",
              })}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                {t2(lang, "Tilbage", "Back")}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 12, marginTop: 12 }}>
          <Card>
            <Subtle>
              {t2(lang, "App", "App")}: {appName} – v{appVersion}
              {"\n"}
              {t2(lang, "Enhed", "Device")}:{" "}
              {deviceInfo || t2(lang, "Ukendt", "Unknown")}
            </Subtle>
          </Card>

          <Card>
            <View style={{ gap: 10 }}>
              <View style={{ gap: 6 }}>
                <Label>{t2(lang, "Navn (valgfri)", "Name (optional)")}</Label>
                <Input
                  value={contactName}
                  onChangeText={setContactName}
                  placeholder={t2(lang, "Fx Nikolai", "e.g. Nikolai")}
                  keyboardType="default"
                />
              </View>

              <View style={{ gap: 6 }}>
                <Label>{t2(lang, "Email (valgfri)", "Email (optional)")}</Label>
                <Input
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  placeholder={t2(
                    lang,
                    "Fx navn@email.com",
                    "e.g. name@email.com",
                  )}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={{ gap: 6 }}>
                <Label>{t2(lang, "Besked", "Message")}</Label>
                {/* Your Input component is likely TextInput-based; keep it simple */}
                <Input
                  value={contactMessage}
                  onChangeText={setContactMessage}
                  placeholder={t2(lang, "Skriv her...", "Write here...")}
                  multiline
                  style={{ height: 140, textAlignVertical: "top" }}
                />
              </View>

              <PrimaryButton
                label={
                  sending
                    ? t2(lang, "Sender...", "Sending...")
                    : t2(lang, "Send", "Send")
                }
                onPress={handleSend}
                disabled={sending}
              />
            </View>
          </Card>

          {/* Optional hint */}
          <Card>
            <Row>
              <Text style={{ color: theme.colors.mutedText }}>
                {t2(
                  lang,
                  "Tip: Skriv gerne patientvægt, dosis, og hvad du forventede at se.",
                  "Tip: Include patient weight, dose, and what you expected to see.",
                )}
              </Text>
            </Row>
          </Card>
        </View>
      </Screen>
    </Background>
  );
}
