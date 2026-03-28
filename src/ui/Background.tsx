// src/ui/Background.tsx
import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { Platform, StyleSheet, View } from "react-native";

export function Background({ children }: PropsWithChildren) {
  return (
    // ✅ Let the root participate in touches normally on native
    <View style={styles.root}>
      {/* ✅ Gradient should NEVER eat touches */}
      <LinearGradient
        pointerEvents="none"
        colors={["#3E4A36", "#2F3A2A", "#20271D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ✅ Content should be normal touch surface */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#20271D",
    ...(Platform.OS === "web" ? ({ minHeight: "100vh" } as any) : null),
  },
  content: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
