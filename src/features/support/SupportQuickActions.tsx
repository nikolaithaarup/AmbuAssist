import { Pressable, Text, View } from "react-native";
import { theme } from "../../ui/theme";

type Props = {
  language: "da" | "en";
  onEmail: () => void;
  onReport: () => void;
  onStudio: () => void;
  onSibling: () => void;
};

/** Same layout and actions as FlashMedic's SynapseStudio contact page. */
export function SupportQuickActions({ language, onEmail, onReport, onStudio, onSibling }: Props) {
  const da = language === "da";
  const actions = [
    {
      id: "about-support-report-error",
      label: da ? "Rapportér fejl" : "Report a bug",
      action: onReport,
    },
    {
      id: "about-support-studio",
      label: "SynapseStudio",
      action: onStudio,
    },
  ];
  return (
    <View testID="synapsestudio-support-identity" style={{ gap: 12, paddingHorizontal: 2 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 25, lineHeight: 31 }}>
          {da ? "Kontakt & support" : "Contact & support"}
        </Text>
        <Text style={{ color: theme.colors.accentMuted, fontWeight: "800", fontSize: 14 }}>
          SynapseStudio · AmbuAssist
        </Text>
        <Text style={{ color: theme.colors.mutedText, fontSize: 12, lineHeight: 18 }}>
          {da ? "Udviklet af Nikolai Louis Kleftås Thaarup" : "Created by Nikolai Louis Kleftås Thaarup"}
        </Text>
      </View>
      <Pressable
        testID="about-support-email"
        accessibilityRole="link"
        accessibilityLabel={da ? "Skriv e-mail" : "Write an email"}
        onPress={onEmail}
        style={({ pressed }) => ({
          minHeight: 52,
          borderRadius: theme.radii.control,
          backgroundColor: theme.colors.accentMuted,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: theme.colors.onAccent, fontWeight: "900", fontSize: 16 }}>
          {da ? "Skriv e-mail" : "Write an email"}
        </Text>
      </Pressable>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {actions.map((item) => (
          <Pressable
            key={item.id}
            testID={item.id}
            accessibilityRole="link"
            accessibilityLabel={item.label}
            onPress={item.action}
            style={({ pressed }) => ({
              minHeight: 48,
              minWidth: 120,
              flexBasis: "45%",
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
              borderRadius: theme.radii.control,
              paddingHorizontal: 10,
              backgroundColor: pressed ? theme.colors.accentSurface : "transparent",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "800", textAlign: "center", fontSize: 14 }}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable accessibilityRole="link" accessibilityLabel="FlashMedic" onPress={onSibling} style={({ pressed }) => ({ alignSelf: "flex-start", minHeight: 44, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ color: theme.colors.accentMuted, fontWeight: "800", fontSize: 13 }}>
          {da ? "Også fra SynapseStudio: FlashMedic  ›" : "Also from SynapseStudio: FlashMedic  ›"}
        </Text>
      </Pressable>
    </View>
  );
}
