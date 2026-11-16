import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../ui/theme";

type PwaUpdateBannerProps = {
  updating: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
};

/** Prominent update prompt, shown only when the manager confirms a safe route. */
export function PwaUpdateBanner({ updating, onUpdate, onDismiss }: PwaUpdateBannerProps) {
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View
        testID="pwa-update-modal"
        accessibilityViewIsModal
        style={[styles.backdrop, { backdropFilter: "blur(12px)" } as never]}
      >
        <View style={styles.dialog}>
          <Text accessibilityRole="header" style={styles.title}>Ny version klar</Text>
          <Text style={styles.description}>
            Opdatér AmbuAssist for at få den nyeste version.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Opdatér AmbuAssist"
            accessibilityState={{ disabled: updating }}
            disabled={updating}
            onPress={onUpdate}
            style={({ pressed }) => [styles.action, { opacity: pressed || updating ? 0.72 : 1 }]}
          >
            <Text style={styles.actionText}>
              {updating ? "Opdaterer…" : "Opdatér nu"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Senere"
            disabled={updating}
            onPress={onDismiss}
            style={styles.dismiss}
          >
            <Text style={styles.dismissText}>Senere</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    minHeight: "100dvh" as never,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "rgba(5, 9, 6, 0.65)",
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    alignItems: "stretch",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.cardElevated,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.40)" as never,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 30,
  },
  description: {
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 24,
  },
  action: {
    minHeight: 52,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.accent,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  actionText: {
    color: theme.colors.onAccent,
    fontSize: 16,
    fontWeight: "800",
  },
  dismiss: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  dismissText: {
    color: theme.colors.mutedText,
    fontSize: 14,
    fontWeight: "600",
  },
});
