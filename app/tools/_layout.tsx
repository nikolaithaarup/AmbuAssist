import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef } from "react";
import { Platform, Pressable, StatusBar, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "../../src/i18n/useT";
import { FAVOURITABLE_TOOLS } from "../../src/features/tools/catalog";
import { useFavourites } from "../../src/state/favourites";
import { Background } from "../../src/ui/Background";
import { hapticFavourite } from "../../src/ui/haptics";
import { theme } from "../../src/ui/theme";
import { recordToolOpen, usageToolForPath } from "../../src/analytics/usage";
import { runWebRouteTransition } from "../../src/ui/motion";
import {
  EXPANDED_TOOL_RAIL_WIDTH,
  useResponsiveLayout,
} from "../../src/ui/responsive";
import {
  beginBackNavigation,
  navigateBackOrFallback,
  releaseBackNavigationOnRouteCommit,
  type BackNavigationGate,
} from "../../src/ui/navigation";

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
  "/tools/about-support": "tool_about_support_title",
  "/tools/assessment-tools/news2": "tool_news2_title",
  "/tools/assessment-tools/wells-dvt": "tool_wells_title",
  "/tools/assessment-tools/spinal-trauma": "tool_spine_title",
  "/tools/assessment-tools/neurological": "tool_neuro_title",
  "/tools/assessment-tools/paediatric": "tool_paediatric_title",
  "/tools/assessment-tools/behavioural-geriatric":
    "tool_behaviouralGeriatric_title",
  "/tools/assessment-tools/cardiac-resus": "tool_cardiacResus_title",
  "/tools/assessment-tools/cardiac-resus/session": "tool_cardiacResus_active_title",
  "/tools/assessment-tools/cardiac-resus/summary": "tool_cardiacResus_summary_title",
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
  const { isCompact, isExpanded } = useResponsiveLayout();
  const showExpandedRail = Platform.OS === "web" && isExpanded;
  const statusBarH =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : insets.top;
  const headerBarHeight =
    Platform.OS === "web" ? (isCompact ? 50 : 54) : HEADER_BAR_HEIGHT;
  const topOffset = statusBarH + headerBarHeight;
  const title = useMemo(() => {
    const key = TITLE_KEYS[pathname];
    if (key) return t(key);
    const slug = pathname.split("/").filter(Boolean).at(-1) ?? "";
    return slug
      .replaceAll("-", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }, [pathname, t]);
  const favourite = isFavourite(pathname);
  const canFavourite = FAVOURITABLE_TOOLS.some(
    (tool) => tool.path === pathname,
  );
  const trackedTool = useRef<string | null>(null);
  const backNavigationGate = useRef<BackNavigationGate>({
    pendingFromPath: null,
  });

  useEffect(() => {
    releaseBackNavigationOnRouteCommit(backNavigationGate.current, pathname);
  }, [pathname]);

  const handleBack = () => {
    beginBackNavigation(
      backNavigationGate.current,
      Platform.OS,
      pathname,
      () =>
        runWebRouteTransition("back", () => navigateBackOrFallback(router)),
    );
  };

  const favouriteControl = showBack && canFavourite ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={favourite ? "Remove favourite" : "Add favourite"}
      onPress={() => {
        hapticFavourite();
        toggleFavourite(pathname);
      }}
      hitSlop={8}
      style={({ pressed }) => ({
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
  ) : null;

  useEffect(() => {
    const tool = usageToolForPath(pathname);
    if (!tool || trackedTool.current === tool) return;
    trackedTool.current = tool;
    void recordToolOpen(tool);
  }, [pathname]);

  return (
    <Background>
      <ExpoStatusBar style="light" translucent />
      {showExpandedRail ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: EXPANDED_TOOL_RAIL_WIDTH,
            zIndex: 1000,
            paddingTop: statusBarH + 14,
            paddingBottom: insets.bottom + 14,
            paddingLeft: insets.left + 10,
            paddingRight: 10,
            borderRightWidth: 1,
            borderRightColor: theme.colors.divider,
            backgroundColor: "rgba(16,19,15,0.90)",
            gap: 12,
          }}
        >
          <Text
            style={{
              color: theme.colors.accentMuted,
              fontSize: 14,
              fontWeight: "900",
              letterSpacing: 0.2,
            }}
          >
            ∞ AmbuAssist
          </Text>
          <Text
            numberOfLines={3}
            style={{
              color: theme.colors.text,
              fontSize: 17,
              lineHeight: 22,
              fontWeight: "800",
            }}
          >
            {title}
          </Text>
          {showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={handleBack}
              style={({ pressed }) => ({
                minHeight: 48,
                justifyContent: "center",
                borderRadius: theme.radii.control,
                paddingHorizontal: 12,
                backgroundColor: pressed
                  ? theme.colors.pressed
                  : theme.colors.accentSurface,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                opacity: pressed ? 0.78 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: theme.colors.accentMuted,
                }}
              >
                ‹ Back
              </Text>
            </Pressable>
          ) : null}
          <View style={{ flex: 1 }} />
          {favouriteControl}
        </View>
      ) : (
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
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={handleBack}
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
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: theme.colors.accentMuted,
              }}
            >
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
            marginHorizontal: 74,
          }}
        >
          {title}
        </Text>

        {favouriteControl ? (
          <View
            style={{
              position: "absolute",
              right: 8,
              bottom: 4,
            }}
          >
            {favouriteControl}
          </View>
        ) : null}
        </View>
      )}

      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === "web" ? "none" : undefined,
          contentStyle: {
            backgroundColor: "transparent",
            paddingTop: showExpandedRail ? statusBarH : topOffset,
            paddingLeft: showExpandedRail ? EXPANDED_TOOL_RAIL_WIDTH : 0,
          },
        }}
      />
    </Background>
  );
}
