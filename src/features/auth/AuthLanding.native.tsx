import { Redirect } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from "react-native";

import { useAuth } from "../../auth/AuthProvider";
import { useT } from "../../i18n/useT";
import { Background } from "../../ui/Background";
import { hapticToolOpen } from "../../ui/haptics";
import { theme } from "../../ui/theme";
import { Card, Screen, Subtle, Title } from "../../ui/Ui";

const BAM_ID_PATTERN = /^[A-Z]{4}[0-9]{4}$/;

export default function AuthLanding() {
  const { state, authorizeLegacyNativeProfile, refresh } = useAuth();
  const { t } = useT();
  const [bamId, setBamId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (state.status === "authorized") return <Redirect href="/home" />;
  if (state.status === "checking") {
    return <Background variant="home"><Screen style={{ justifyContent: "center", alignItems: "center" }}><ActivityIndicator /></Screen></Background>;
  }

  const normalizedBamId = bamId.trim().toUpperCase();
  const isValidBamId = BAM_ID_PATTERN.test(normalizedBamId);
  const submit = async () => {
    if (!isValidBamId) return setError("Indtast et gyldigt BAM-ID");
    try {
      setSaving(true);
      await authorizeLegacyNativeProfile(normalizedBamId);
      hapticToolOpen();
    } catch {
      setError("Kunne ikke gemme profilen. Prøv igen.");
      setSaving(false);
    }
  };

  return (
    <Background variant="home">
      <Screen style={{ justifyContent: "center", paddingTop: 8 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: "100%", alignItems: "center" }}>
          <View style={{ width: "100%", maxWidth: 520, alignItems: "center" }}>
            <Image source={require("../../../assets/her-icon.png")} style={{ width: 96, height: 96, opacity: 0.95 }} resizeMode="contain" />
            <Image source={require("../../../assets/ambuassist-logo.png")} style={{ width: "100%", maxWidth: 440, height: 82, marginTop: -12 }} resizeMode="contain" />
            <Subtle style={{ textAlign: "center", marginBottom: 24 }}>{t("homeTagline")}</Subtle>
            <Card style={{ width: "100%", padding: 18, gap: 14 }}>
              <Title style={{ fontSize: 20 }}>Indtast BAM-ID</Title>
              <Subtle>BAM-ID gemmes kun som lokal profilmetadata på denne enhed og er ikke verificeret identitet.</Subtle>
              <TextInput
                value={bamId}
                onChangeText={(value) => { setBamId(value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8)); setError(""); }}
                placeholder="BAM-ID"
                placeholderTextColor={theme.colors.mutedText}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={8}
                returnKeyType="go"
                editable={!saving}
                onSubmitEditing={submit}
                style={{ minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: error ? theme.colors.warn : theme.colors.cardBorder, backgroundColor: "rgba(255,255,255,0.08)", color: "white", paddingHorizontal: 16, fontSize: 18, letterSpacing: 1.8, fontWeight: "700", width: "100%" }}
              />
              {error || state.status === "error" ? <Subtle style={{ color: theme.colors.warn }}>{error || (state.status === "error" ? state.message : "")}</Subtle> : null}
              <Pressable accessibilityRole="button" accessibilityLabel="Fortsæt" onPress={state.status === "error" ? refresh : submit} disabled={saving} style={({ pressed }) => ({ minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.accentSurface, borderWidth: 1, borderColor: theme.colors.cardBorder, opacity: pressed || saving ? 0.78 : 1 })}>
                <Title style={{ fontSize: 17 }}>{state.status === "error" ? "Prøv igen" : saving ? "Gemmer..." : "Fortsæt"}</Title>
              </Pressable>
            </Card>
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </Background>
  );
}
