import { Alert, Linking, Pressable, Text, View } from "react-native";
import { theme } from "../../../ui/theme";

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
        Alert.alert("Kunne ikke åbne link", url);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Fejl", "Linket kunne ikke åbnes.");
    }
  };
  const Wrapper = url ? Pressable : View;

  return (
    <Wrapper
      {...(url
        ? {
            onPress: openSource,
            style: ({ pressed }: { pressed: boolean }) => ({
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.06)",
              opacity: pressed ? 0.75 : 1,
            }),
          }
        : {
            style: {
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.06)",
            },
          })}
    >
      <Text
        style={{
          color: url
            ? (theme.colors.primary ?? theme.colors.text)
            : theme.colors.text,
          fontSize: 14,
          fontWeight: "800",
          lineHeight: 18,
          textDecorationLine: url ? "underline" : "none",
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
    </Wrapper>
  );
}

export function SourceFolderLink({ label, url }: { label: string; url: string }) {
  const openFolder = async () => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Kunne ikke åbne link", url);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Fejl", "Mappen kunne ikke åbnes.");
    }
  };

  return (
    <Pressable
      onPress={openFolder}
      style={({ pressed }) => ({
        marginTop: 12,
        alignSelf: "flex-start",
        opacity: pressed ? 0.75 : 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        backgroundColor: "rgba(220,220,220,0.12)",
      })}
    >
      <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 12 }}>
        {label}
      </Text>
    </Pressable>
  );
}
