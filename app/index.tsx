// app/index.tsx
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useT } from "../src/i18n/useT";
import {
  getToolById,
  HOME_TOOLS,
  type HomeTool,
} from "../src/navigation/toolRegistry";
import { useSettings } from "../src/state/settings";
import { useToolPreferences } from "../src/state/toolPreferences";
import { Background } from "../src/ui/Background";
import { InteractiveSurface } from "../src/ui/InteractiveSurface";
import { Card, Screen, Subtle, Title } from "../src/ui/Ui";
import { theme } from "../src/ui/theme";

function FullWidthToolCard({
  title,
  description,
  onPress,
  favourite,
  favouriteActionLabel,
  onFavouritePress,
  showDescription,
}: {
  title: string;
  description: string;
  onPress: () => void;
  favourite: boolean;
  favouriteActionLabel: string;
  onFavouritePress: () => void;
  showDescription: boolean;
}) {
  return (
    <Card
      style={{
        width: "100%",
        padding: 0,
        gap: 0,
        flexDirection: "row",
      }}
    >
      <InteractiveSurface
        onPress={onFavouritePress}
        accessibilityLabel={`${favouriteActionLabel}: ${title}`}
        style={{
          width: 52,
          minHeight: theme.touchTarget.minimum,
          alignItems: "center",
          justifyContent: "center",
          borderRightWidth: 1,
          borderRightColor: theme.colors.cardBorder,
        }}
      >
        <Text
          accessible={false}
          style={{
            color: favourite ? theme.colors.ok : theme.colors.mutedText,
            fontSize: 22,
            lineHeight: 26,
            fontWeight: "700",
            opacity: favourite ? 0.9 : 0.65,
          }}
        >
          {favourite ? "★" : "☆"}
        </Text>
      </InteractiveSurface>

      <InteractiveSurface
        onPress={onPress}
        accessibilityLabel={title}
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: showDescription
            ? theme.spacing.md
            : theme.spacing.sm,
          justifyContent: "center",
        }}
      >
        <View style={{ alignItems: "flex-start", gap: theme.spacing.xxs }}>
          <Title style={{ textAlign: "left", ...theme.typography.toolTitle }}>
            {title}
          </Title>
          {showDescription && (
            <Subtle
              style={{
                textAlign: "left",
                ...theme.typography.toolDescription,
                opacity: 0.72,
              }}
            >
              {description}
            </Subtle>
          )}
        </View>
      </InteractiveSurface>
    </Card>
  );
}

function ToolSection({
  title,
  tools,
  renderTool,
  showDescriptions,
}: {
  title: string;
  tools: readonly HomeTool[];
  renderTool: (tool: HomeTool, showDescription: boolean) => ReactNode;
  showDescriptions: boolean;
}) {
  if (tools.length === 0) return null;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 17,
          lineHeight: 22,
          fontWeight: "800",
          paddingHorizontal: theme.spacing.xxs,
        }}
      >
        {title}
      </Text>
      <View style={{ gap: theme.spacing.sm }}>
        {tools.map((tool) => renderTool(tool, showDescriptions))}
      </View>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const { setLanguage, settings } = useSettings();
  const {
    favouriteIds,
    recentIds,
    addToFavourites,
    removeFromFavourites,
    recordToolOpened,
  } = useToolPreferences();
  const { t } = useT();

  const favouriteTools = favouriteIds.map(getToolById);
  const recentTools = recentIds.map(getToolById);

  function openTool(tool: HomeTool) {
    recordToolOpened(tool.id);
    router.push(tool.path);
  }

  function renderTool(tool: HomeTool, showDescription: boolean) {
    const favourite = favouriteIds.includes(tool.id);
    const favouriteActionLabel = favourite
      ? t("home_remove_favourite")
      : t("home_add_favourite");

    return (
      <FullWidthToolCard
        key={tool.id}
        title={t(tool.titleKey)}
        description={t(tool.descKey)}
        favourite={favourite}
        favouriteActionLabel={favouriteActionLabel}
        showDescription={showDescription}
        onPress={() => openTool(tool)}
        onFavouritePress={() =>
          favourite
            ? removeFromFavourites(tool.id)
            : addToFavourites(tool.id)
        }
      />
    );
  }

  return (
    <Background>
      <Screen>
        <View style={{ gap: 0, alignItems: "center" }}>
          <Image
            source={require("../assets/her-icon.png")}
            style={{
              width: 130,
              height: 130,
              marginTop: 20,
              marginBottom: 0,
              opacity: 0.95,
            }}
            resizeMode="contain"
          />

          <Image
            source={require("../assets/ambuassist-logo.png")}
            style={{
              width: "100%",
              maxWidth: 440,
              height: 96,
              marginTop: -20,
              marginBottom: -10,
            }}
            resizeMode="contain"
          />

          <Subtle style={{ textAlign: "center", marginTop: -2 }}>
            {t("homeTagline")}
          </Subtle>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 10,
              marginBottom: -10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Pressable
              onPress={() => setLanguage("en")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 6,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                backgroundColor:
                  settings.language === "en"
                    ? "rgba(220,220,220,0.18)"
                    : "transparent",
                alignSelf: "center",
              })}
              accessibilityRole="button"
              accessibilityLabel="English"
            >
              <Image
                source={require("../assets/flags/gb.png")}
                style={{ width: 32, height: 32, borderRadius: 8 }}
                resizeMode="cover"
              />
            </Pressable>

            <Pressable
              onPress={() => setLanguage("da")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 6,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                backgroundColor:
                  settings.language === "da"
                    ? "rgba(220,220,220,0.18)"
                    : "transparent",
                alignSelf: "center",
              })}
              accessibilityRole="button"
              accessibilityLabel="Dansk"
            >
              <Image
                source={require("../assets/flags/dk.png")}
                style={{ width: 32, height: 32, borderRadius: 8 }}
                resizeMode="cover"
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingBottom: 24,
            paddingTop: 10,
            paddingHorizontal: 12,
            alignItems: "center",
          }}
        >
          <View style={{ width: "100%", maxWidth: 520, gap: theme.spacing.xl }}>
            <ToolSection
              title={t("home_favourites")}
              tools={favouriteTools}
              renderTool={renderTool}
              showDescriptions={false}
            />
            <ToolSection
              title={t("home_recent")}
              tools={recentTools}
              renderTool={renderTool}
              showDescriptions={false}
            />
            <ToolSection
              title={t("home_all_tools")}
              tools={HOME_TOOLS}
              renderTool={renderTool}
              showDescriptions
            />
          </View>
        </ScrollView>
      </Screen>
    </Background>
  );
}
