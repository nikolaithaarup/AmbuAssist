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
          minWidth: 44,
          minHeight: 44,
          padding: compact ? 6 : 7,
          borderRadius: 12,
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
                ? { width: 24, height: 24, borderRadius: 6 }
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
      testID="home-section-header"
      style={{
        minHeight: 21,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 5,
        marginBottom: 2,
      }}
    >
      <Text style={{
        color: theme.colors.headingAccent,
        fontSize: 12,
        lineHeight: 17,
        letterSpacing: 0.8,
        fontWeight: "900",
        textTransform: "uppercase",
      }}>
        {title}
      </Text>
      {typeof count === "number" ? (
        <Text style={{
          color: theme.colors.mutedText,
          fontSize: 12,
          lineHeight: 17,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
        }}>
          {count}
        </Text>
      ) : null}
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
      compact
      favourite={isFavourite(tool.path)}
      onPress={() => openTool(tool)}
      onToggleFavourite={() => toggleTool(tool)}
    />
  );

  const hero = (
    <View
      testID="home-hero"
      style={{
        width: "100%",
        alignItems: "center",
        paddingTop: 0,
        paddingBottom: compact ? 6 : 10,
      }}
    >
      <View style={{ width: "100%", alignItems: "center", position: "relative" }}>
        <Image
          testID="home-brand-icon"
          source={require("../assets/synapse-icon.png")}
          style={{
            width: compact ? 112 : 136,
            height: compact ? 56 : 68,
            overflow: "hidden",
          }}
          resizeMode="cover"
        />
        <Image
          testID="home-brand-wordmark"
          source={require("../assets/ambuassist-logo.png")}
          style={{
            width: "100%",
            maxWidth: compact ? 274 : 312,
            height: compact ? 38 : 43,
            marginTop: -4,
          }}
          resizeMode="contain"
        />
        {pwa ? (
          <Subtle
            style={{
              textAlign: "center",
              marginTop: -3,
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {t("homeTagline")}
          </Subtle>
        ) : null}
        <View
          testID="home-language-controls"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          {(["en", "da"] as const).map((language) => (
            <LanguageButton
              key={language}
              language={language}
              selected={settings.language === language}
              compact
              onPress={() => setLanguage(language)}
            />
          ))}
        </View>
      </View>
      {!pwa && !compact ? (
        <Subtle style={{ textAlign: "center", fontSize: 13, lineHeight: 18 }}>
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
        gap: compact ? 6 : 8,
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
        compact
        testID="home-about-support"
        title={t(ABOUT_SUPPORT_TOOL.titleKey)}
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
