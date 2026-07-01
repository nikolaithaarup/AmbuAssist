import { Pressable, Text, View } from "react-native";
import { Subtle, Title } from "../../../ui/Ui";
import { theme } from "../../../ui/theme";

export function Header({
  title,
  subtitle,
  rightLabel,
  onRightPress,
}: {
  title: string;
  subtitle: string;
  rightLabel: string;
  onRightPress: () => void;
}) {
  return (
    <View style={{ marginTop: 12, gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Title>{title}</Title>
          <Subtle>{subtitle}</Subtle>
        </View>
        <Pressable
          onPress={onRightPress}
          style={({ pressed }) => ({
            opacity: pressed ? 0.75 : 1,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.cardBorder,
            backgroundColor: "rgba(220,220,220,0.18)",
          })}
        >
          <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
            {rightLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
