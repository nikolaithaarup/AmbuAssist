import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../ui/theme";

type PwaUpdateBannerProps = {
  updating: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
};

/** Compact, opt-in update notification. The manager decides when it is safe to show. */
export function PwaUpdateBanner({ updating, onUpdate, onDismiss }: PwaUpdateBannerProps) {
  return (
    <View testID="pwa-update-banner" accessibilityLiveRegion="polite" style={styles.container}>
      <Text style={styles.message}>Ny version klar.</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Opdatér AmbuAssist"
        accessibilityState={{ disabled: updating }}
        disabled={updating}
        onPress={onUpdate}
        style={({ pressed }) => [styles.action, { opacity: pressed || updating ? 0.75 : 1 }]}
      >
        <Text style={styles.actionText}>{updating ? "Opdaterer…" : "Opdatér nu"}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Senere"
        disabled={updating}
        onPress={onDismiss}
        style={styles.dismiss}
      >
        <Text style={styles.dismissText}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "fixed" as never,
    left: 12,
    right: 12,
    bottom: "max(12px, env(safe-area-inset-bottom))" as never,
    zIndex: 1000,
    maxWidth: 600,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 62,
    borderRadius: theme.radii.control,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.cardElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.32)" as never,
  },
  message: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  action: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
  },
  actionText: {
    color: theme.colors.onAccent,
    fontSize: 14,
    fontWeight: "800",
  },
  dismiss: {
    minWidth: 38,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissText: {
    color: theme.colors.mutedText,
    fontSize: 24,
    lineHeight: 26,
  },
});
