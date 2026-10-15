// src/ui/CollapsibleCard.tsx
import { PropsWithChildren, useState } from "react";
import { LayoutAnimation, Platform, Pressable, Text, View } from "react-native";
import { Card } from "./Ui";
import { theme } from "./theme";
import { useReducedMotionPreference } from "./motion";

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
  const reducedMotion = useReducedMotionPreference(Platform.OS === "web");

  const toggleOpen = () => {
    if (Platform.OS === "web" && !reducedMotion) {
      LayoutAnimation.configureNext({
        duration: 180,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: { type: LayoutAnimation.Types.easeInEaseOut },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
    }
    setOpen((current) => !current);
  };

  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={toggleOpen}
        style={({ pressed }) => ({
          minHeight: Platform.OS === "web" ? 48 : undefined,
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

            {!!subtitle && !open && (
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
            )}
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

      {open && <View style={{ marginTop: 10 }}>{children}</View>}
    </Card>
  );
}
