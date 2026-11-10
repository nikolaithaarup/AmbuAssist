// src/ui/CollapsibleCard.tsx
import { PropsWithChildren, useState } from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from "react-native";
import { Card } from "./Ui";
import { theme } from "./theme";
import { usePressFeedback, useReducedMotionPreference } from "./motion";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
}>;

if (
  Platform.OS === "android" &&
  typeof UIManager.setLayoutAnimationEnabledExperimental === "function"
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function CollapsibleCard({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [focused, setFocused] = useState(false);
  const pwa = Platform.OS === "web";
  const reducedMotion = useReducedMotionPreference(true);
  const pressFeedback = usePressFeedback();

  const toggleOpen = () => {
    if (!pwa && !reducedMotion) {
      LayoutAnimation.configureNext({
        duration: 220,
        update: { type: LayoutAnimation.Types.easeInEaseOut },
        create: {
          type: LayoutAnimation.Types.easeOut,
          property: LayoutAnimation.Properties.opacity,
        },
        delete: {
          type: LayoutAnimation.Types.easeIn,
          property: LayoutAnimation.Properties.opacity,
        },
      });
    }
    setOpen((current) => !current);
  };

  const trigger = (
    <Pressable
      testID="collapsible-trigger"
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={toggleOpen}
      onPressIn={pressFeedback.onPressIn}
      onPressOut={pressFeedback.onPressOut}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => ({
        minHeight: 48,
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
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 17,
              lineHeight: 22,
              fontWeight: "700",
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

        <View
          style={{
            width: 34,
            height: 34,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 11,
            backgroundColor: open
              ? theme.colors.accentSurface
              : "rgba(255,255,255,0.035)",
          }}
        >
          <Text
            style={{
              color: open ? theme.colors.accentMuted : theme.colors.mutedText,
              fontSize: 20,
              lineHeight: 22,
              fontWeight: "800",
            }}
          >
            {open ? "⌄" : "›"}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <Card style={{
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
      ...(focused ? { borderLeftWidth: 2, borderLeftColor: theme.colors.focus } : {}),
    }}>
      {pwa ? (
        <Animated.View style={pressFeedback.animatedStyle}>
          {trigger}
        </Animated.View>
      ) : (
        trigger
      )}

      {pwa ? (
        <View
          testID="collapsible-content"
          accessibilityElementsHidden={!open}
          importantForAccessibility={open ? "auto" : "no-hide-descendants"}
          style={
            {
              display: "grid",
              gridTemplateRows: open ? "1fr" : "0fr",
              pointerEvents: open ? "auto" : "none",
              transition: reducedMotion
                ? "none"
                : "grid-template-rows 240ms cubic-bezier(0.22, 1, 0.36, 1)",
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
                transform: [{ translateY: open ? 0 : -8 }],
                transition: reducedMotion
                  ? "none"
                  : open
                    ? "opacity 190ms ease-out, transform 240ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0s"
                    : "opacity 150ms ease-in, transform 190ms ease-in, visibility 0s linear 240ms",
              } as any
            }
          >
            <View style={{ marginTop: 10 }}>{children}</View>
          </View>
        </View>
      ) : open ? (
        <View testID="collapsible-content" style={{ marginTop: 10 }}>
          {children}
        </View>
      ) : null}
    </Card>
  );
}
