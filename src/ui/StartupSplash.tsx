import React from "react";
import { ActivityIndicator, Image, Platform, StyleSheet, Text, View } from "react-native";

/**
 * Matches the initial PWA HTML splash and only appears while real startup work
 * is pending. Never delay navigation just to display branding.
 */
export default function StartupSplash() {
  return (
    <View testID="ambu-startup-splash" style={styles.screen}>
      <View style={styles.identity}>
        <Image
          accessibilityLabel="AmbuAssist ikon"
          source={require("../../assets/synapse-icon.png")}
          resizeMode="cover"
          style={styles.mark}
        />
        <Text accessibilityRole="header" style={styles.title}>AmbuAssist</Text>
        <Text style={styles.subtitle}>Kliniske værktøjer. Lige ved hånden.</Text>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Kontrollerer adgang…"
          style={styles.loading}
        >
          <ActivityIndicator size="small" color="#E2C76D" />
          <Text style={styles.loadingText}>Kontrollerer adgang…</Text>
        </View>
        <View style={styles.studioFooter} accessible accessibilityLabel="Part of Synapse Studio">
          <Text style={styles.partOf}>Part of</Text>
          <Image
            source={require("../../assets/synapsestudio-logo-white.png")}
            resizeMode="contain"
            style={styles.studioLogo}
            accessibilityLabel="SynapseStudio"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: Platform.OS === "web" ? ("100dvh" as never) : undefined,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25311F",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  identity: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
  },
  mark: { width: 136, height: 68, overflow: "hidden", marginBottom: 14 },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 39,
    letterSpacing: -0.6,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#E1E8E7",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 9,
  },
  studioFooter: {
    marginTop: 46,
    alignItems: "center",
    gap: 10,
  },
  partOf: {
    color: "#D3DCDA",
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.1,
    fontWeight: "600",
  },
  studioLogo: { width: 164, height: 44 },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 34,
    minHeight: 32,
  },
  loadingText: {
    color: "#D3DCDA",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
});
