import { Alert, Linking, Pressable, Text, View } from "react-native";
import type { ReferenceDoc } from "../../services/referenceService";
import { CollapsibleCard } from "../../ui/CollapsibleCard";
import { Subtle } from "../../ui/Ui";
import { theme } from "../../ui/theme";

export function AssessmentReferenceCards({ reference, lang, disclaimerTitle, sourcesTitle }: {
  reference: ReferenceDoc | null;
  lang: "en" | "da";
  disclaimerTitle: string;
  sourcesTitle: string;
}) {
  const disclaimer = reference?.disclaimer?.[lang] ?? "";
  const sourcesSub = reference?.sourcesSub?.[lang] ?? "";
  return (
    <>
      <CollapsibleCard title={disclaimerTitle} subtitle={disclaimer}>
        <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20 }}>{disclaimer}</Text>
      </CollapsibleCard>
      <CollapsibleCard title={sourcesTitle} subtitle={sourcesSub}>
        <Subtle style={{ marginBottom: 8 }}>{sourcesSub}</Subtle>
        {(reference?.sources ?? []).map((source) => {
          const title = source.title?.[lang] ?? source.title?.en ?? "";
          const subtitle = source.subtitle?.[lang] ?? source.subtitle?.en ?? "";
          const url = source.url?.[lang] ?? source.url?.en;
          return (
            <Pressable
              key={source.id}
              disabled={!url}
              accessibilityRole={url ? "link" : undefined}
              onPress={async () => {
                if (!url) return;
                try {
                  if (!(await Linking.canOpenURL(url))) throw new Error("unsupported");
                  await Linking.openURL(url);
                } catch {
                  Alert.alert("Could not open link", url);
                }
              }}
              style={({ pressed }) => ({ paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: theme.colors.divider, opacity: pressed ? 0.7 : 1 })}
            >
              <View style={{ gap: 3 }}>
                <Text style={{ color: theme.colors.text, fontWeight: "800", lineHeight: 19 }}>{title}</Text>
                {subtitle ? <Subtle>{subtitle}</Subtle> : null}
              </View>
            </Pressable>
          );
        })}
      </CollapsibleCard>
    </>
  );
}
