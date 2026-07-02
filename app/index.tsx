import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, View } from "react-native";
import { FAVOURITABLE_TOOLS, HOME_TOOLS, type ToolDefinition } from "../src/features/tools/catalog";
import { useT } from "../src/i18n/useT";
import { useFavourites } from "../src/state/favourites";
import { useSettings } from "../src/state/settings";
import { Background } from "../src/ui/Background";
import { hapticFavourite, hapticToolOpen } from "../src/ui/haptics";
import { theme } from "../src/ui/theme";
import { Card, Screen, Subtle, Title } from "../src/ui/Ui";

function FullWidthToolCard({
  title,
  description,
  favourite,
  onPress,
  onToggleFavourite,
}: {
  title: string;
  description?: string;
  favourite: boolean;
  onPress: () => void;
  onToggleFavourite: () => void;
}) {
  return (
    <Card
      style={{
        paddingHorizontal: 0,
        paddingVertical: 0,
        minHeight: description ? 70 : 58,
        flexDirection: "row",
        alignItems: "stretch",
      }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => ({
          flex: 1,
          justifyContent: "center",
          paddingLeft: 18,
          paddingVertical: description ? 17 : 14,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <View style={{ alignItems: "flex-start", gap: 5 }}>
          <Title style={{ fontSize: 17, letterSpacing: -0.1 }}>{title}</Title>
          {description ? <Subtle style={{ fontSize: 13 }}>{description}</Subtle> : null}
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={favourite ? "Remove favourite" : "Add favourite"}
        hitSlop={4}
        onPress={onToggleFavourite}
        style={({ pressed }) => ({
          width: 58,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        })}
      >
        <Title style={{ fontSize: 24, color: favourite ? theme.colors.warn : theme.colors.mutedText }}>
          {favourite ? "★" : "☆"}
        </Title>
      </Pressable>
    </Card>
  );
}

export default function Home() {
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
    <FullWidthToolCard
      key={`${titleOnly ? "favourite" : "tool"}-${tool.path}`}
      title={t(tool.titleKey)}
      description={!titleOnly && tool.descKey ? t(tool.descKey) : undefined}
      favourite={isFavourite(tool.path)}
      onPress={() => openTool(tool)}
      onToggleFavourite={() => toggleTool(tool)}
    />
  );

  return (
    <Background variant="home">
      <Screen style={{ paddingTop: 8 }}>
        <View style={{ gap: 0, alignItems: "center", paddingBottom: 12 }}>
          <Image
            source={require("../assets/her-icon.png")}
            style={{ width: 88, height: 88, marginTop: 10, marginBottom: 0, opacity: 0.95 }}
            resizeMode="contain"
          />
          <Image
            source={require("../assets/ambuassist-logo.png")}
            style={{ width: "100%", maxWidth: 440, height: 76, marginTop: -14, marginBottom: -8 }}
            resizeMode="contain"
          />
          <Subtle style={{ textAlign: "center", marginTop: 0, fontSize: 14 }}>{t("homeTagline")}</Subtle>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14, marginBottom: 0, alignItems: "center", justifyContent: "center" }}>
            {(["en", "da"] as const).map((language) => (
              <Pressable
                key={language}
                onPress={() => setLanguage(language)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.82 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  padding: 7,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor: settings.language === language ? theme.colors.accentSurface : "transparent",
                  alignSelf: "center",
                })}
                accessibilityRole="button"
                accessibilityLabel={language === "en" ? "English" : "Dansk"}
              >
                <Image
                  source={language === "en" ? require("../assets/flags/gb.png") : require("../assets/flags/dk.png")}
                  style={{ width: 32, height: 32, borderRadius: 8 }}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24, paddingTop: 8, paddingHorizontal: 8, alignItems: "center" }}>
          <View style={{ width: "100%", maxWidth: 560, gap: 12 }}>
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
          </View>
        </ScrollView>
      </Screen>
    </Background>
  );
}
