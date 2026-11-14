import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { theme } from "../../ui/theme";
import { BloodGasInputCard } from "./BloodGasInputCard";
import { getGroupSummary, VGAS_INPUT_GROUPS } from "./inputGroups";
import type { BloodGasFieldKey, BloodGasFormValues } from "./types";

type Props = { values: BloodGasFormValues; onChange: (key: BloodGasFieldKey, value: string) => void; isDa: boolean };

export function GroupedBloodGasInput({ values, onChange, isDa }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(VGAS_INPUT_GROUPS.map((group) => [group.id, !!group.defaultOpen])));
  return <View style={{ gap: 10 }}>{VGAS_INPUT_GROUPS.map((group) => {
    const expanded = !!open[group.id];
    const summary = getGroupSummary(group.fields, values);
    const summaryText = `${summary.entered}/${summary.total} ${isDa ? "værdier" : "values"}`;
    const issueText = summary.issues ? `${summary.issues} ${isDa ? summary.issues === 1 ? "værdi skal kontrolleres" : "værdier skal kontrolleres" : summary.issues === 1 ? "value needs checking" : "values need checking"}` : "";
    return <View key={group.id} style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.divider, paddingBottom: expanded ? 14 : 6 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={isDa ? group.titleDa : group.titleEn} accessibilityState={{ expanded }} onPress={() => setOpen((current) => ({ ...current, [group.id]: !expanded }))} style={({ pressed }) => ({ minHeight: 48, justifyContent: "center", opacity: pressed ? 0.72 : 1 })}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "800" }}>{isDa ? group.titleDa : group.titleEn}</Text>
            <Text style={{ color: theme.colors.mutedText, fontSize: 12 }}>{summaryText}{issueText ? ` · ${issueText}` : ""}</Text>
          </View>
          <Text style={{ color: issueText ? theme.colors.danger : theme.colors.accentMuted, fontSize: 20 }}>{expanded ? "−" : "+"}</Text>
        </View>
      </Pressable>
      {expanded ? <View style={{ marginTop: 4 }}><BloodGasInputCard values={values} onChange={onChange} fields={group.fields} embedded /></View> : null}
    </View>;
  })}</View>;
}
