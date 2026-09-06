// app/_layout.tsx
import { Stack } from "expo-router";
import { Platform } from "react-native";
import AuthLanding from "../src/features/auth/AuthLanding";
import { StatusBar } from "expo-status-bar";
import { SettingsProvider } from "../src/state/settings";
import { FavouritesProvider } from "../src/state/favourites";
import { AuthProvider, useAuth } from "../src/auth/AuthProvider";

function AppStack() {
  const { state } = useAuth();
  const authorized = state.status === "authorized";
  // Keep the browser URL intact while checking access, before Expo can redirect a protected route.
  if (Platform.OS === "web" && !authorized) return <AuthLanding />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Protected guard={authorized}>
        <Stack.Screen name="home" />
        <Stack.Screen name="tools" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <FavouritesProvider>
          <StatusBar style="light" translucent backgroundColor="transparent" />
          <AppStack />
        </FavouritesProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
