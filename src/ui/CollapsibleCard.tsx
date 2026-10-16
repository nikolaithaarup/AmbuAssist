// src/ui/CollapsibleCard.tsx
import { PropsWithChildren, useState } from "react";
import { Animated, Platform, Pressable, Text, View } from "react-native";
import { Card } from "./Ui";
import { theme } from "./theme";
import { usePressFeedback, useReducedMotionPreference } from "./motion";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
}>;

export function CollapsibleCard({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const pwa = Platform.OS === "web";
  const reducedMotion = useReducedMotionPreference(pwa);
  const pressFeedback = usePressFeedback(0.99);

  const toggleOpen = () => {
    setOpen((current) => !current);
  };

  const trigger = (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={toggleOpen}
      onPressIn={pwa ? pressFeedback.onPressIn : undefined}
      onPressOut={pwa ? pressFeedback.onPressOut : undefined}
      style={({ pressed }) => ({
        minHeight: pwa ? 48 : undefined,
        justifyContent: "center",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 18,
              fontWeight: "900",
            }}
          >
            {title}
          </Text>

          {!!subtitle && !open ? (
            <Text
              style={{
                color: theme.colors.mutedText,
                fontSize: 12,
                lineHeight: 17,
                marginTop: 4,
              }}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <Text
          style={{
            color: theme.colors.mutedText,
            fontSize: 18,
            fontWeight: "900",
          }}
        >
          {open ? "▾" : "▸"}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <Card>
      {pwa ? (
        <Animated.View style={pressFeedback.animatedStyle}>
          {trigger}
        </Animated.View>
      ) : (
        trigger
      )}

      {pwa ? (
        <View
          accessibilityElementsHidden={!open}
          importantForAccessibility={open ? "auto" : "no-hide-descendants"}
          pointerEvents={open ? "auto" : "none"}
          style={
            {
              display: "grid",
              gridTemplateRows: open ? "1fr" : "0fr",
              transition: reducedMotion
                ? "none"
                : "grid-template-rows 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            } as any
          }
        >
          <View
            style={
              {
                minHeight: 0,
                overflow: "hidden",
                opacity: open ? 1 : 0,
                visibility: open ? "visible" : "hidden",
                transform: [{ translateY: open ? 0 : -4 }],
                transition: reducedMotion
                  ? "none"
                  : open
                    ? "opacity 150ms ease-out, transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1), visibility 0s"
                    : "opacity 110ms ease-in, transform 150ms ease-in, visibility 0s linear 180ms",
              } as any
            }
          >
            <View style={{ marginTop: 10 }}>{children}</View>
          </View>
        </View>
      ) : open ? (
        <View style={{ marginTop: 10 }}>{children}</View>
      ) : null}
    </Card>
  );
}
