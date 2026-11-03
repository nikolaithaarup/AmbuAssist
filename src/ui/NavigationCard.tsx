import { useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { theme } from "./theme";
import {
  runWebRouteTransition,
  usePressFeedback,
  useStateChangeFeedback,
} from "./motion";

type NavigationCardProps = {
  title: string;
  description?: string;
  symbol?: string;
  onPress: () => void;
  favourite?: boolean;
  onToggleFavourite?: () => void;
  secondary?: boolean;
  testID?: string;
};

const platformDepth = Platform.select<StyleProp<ViewStyle>>({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  android: { elevation: 3 },
  web: { boxShadow: "0 6px 18px rgba(0,0,0,0.22)" } as ViewStyle,
  default: {},
});

export function NavigationCard({
  title,
  description,
  symbol,
  onPress,
  favourite = false,
  onToggleFavourite,
  secondary = false,
  testID,
}: NavigationCardProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [favouriteFocused, setFavouriteFocused] = useState(false);
  const pwa = Platform.OS === "web";
  const pressFeedback = usePressFeedback(0.985);
  const favouriteFeedback = usePressFeedback(0.96);
  const favouriteChangeFeedback = useStateChangeFeedback(favourite, 1.025);
  const favouriteButton = onToggleFavourite ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={favourite ? "Remove favourite" : "Add favourite"}
      accessibilityState={{ selected: favourite }}
      onPress={onToggleFavourite}
      onPressIn={favouriteFeedback.onPressIn}
      onPressOut={favouriteFeedback.onPressOut}
      onFocus={() => setFavouriteFocused(true)}
      onBlur={() => setFavouriteFocused(false)}
      hitSlop={2}
      style={({ pressed }) => ({
        flex: pwa ? 1 : undefined,
        width: pwa ? undefined : 52,
        minHeight: pwa ? 66 : 58,
        alignItems: "center",
        justifyContent: "center",
        borderLeftWidth: 1,
        borderLeftColor: favouriteFocused ? theme.colors.focus : theme.colors.divider,
        backgroundColor: pressed
          ? theme.colors.pressed
          : favouriteFocused
            ? "rgba(174,190,144,0.14)"
            : "transparent",
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Text
        style={{
          color: favourite ? theme.colors.warn : theme.colors.mutedText,
          fontSize: 24,
          lineHeight: 28,
          fontWeight: "800",
        }}
      >
        {favourite ? "★" : "☆"}
      </Text>
    </Pressable>
  ) : null;

  return (
    <Animated.View
      testID={testID}
      style={[
        {
          minHeight: pwa ? (description ? 82 : 66) : description ? 72 : 58,
          flexDirection: "row",
          alignItems: "stretch",
          overflow: "hidden",
          borderRadius: pwa ? theme.radii.card : 18,
          borderWidth: 1,
          borderColor: focused || favouriteFocused
            ? "rgba(174,190,144,0.52)"
            : secondary
              ? "rgba(190,202,165,0.12)"
              : "rgba(190,202,165,0.20)",
          backgroundColor: secondary
            ? "rgba(31,35,28,0.58)"
            : theme.colors.interactive,
        },
        platformDepth,
        pressFeedback.animatedStyle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={description ? `${title}. ${description}` : title}
        onPress={() => runWebRouteTransition("forward", onPress)}
        onPressIn={pressFeedback.onPressIn}
        onPressOut={pressFeedback.onPressOut}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => ({
          flex: 1,
          minHeight: pwa ? 66 : 58,
          flexDirection: "row",
          alignItems: "center",
          gap: 13,
          paddingLeft: pwa ? 15 : 14,
          paddingRight: onToggleFavourite ? 8 : 14,
          paddingVertical: description ? 14 : 12,
          backgroundColor: pressed
            ? "rgba(145,169,108,0.14)"
            : hovered || focused
              ? "rgba(255,255,255,0.045)"
              : "transparent",
          opacity: pressed ? 0.88 : 1,
        })}
      >
        {symbol ? (
          <View
            accessibilityElementsHidden
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 13,
              borderWidth: 1,
              borderColor: "rgba(174,190,144,0.22)",
              backgroundColor: theme.colors.accentSurface,
            }}
          >
            <Text
              style={{
                color: theme.colors.accentMuted,
                fontSize: 19,
                lineHeight: 22,
                fontWeight: "800",
              }}
            >
              {symbol}
            </Text>
          </View>
        ) : null}
        <View style={{ flex: 1, minWidth: 0, alignItems: "flex-start", gap: 4 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: pwa ? 18 : 17,
              lineHeight: pwa ? 22 : 21,
              fontWeight: "700",
              letterSpacing: -0.15,
            }}
          >
            {title}
          </Text>
          {description ? (
            <Text
              style={{
                color: theme.colors.mutedText,
                fontSize: 13,
                lineHeight: 18,
                fontWeight: "500",
              }}
            >
              {description}
            </Text>
          ) : null}
        </View>
        <Text
          accessibilityElementsHidden
          style={{
            color: theme.colors.accentMuted,
            fontSize: 22,
            lineHeight: 24,
            fontWeight: "600",
          }}
        >
          ›
        </Text>
      </Pressable>

      {onToggleFavourite ? (
        pwa ? (
          <Animated.View
            style={[{ width: 56 }, favouriteChangeFeedback]}
          >
            <Animated.View
              style={[{ flex: 1 }, favouriteFeedback.animatedStyle]}
            >
              {favouriteButton}
            </Animated.View>
          </Animated.View>
        ) : (
          favouriteButton
        )
      ) : null}
    </Animated.View>
  );
}
