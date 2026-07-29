import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Card } from "../../ui/Ui";

export function ActionOverlay({ children }: PropsWithChildren) {
  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardArea}
      >
        <Card style={styles.card}>{children}</Card>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    elevation: 20,
    backgroundColor: "rgba(5,7,5,0.86)",
    padding: 18,
    justifyContent: "center",
  },
  keyboardArea: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  card: {
    width: "100%",
    padding: 20,
    gap: 14,
  },
});
