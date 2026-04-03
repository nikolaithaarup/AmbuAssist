// src/ui/CollapsibleCard.tsx
import { PropsWithChildren, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Card } from "./Ui";
import { theme } from "./theme";

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

  return (
    <Card>
      <Pressable
        onPress={() => setOpen((p) => !p)}
        style={({ pressed }) => ({
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
