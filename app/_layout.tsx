// app/_layout.tsx
import { Stack, usePathname } from "expo-router";
import { Animated, Platform, View } from "react-native";
import AuthLanding from "../src/features/auth/AuthLanding";
import { StatusBar } from "expo-status-bar";
import { SettingsProvider } from "../src/state/settings";
import { FavouritesProvider } from "../src/state/favourites";
import { AuthProvider, useAuth } from "../src/auth/AuthProvider";
import { useWebRouteTransition } from "../src/ui/motion";
import { theme } from "../src/ui/theme";

function AppStack() {
  const { state } = useAuth();
  const pathname = usePathname();
  const pwa = Platform.OS === "web";
  const routeTransition = useWebRouteTransition(pathname, pwa);
  const authorized = state.status === "authorized";
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
        backgroundColor: theme.colors.backgroundBase,
      }}
    >
      <Animated.View style={[{ flex: 1 }, routeTransition]}>
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
          <StatusBar style="light" translucent backgroundColor="transparent" />
          <AppStack />
        </FavouritesProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
