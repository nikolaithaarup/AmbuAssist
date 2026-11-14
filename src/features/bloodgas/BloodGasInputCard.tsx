import { Text, View } from "react-native";
import { useT } from "../../i18n/useT";
import { useSettings } from "../../state/settings";
import { Card, Input, Label } from "../../ui/Ui";
import { useResponsiveLayout } from "../../ui/responsive";
import { theme } from "../../ui/theme";
import { VGAS_FIELDS } from "./fieldConfig";
import { validateBloodGasField } from "./helpers";
import type { BloodGasFieldKey, BloodGasFormValues } from "./types";

type Props = { values: BloodGasFormValues; onChange: (key: BloodGasFieldKey, value: string) => void; fields: BloodGasFieldKey[]; title?: string; embedded?: boolean };

export function BloodGasInputCard({ values, onChange, fields, title, embedded = false }: Props) {
  const { t } = useT();
  const { settings } = useSettings();
  const { isCompact, isExpanded } = useResponsiveLayout();
  const isDa = settings.language === "da";
  const content = <>
      {title ? <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "800" }}>{title}</Text> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: isCompact ? 9 : 12 }}>
        {fields.map((fieldKey) => {
          const field = VGAS_FIELDS[fieldKey];
          const validation = validateBloodGasField(fieldKey, values[fieldKey]);
          const helper = isDa ? field.helperDa : field.helperEn;
          const translatedLabel = t(field.labelKey as any);
          const label = field.unit ? translatedLabel.replace(/\s*\([^)]*\)\s*$/, "") : translatedLabel;
          return (
            <View
              key={field.id}
              style={{
                gap: 5,
                minWidth: isCompact ? 118 : 132,
                flexGrow: 1,
                flexBasis: isExpanded ? "30%" : "46%",
              }}
            >
              <View style={{ minHeight: 20, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <Label>{label}</Label>
                {field.unit ? <Text style={{ color: theme.colors.mutedText, fontSize: 11, fontWeight: "700" }}>{field.unit}</Text> : null}
              </View>
              <Input
                value={values[field.id]}
                onChangeText={(text) => onChange(field.id, text)}
                placeholder="—"
                accessibilityLabel={`${label}${field.unit ? `, ${field.unit}` : ""}`}
                keyboardType="decimal-pad"
                returnKeyType="next"
                autoCapitalize="none"
                autoCorrect={false}
                selectTextOnFocus
                style={[
                  { minHeight: 44, paddingVertical: 8 },
                  validation === "invalid" || validation === "implausible" ? { borderColor: theme.colors.danger } : undefined,
                ] as any}
              />
              {validation === "invalid" ? <Text style={{ color: theme.colors.danger, fontSize: 12 }}>{isDa ? "Indtast et gyldigt tal" : "Enter a valid number"}</Text> : null}
              {validation === "implausible" ? <Text style={{ color: theme.colors.danger, fontSize: 12 }}>{isDa ? "Kontrollér værdien og enheden" : "Check the value and unit"}</Text> : null}
              {field.reference ? <Text style={{ color: theme.colors.mutedText, fontSize: 11 }}>{isDa ? "Reference" : "Reference"}: {field.reference}{field.unit ? ` ${field.unit}` : ""}</Text> : null}
              {helper ? <Text style={{ color: theme.colors.mutedText, fontSize: 12, lineHeight: 17 }}>{helper}</Text> : null}
            </View>
          );
        })}
      </View>
    </>;
  return embedded ? <View style={{ gap: 10 }}>{content}</View> : <Card style={{ gap: 10 }}>{content}</Card>;
}
