import { useState } from "react";
import {
  Platform,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { theme } from "./theme";

type NavigationCardProps = {
  title: string;
  description?: string;
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
  onPress,
  favourite = false,
  onToggleFavourite,
  secondary = false,
  testID,
}: NavigationCardProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View
      testID={testID}
      style={[
        {
          minHeight: description ? 68 : 56,
          flexDirection: "row",
          alignItems: "stretch",
          overflow: "hidden",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: focused
            ? "rgba(174,190,144,0.52)"
            : secondary
              ? "rgba(190,202,165,0.12)"
              : "rgba(190,202,165,0.18)",
          backgroundColor: secondary
            ? "rgba(31,35,28,0.58)"
            : "rgba(38,43,34,0.78)",
        },
        platformDepth,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={description ? `${title}. ${description}` : title}
        onPress={onPress}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => ({
          flex: 1,
          minHeight: 56,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingLeft: 17,
          paddingRight: onToggleFavourite ? 8 : 14,
          paddingVertical: description ? 14 : 12,
          backgroundColor: pressed
            ? "rgba(145,169,108,0.14)"
            : hovered || focused
              ? "rgba(255,255,255,0.045)"
              : "transparent",
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        })}
      >
        <View style={{ flex: 1, alignItems: "flex-start", gap: 4 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 17,
              lineHeight: 21,
              fontWeight: "800",
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
            fontSize: 23,
            lineHeight: 24,
            fontWeight: "600",
          }}
        >
          ›
        </Text>
      </Pressable>

      {onToggleFavourite ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favourite ? "Remove favourite" : "Add favourite"}
          accessibilityState={{ selected: favourite }}
          onPress={onToggleFavourite}
          hitSlop={2}
          style={({ pressed }) => ({
            width: 54,
            minHeight: 56,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pressed
              ? "rgba(255,255,255,0.05)"
              : "transparent",
            opacity: pressed ? 0.72 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
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
      ) : null}
    </View>
  );
}
