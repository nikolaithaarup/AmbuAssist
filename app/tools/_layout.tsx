import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React from "react";
import { Platform, Pressable, StatusBar, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Background } from "../../src/ui/Background";

const HEADER_BAR_HEIGHT = 44;

export default function ToolsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const showBack = pathname !== "/tools";
  const insets = useSafeAreaInsets();

  const statusBarH =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : insets.top;

  const topOffset = statusBarH + HEADER_BAR_HEIGHT;

  return (
    <Background>
      <ExpoStatusBar style="light" translucent />

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: topOffset,
          zIndex: 1000,
          paddingTop: statusBarH,
          justifyContent: "center",
        }}
      >
        {showBack ? (
          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/");
            }}
            hitSlop={18}
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>
              ‹ Back
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "transparent",
            paddingTop: topOffset,
          },
        }}
      />
    </Background>
  );
}
