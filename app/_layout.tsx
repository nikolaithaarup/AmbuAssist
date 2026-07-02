// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SettingsProvider } from "../src/state/settings";
import { ToolPreferencesProvider } from "../src/state/toolPreferences";

export default function RootLayout() {
  return (
    <SettingsProvider>
      {/* Home stays “hero” up top */}
      <ToolPreferencesProvider>
        <StatusBar style="light" translucent backgroundColor="transparent" />

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
      </ToolPreferencesProvider>
    </SettingsProvider>
  );
}
