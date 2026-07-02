import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { Platform, StyleSheet, View } from "react-native";

export function Background({
  children,
  variant = "default",
}: PropsWithChildren<{ variant?: "default" | "home" }>) {
  return (
    <View style={styles.root}>
      <LinearGradient
        pointerEvents="none"
        colors={["#22281E", "#171B15", "#10130F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {variant === "home" ? (
        <View pointerEvents="none" style={styles.swirlLayer}>
          <View style={[styles.swirl, styles.swirlOne]} />
          <View style={[styles.swirl, styles.swirlTwo]} />
          <View style={[styles.swirl, styles.swirlThree]} />
        </View>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#10130F",
    ...(Platform.OS === "web" ? ({ minHeight: "100vh" } as any) : null),
  },
  content: { flex: 1, backgroundColor: "transparent" },
  swirlLayer: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  swirl: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(145,169,108,0.13)",
    borderRadius: 999,
  },
  swirlOne: {
    width: 620,
    height: 170,
    top: 64,
    left: -170,
    transform: [{ rotate: "12deg" }],
  },
  swirlTwo: {
    width: 560,
    height: 150,
    top: 108,
    right: -230,
    transform: [{ rotate: "-17deg" }],
  },
  swirlThree: {
    width: 470,
    height: 115,
    top: 150,
    left: -40,
    borderColor: "rgba(174,190,144,0.08)",
    transform: [{ rotate: "5deg" }],
  },
});
