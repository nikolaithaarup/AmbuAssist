import { useRouter } from "expo-router";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
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
import { Screen, Subtle, Title } from "../src/ui/Ui";
import { usePressFeedback } from "../src/ui/motion";

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

  return (
    <Animated.View style={pwa ? pressFeedback.animatedStyle : undefined}>
      <Pressable
        onPress={onPress}
        onPressIn={pwa ? pressFeedback.onPressIn : undefined}
        onPressOut={pwa ? pressFeedback.onPressOut : undefined}
        style={({ pressed }) => ({
          opacity: pressed ? 0.82 : 1,
          transform: pwa ? undefined : [{ scale: pressed ? 0.96 : 1 }],
          minWidth: pwa ? 50 : 44,
          minHeight: pwa ? 50 : 44,
          padding: compact ? 9 : 7,
          borderRadius: pwa ? 15 : compact ? 12 : 14,
          borderWidth: 1,
          borderColor:
            pwa && selected
              ? "rgba(174,190,144,0.38)"
              : theme.colors.cardBorder,
          backgroundColor: selected
            ? theme.colors.accentSurface
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

export default function Home() {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const pwa = Platform.OS === "web";
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
      description={
        !pwa && !compact && !titleOnly && tool.descKey ? t(tool.descKey) : undefined
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
        paddingTop: pwa ? (compact ? 2 : 8) : 0,
        paddingBottom: pwa ? (compact ? 10 : 16) : compact ? 4 : 12,
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
    <View style={{ width: "100%", maxWidth: pwa ? 600 : 560, gap: compact ? 10 : 12 }}>
      {favouriteTools.length > 0 ? (
        <>
          <Title style={{ fontSize: 19, marginBottom: 2 }}>
            {settings.language === "da" ? "Favoritter" : "Favourites"}
          </Title>
          {favouriteTools.map((tool) => renderTool(tool, true))}
          <View style={{ height: 6 }} />
        </>
      ) : null}

      <Title style={{ fontSize: 19, marginBottom: 2 }}>
        {settings.language === "da" ? "Værktøjer" : "Tools"}
      </Title>
      {HOME_TOOLS.map((tool) => renderTool(tool))}

      <View style={{ height: 8 }} />
      <Title style={{ fontSize: 16, marginBottom: 0, color: theme.colors.mutedText }}>
        App & support
      </Title>
      <NavigationCard
        testID="home-about-support"
        title={t(ABOUT_SUPPORT_TOOL.titleKey)}
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
              alignItems: "center",
            }}
          >
            {hero}
            {menu}
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
