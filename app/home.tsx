import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { ABOUT_SUPPORT_TOOL, FAVOURITABLE_TOOLS, HOME_TOOLS, type ToolDefinition } from "../src/features/tools/catalog";
import { useT } from "../src/i18n/useT";
import { useFavourites } from "../src/state/favourites";
import { useSettings } from "../src/state/settings";
import { Background } from "../src/ui/Background";
import { hapticFavourite, hapticToolOpen } from "../src/ui/haptics";
import { NavigationCard } from "../src/ui/NavigationCard";
import { theme } from "../src/ui/theme";
import { Screen, Subtle } from "../src/ui/Ui";
import { usePressFeedback } from "../src/ui/motion";
import { useResponsiveLayout } from "../src/ui/responsive";

function LanguageButton({
  language,
  selected,
  compact,
  onPress,
}: {
  language: "en" | "da";
  selected: boolean;
  compact: boolean;
  onPress: () => void;
}) {
  const pwa = Platform.OS === "web";
  const pressFeedback = usePressFeedback(0.95);
  const [focused, setFocused] = useState(false);

  return (
    <Animated.View style={pressFeedback.animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={pressFeedback.onPressIn}
        onPressOut={pressFeedback.onPressOut}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.82 : 1,
          minWidth: pwa ? 50 : 44,
          minHeight: pwa ? 50 : 44,
          padding: compact ? 9 : 7,
          borderRadius: pwa ? 15 : compact ? 12 : 14,
          borderWidth: 1,
          borderColor:
            pwa && focused
              ? theme.colors.focus
              : pwa && selected
              ? "rgba(174,190,144,0.38)"
              : theme.colors.cardBorder,
          backgroundColor: selected
            ? theme.colors.accentSurface
            : focused
              ? "rgba(174,190,144,0.14)"
            : pwa
              ? "rgba(16,19,15,0.22)"
              : "transparent",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
        })}
        accessibilityRole="button"
        accessibilityLabel={language === "en" ? "English" : "Dansk"}
        accessibilityState={{ selected }}
      >
        <Image
          source={
            language === "en"
              ? require("../assets/flags/gb.png")
              : require("../assets/flags/dk.png")
          }
          style={
            compact
              ? pwa
                ? { width: 26, height: 26, borderRadius: 7 }
                : { width: 24, height: 24, borderRadius: 6 }
              : { width: 32, height: 32, borderRadius: 8 }
          }
          resizeMode="cover"
        />
      </Pressable>
    </Animated.View>
  );
}

function HomeSectionHeader({
  title,
  count,
}: {
  title: string;
  count?: number;
}) {
  return (
    <View
      style={{
        minHeight: 34,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 2,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          lineHeight: 21,
          fontWeight: "700",
          letterSpacing: -0.1,
        }}
      >
        {title}
      </Text>
      {typeof count === "number" ? (
        <View
          style={{
            minWidth: 25,
            height: 25,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.radii.pill,
            backgroundColor: theme.colors.accentSurface,
          }}
        >
          <Text
            style={{
              color: theme.colors.accentMuted,
              fontSize: 12,
              fontWeight: "800",
            }}
          >
            {count}
          </Text>
        </View>
      ) : null}
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: theme.colors.divider,
        }}
      />
    </View>
  );
}

