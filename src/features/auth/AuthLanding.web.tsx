import { Redirect } from "expo-router";
import { ActivityIndicator, Image, Linking, Pressable, View } from "react-native";

import { useAuth } from "../../auth/AuthProvider";
import { Background } from "../../ui/Background";
import { theme } from "../../ui/theme";
import { Card, Screen, Subtle, Title } from "../../ui/Ui";

export default function AuthLanding() {
  const { state, refresh, portalLoginUrl } = useAuth();
  if (state.status === "authorized") return <Redirect href="/home" />;

  const openPortal = () => {
    const returnTo = typeof window === "undefined" ? undefined : window.location.href;
    void Linking.openURL(portalLoginUrl(returnTo));
  };

  return (
    <Background variant="home">
      <Screen style={{ justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: "100%", maxWidth: 520, alignItems: "center" }}>
          <Image source={require("../../../assets/her-icon.png")} style={{ width: 96, height: 96, opacity: 0.95 }} resizeMode="contain" />
          <Image source={require("../../../assets/ambuassist-logo.png")} style={{ width: "100%", maxWidth: 440, height: 82, marginTop: -12 }} resizeMode="contain" />
          <Card style={{ width: "100%", padding: 20, gap: 14 }}>
            {state.status === "checking" ? <><ActivityIndicator /><Subtle style={{ textAlign: "center" }}>Kontrollerer adgang via SynapsePortal…</Subtle></> : <>
              <Title style={{ fontSize: 22 }}>{state.status === "forbidden" ? "AmbuAssist-adgang mangler" : state.status === "error" ? "Adgang kunne ikke kontrolleres" : "Log ind via SynapsePortal"}</Title>
              <Subtle>{state.status === "forbidden" ? "Din Portal-session er gyldig, men den indeholder ikke en aktiv AmbuAssist-rettighed." : state.status === "error" ? state.message : "AmbuAssist bruger SynapsePortal som central identitet og adgangskontrol. BAM-ID alene giver ikke adgang på web."}</Subtle>
              <Pressable accessibilityRole="button" accessibilityLabel={state.status === "error" ? "Prøv adgangskontrol igen" : "Åbn SynapsePortal"} onPress={state.status === "error" ? refresh : openPortal} style={({ pressed }) => ({ minHeight: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.accentSurface, borderWidth: 1, borderColor: theme.colors.cardBorder, opacity: pressed ? 0.78 : 1 })}>
                <Title style={{ fontSize: 16 }}>{state.status === "error" ? "Prøv igen" : "Fortsæt i SynapsePortal"}</Title>
              </Pressable>
            </>}
          </Card>
        </View>
      </Screen>
    </Background>
  );
}
