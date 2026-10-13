import { useRouter } from "expo-router";
import {
  Image,
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

export default function Home() {
  const { width } = useWindowDimensions();
  const compact = width < 600;
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
        !compact && !titleOnly && tool.descKey ? t(tool.descKey) : undefined
      }
      favourite={isFavourite(tool.path)}
      onPress={() => openTool(tool)}
      onToggleFavourite={() => toggleTool(tool)}
    />
  );

  return (
    <Background variant="home">
      <Screen
        edges={["top", "left", "right", "bottom"]}
        style={{
          paddingTop: compact ? 2 : 8,
          paddingHorizontal: compact ? 10 : 18,
          gap: compact ? 4 : 14,
        }}
      >
        <View style={{ gap: 0, alignItems: "center", paddingBottom: compact ? 4 : 12 }}>
          <View
            style={{
              width: "100%",
              flexDirection: compact ? "row" : "column",
              alignItems: "center",
              justifyContent: "center",
              gap: compact ? 4 : 0,
            }}
          >
            <Image
              source={require("../assets/her-icon.png")}
              style={
                compact
                  ? { width: 48, height: 48, opacity: 0.95 }
                  : { width: 88, height: 88, marginTop: 10, marginBottom: 0, opacity: 0.95 }
              }
              resizeMode="contain"
            />
            <Image
              source={require("../assets/ambuassist-logo.png")}
              style={
                compact
                  ? { flex: 1, maxWidth: 220, height: 44 }
                  : { width: "100%", maxWidth: 440, height: 76, marginTop: -14, marginBottom: -8 }
              }
              resizeMode="contain"
            />

            <View
              style={{
                flexDirection: "row",
                gap: compact ? 4 : 10,
                marginTop: compact ? 0 : 14,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {(["en", "da"] as const).map((language) => (
                <Pressable
                  key={language}
                  onPress={() => setLanguage(language)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.82 : 1,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                    minWidth: 44,
                    minHeight: 44,
                    padding: compact ? 9 : 7,
                    borderRadius: compact ? 12 : 14,
                    borderWidth: 1,
                    borderColor: theme.colors.cardBorder,
                    backgroundColor:
                      settings.language === language
                        ? theme.colors.accentSurface
                        : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                  })}
                  accessibilityRole="button"
                  accessibilityLabel={
                    language === "en" ? "English" : "Dansk"
                  }
                  accessibilityState={{
                    selected: settings.language === language,
                  }}
                >
                  <Image
                    source={
                      language === "en"
                        ? require("../assets/flags/gb.png")
                        : require("../assets/flags/dk.png")
                    }
                    style={
                      compact
                        ? { width: 24, height: 24, borderRadius: 6 }
                        : { width: 32, height: 32, borderRadius: 8 }
                    }
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </View>
          </View>
          {!compact ? (
            <Subtle style={{ textAlign: "center", marginTop: 0, fontSize: 14 }}>
              {t("homeTagline")}
            </Subtle>
          ) : null}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24, paddingTop: compact ? 2 : 8, paddingHorizontal: compact ? 0 : 8, alignItems: "center" }}>
          <View style={{ width: "100%", maxWidth: 560, gap: compact ? 10 : 12 }}>
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
              {settings.language === "da" ? "App & support" : "App & support"}
            </Title>
            <NavigationCard
              testID="home-about-support"
              title={t(ABOUT_SUPPORT_TOOL.titleKey)}
              description={compact ? undefined : t(ABOUT_SUPPORT_TOOL.descKey)}
              secondary
              onPress={() => openTool(ABOUT_SUPPORT_TOOL)}
            />
          </View>
        </ScrollView>
      </Screen>
    </Background>
  );
}