export default function Home() {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const pwa = Platform.OS === "web";
  const { isExpanded } = useResponsiveLayout();
  const expanded = pwa && isExpanded;
  const router = useRouter();
  const { setLanguage, settings } = useSettings();
  const { t } = useT();
  const { favourites, isFavourite, toggleFavourite } = useFavourites();
  const favouriteTools = FAVOURITABLE_TOOLS.filter((tool) => favourites.includes(tool.path));

  const openTool = (tool: ToolDefinition) => {
    hapticToolOpen();
    router.push(tool.path);
  };

  const toggleTool = (tool: ToolDefinition) => {
    hapticFavourite();
    toggleFavourite(tool.path);
  };

  const renderTool = (tool: ToolDefinition, titleOnly = false) => (
    <NavigationCard
      key={`${titleOnly ? "favourite" : "tool"}-${tool.path}`}
      title={t(tool.titleKey)}
      symbol={tool.symbol}
      description={
        !compact && !titleOnly && tool.descKey ? t(tool.descKey) : undefined
      }
      favourite={isFavourite(tool.path)}
      onPress={() => openTool(tool)}
      onToggleFavourite={() => toggleTool(tool)}
    />
  );

  const hero = (
    <View
      testID="home-hero"
      style={{
        gap: 0,
        alignItems: "center",
        paddingTop: pwa ? (compact ? 14 : 20) : 0,
        paddingBottom: pwa ? (compact ? 16 : 22) : compact ? 4 : 12,
        paddingHorizontal: pwa ? (compact ? 14 : 20) : 0,
        borderRadius: pwa ? theme.radii.largeCard : 0,
        borderWidth: pwa ? 1 : 0,
        borderColor: pwa ? "rgba(190,202,165,0.12)" : "transparent",
        backgroundColor: pwa ? "rgba(31,35,28,0.46)" : "transparent",
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: pwa ? "column" : compact ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: pwa ? 0 : compact ? 4 : 0,
        }}
      >
        <Image
          source={require("../assets/her-icon.png")}
          style={
            pwa
              ? { width: compact ? 50 : 68, height: compact ? 50 : 68, opacity: 0.96 }
              : compact
                ? { width: 48, height: 48, opacity: 0.95 }
                : { width: 88, height: 88, marginTop: 10, marginBottom: 0, opacity: 0.95 }
          }
          resizeMode="contain"
        />
        <Image
          source={require("../assets/ambuassist-logo.png")}
          style={
            pwa
              ? {
                  width: "100%",
                  maxWidth: compact ? 310 : 440,
                  height: compact ? 54 : 76,
                  marginTop: compact ? -7 : -10,
                }
              : compact
                ? { flex: 1, maxWidth: 220, height: 44 }
                : { width: "100%", maxWidth: 440, height: 76, marginTop: -14, marginBottom: -8 }
          }
          resizeMode="contain"
        />

        {pwa ? (
          <Subtle
            style={{
              textAlign: "center",
              marginTop: compact ? -3 : -5,
              fontSize: compact ? 13 : 14,
              lineHeight: 19,
            }}
          >
            {t("homeTagline")}
          </Subtle>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            gap: pwa ? 10 : compact ? 4 : 10,
            marginTop: pwa ? (compact ? 9 : 12) : compact ? 0 : 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {(["en", "da"] as const).map((language) => (
            <LanguageButton
              key={language}
              language={language}
              selected={settings.language === language}
              compact={compact}
              onPress={() => setLanguage(language)}
            />
          ))}
        </View>
      </View>
      {!pwa && !compact ? (
        <Subtle style={{ textAlign: "center", marginTop: 0, fontSize: 14 }}>
          {t("homeTagline")}
        </Subtle>
      ) : null}
    </View>
  );

  const menu = (
    <View
      style={{
        width: "100%",
        maxWidth: pwa ? (expanded ? 580 : 600) : 560,
        gap: compact ? 9 : 11,
      }}
    >
      {favouriteTools.length > 0 ? (
        <>
          <HomeSectionHeader
            title={settings.language === "da" ? "Favoritter" : "Favourites"}
            count={favouriteTools.length}
          />
          {favouriteTools.map((tool) => renderTool(tool, true))}
          <View style={{ height: 6 }} />
        </>
      ) : null}

      <HomeSectionHeader
        title={settings.language === "da" ? "Værktøjer" : "Tools"}
        count={HOME_TOOLS.length}
      />
      {HOME_TOOLS.map((tool) => renderTool(tool))}

      <View style={{ height: 8 }} />
      <HomeSectionHeader title="App & support" />
      <NavigationCard
        testID="home-about-support"
        title={t(ABOUT_SUPPORT_TOOL.titleKey)}
        symbol={ABOUT_SUPPORT_TOOL.symbol}
        description={pwa || compact ? undefined : t(ABOUT_SUPPORT_TOOL.descKey)}
        secondary
        onPress={() => openTool(ABOUT_SUPPORT_TOOL)}
      />
    </View>
  );

  return (
    <Background variant="home">
      <Screen
        edges={["top", "left", "right", "bottom"]}
        style={{
          paddingTop: pwa ? (compact ? 4 : 10) : compact ? 2 : 8,
          paddingHorizontal: pwa ? (compact ? 14 : 22) : compact ? 10 : 18,
          gap: pwa ? (compact ? 8 : 14) : compact ? 4 : 14,
        }}
      >
        {pwa ? (
          <ScrollView
            testID="home-scroll"
            contentContainerStyle={{
              paddingBottom: compact ? 6 : 14,
              paddingTop: compact ? 2 : 8,
              paddingHorizontal: compact ? 0 : 8,
              alignItems: expanded ? "flex-start" : "center",
            }}
          >
            <View
              style={{
                width: "100%",
                maxWidth: expanded ? 1060 : 600,
                alignSelf: "center",
                flexDirection: expanded ? "row" : "column",
                alignItems: expanded ? "flex-start" : "center",
                gap: expanded ? 24 : 0,
              }}
            >
              <View
                style={{
                  flex: expanded ? 0.78 : undefined,
                  width: expanded ? undefined : "100%",
                  minWidth: 0,
                  paddingTop: expanded ? 26 : 0,
                }}
              >
                {hero}
              </View>
              <View style={{ flex: expanded ? 1.22 : undefined, width: expanded ? undefined : "100%", minWidth: 0 }}>
                {menu}
              </View>
            </View>
          </ScrollView>
        ) : (
          <>
            {hero}
            <ScrollView
              contentContainerStyle={{
                paddingBottom: 28,
                paddingTop: compact ? 2 : 8,
                paddingHorizontal: compact ? 0 : 8,
                alignItems: "center",
              }}
            >
              {menu}
            </ScrollView>
          </>
        )}
      </Screen>
    </Background>
  );
}
