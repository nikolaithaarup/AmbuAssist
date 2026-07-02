import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Platform, Pressable, StatusBar, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Background } from "../../src/ui/Background";
import { hapticFavourite } from "../../src/ui/haptics";
import { theme } from "../../src/ui/theme";
import { useT } from "../../src/i18n/useT";
import { useFavourites } from "../../src/state/favourites";

const HEADER_BAR_HEIGHT = 58;
const TITLE_KEYS: Record<string, any> = {
  "/tools/destination": "tool_dest_title",
  "/tools/weight-joule-dose": "tool_weightDose_title",
  "/tools/trombolysis": "tool_trombolysis_title",
  "/tools/brandsaar": "tool_burns_title",
  "/tools/support-numbers": "tool_supportNumbers_title",
  "/tools/exams": "tool_exams_title",
  "/tools/assessment-tools": "tool_assessment_title",
  "/tools/medical-disclaimer": "tool_meddisc_title",
  "/tools/contact": "tool_contact_title",
  "/tools/about": "tool_about_title",
  "/tools/assessment-tools/news2": "tool_news2_title",
  "/tools/assessment-tools/wells-dvt": "tool_wells_title",
  "/tools/assessment-tools/spinal-trauma": "tool_spine_title",
  "/tools/assessment-tools/neurological": "tool_neuro_title",
  "/tools/assessment-tools/paediatric": "tool_paediatric_title",
  "/tools/assessment-tools/behavioural-geriatric": "tool_behaviouralGeriatric_title",
  "/tools/assessment-tools/bloodgas": "tool_bloodgas_title",
  "/tools/assessment-tools/bloodgas/acid-base": "tool_bg_acidbase_title",
  "/tools/assessment-tools/bloodgas/patterns": "tool_bg_patterns_title",
  "/tools/assessment-tools/bloodgas/infection": "tool_bg_infection_title",
};

export default function ToolsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useT();
  const { isFavourite, toggleFavourite } = useFavourites();
  const showBack = pathname !== "/tools";
  const insets = useSafeAreaInsets();
  const statusBarH =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : insets.top;
  const topOffset = statusBarH + HEADER_BAR_HEIGHT;
  const title = useMemo(() => {
    const key = TITLE_KEYS[pathname];
    if (key) return t(key);
    const slug = pathname.split("/").filter(Boolean).at(-1) ?? "";
    return slug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }, [pathname, t]);
  const favourite = isFavourite(pathname);

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
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.divider,
          backgroundColor: "rgba(16,19,15,0.84)",
        }}
      >
        {showBack ? (
          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/");
            }}
            hitSlop={10}
            style={({ pressed }) => ({
              position: "absolute",
              left: 8,
              bottom: 4,
              minHeight: 48,
              justifyContent: "center",
              paddingHorizontal: 12,
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.accentMuted }}>
              ‹ Back
            </Text>
          </Pressable>
        ) : null}

        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.text,
            fontSize: 15,
            fontWeight: "800",
            textAlign: "center",
            marginHorizontal: 86,
          }}
        >
          {title}
        </Text>

        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={favourite ? "Remove favourite" : "Add favourite"}
            onPress={() => {
              hapticFavourite();
              toggleFavourite(pathname);
            }}
            hitSlop={8}
            style={({ pressed }) => ({
              position: "absolute",
              right: 8,
              bottom: 4,
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.65 : 1,
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <Text
              style={{
                color: favourite ? theme.colors.warn : theme.colors.mutedText,
                fontSize: 25,
              }}
            >
              {favourite ? "★" : "☆"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent", paddingTop: topOffset },
        }}
      />
    </Background>
  );
}
