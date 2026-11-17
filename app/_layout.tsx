// app/_layout.tsx
import { Stack, usePathname } from "expo-router";
import { useEffect } from "react";
import { Animated, Platform, View } from "react-native";
import AuthLanding from "../src/features/auth/AuthLanding";
import { StatusBar } from "expo-status-bar";
import { SettingsProvider } from "../src/state/settings";
import { FavouritesProvider } from "../src/state/favourites";
import { AuthProvider, useAuth } from "../src/auth/AuthProvider";
import { useWebRouteTransition } from "../src/ui/motion";
import { theme } from "../src/ui/theme";
import PwaUpdateManager from "../src/pwa/PwaUpdateManager";

function AppStack() {
  const { state } = useAuth();
  const pathname = usePathname();
  const pwa = Platform.OS === "web";
  const routeTransition = useWebRouteTransition(pathname, pwa);
  const authorized = state.status === "authorized";
  // The first-paint HTML splash stays until access checking is complete.
  useEffect(() => {
    if (Platform.OS === "web" && state.status !== "checking") {
      document.getElementById("synapse-startup")?.remove();
    }
  }, [state.status]);

  // Keep the browser URL intact while checking access, before Expo can redirect a protected route.
  if (Platform.OS === "web" && !authorized) return <AuthLanding />;

  const stack = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
        animation: pwa ? "none" : undefined,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Protected guard={authorized}>
        <Stack.Screen name="home" />
        <Stack.Screen name="tools" />
      </Stack.Protected>
    </Stack>
  );

  if (!pwa) return stack;

  return (
    <View
      style={{
        flex: 1,
        minHeight: "100dvh" as any,
        backgroundColor: theme.colors.backgroundBase,
      }}
    >
      <Animated.View
        testID="web-route-transition"
        style={[
          {
            flex: 1,
            width: "100%",
            viewTransitionName: "ambuassist-route",
          } as any,
          routeTransition,
        ]}
      >
        {stack}
      </Animated.View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <FavouritesProvider>
          <PwaUpdateManager />
          <StatusBar style="light" translucent backgroundColor="transparent" />
          <AppStack />
        </FavouritesProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
