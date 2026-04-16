import { Alert, Linking, Pressable, Text, View } from "react-native";
import { theme } from "../../ui/theme";

export function SourceItem({
  title,
  subtitle,
  url,
}: {
  title: string;
  subtitle?: string;
  url?: string;
}) {
  const openSource = async () => {
    if (!url) return;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Could not open link", url);
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "The link could not be opened.");
    }
  };

  if (url) {
    return (
      <Pressable
        onPress={openSource}
        style={({ pressed }) => ({
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.06)",
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text
          style={{
            color: "#8ec5ff",
            fontSize: 14,
            fontWeight: "800",
            lineHeight: 18,
            textDecorationLine: "underline",
          }}
        >
          {title}
        </Text>

        {!!subtitle && (
          <Text
            style={{
              color: theme.colors.mutedText,
              fontSize: 12,
              lineHeight: 17,
              marginTop: 4,
            }}
          >
            {subtitle}
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <View
      style={{
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.06)",
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: "800",
          lineHeight: 18,
        }}
      >
        {title}
      </Text>

      {!!subtitle && (
        <Text
          style={{
            color: theme.colors.mutedText,
            fontSize: 12,
            lineHeight: 17,
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
