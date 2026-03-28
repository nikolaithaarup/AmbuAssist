// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SettingsProvider } from "../src/state/settings";

export default function RootLayout() {
  return (
    <SettingsProvider>
      {/* Home stays “hero” up top */}
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </SettingsProvider>
  );
}
