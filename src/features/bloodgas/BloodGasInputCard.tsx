import { Text, View } from "react-native";
import { useT } from "../../i18n/useT";
import { useSettings } from "../../state/settings";
import { Card, Input, Label } from "../../ui/Ui";
import { theme } from "../../ui/theme";
import { VGAS_FIELDS } from "./fieldConfig";
import { validateBloodGasField } from "./helpers";
import type { BloodGasFieldKey, BloodGasFormValues } from "./types";

type Props = { values: BloodGasFormValues; onChange: (key: BloodGasFieldKey, value: string) => void; fields: BloodGasFieldKey[]; title?: string; embedded?: boolean };

export function BloodGasInputCard({ values, onChange, fields, title, embedded = false }: Props) {
  const { t } = useT();
  const { settings } = useSettings();
  const isDa = settings.language === "da";
  const content = <>
      {title ? <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "800" }}>{title}</Text> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {fields.map((fieldKey) => {
          const field = VGAS_FIELDS[fieldKey];
          const validation = validateBloodGasField(fieldKey, values[fieldKey]);
          const helper = isDa ? field.helperDa : field.helperEn;
          return (
            <View key={field.id} style={{ gap: 8, minWidth: 140, flexGrow: 1, flexBasis: "46%" }}>
              <Label>{t(field.labelKey as any)}</Label>
              <Input value={values[field.id]} onChangeText={(text) => onChange(field.id, text)} placeholder={field.reference ? `${field.reference}${field.unit ? ` ${field.unit}` : ""}` : field.unit} keyboardType="decimal-pad" autoCapitalize="none" autoCorrect={false} selectTextOnFocus style={validation === "invalid" || validation === "implausible" ? { borderColor: theme.colors.danger } : undefined} />
              {validation === "invalid" ? <Text style={{ color: theme.colors.danger, fontSize: 12 }}>{isDa ? "Indtast et gyldigt tal" : "Enter a valid number"}</Text> : null}
              {validation === "implausible" ? <Text style={{ color: theme.colors.danger, fontSize: 12 }}>{isDa ? "Kontrollér værdien og enheden" : "Check the value and unit"}</Text> : null}
              {helper ? <Text style={{ color: theme.colors.mutedText, fontSize: 12, lineHeight: 17 }}>{helper}</Text> : null}
            </View>
          );
        })}
      </View>
    </>;
  return embedded ? <View style={{ gap: 12 }}>{content}</View> : <Card>{content}</Card>;
}
