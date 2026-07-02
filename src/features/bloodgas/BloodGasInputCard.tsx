import { Text, View } from "react-native";
import { useT } from "../../i18n/useT";
import { Card, Input, Label } from "../../ui/Ui";
import { theme } from "../../ui/theme";
import { useSettings } from "../../state/settings";
import { parseNumber } from "./helpers";
import type { BloodGasFieldKey, BloodGasFormValues } from "./types";

type FieldConfig = {
  key: BloodGasFieldKey;
  labelKey: string;
  placeholder: string;
};

const ALL_FIELDS: Record<BloodGasFieldKey, FieldConfig> = {
  ph: { key: "ph", labelKey: "bg_label_ph", placeholder: "7.35–7.45" },
  pco2: { key: "pco2", labelKey: "bg_label_pco2", placeholder: "4.5–6.0" },
  po2: { key: "po2", labelKey: "bg_label_po2", placeholder: "10–13" },
  hco3: { key: "hco3", labelKey: "bg_label_hco3", placeholder: "22–26" },
  be: { key: "be", labelKey: "bg_label_be", placeholder: "-3 to +3" },
  so2: { key: "so2", labelKey: "bg_label_so2", placeholder: "%" },

  na: { key: "na", labelKey: "bg_label_na", placeholder: "135–145" },
  k: { key: "k", labelKey: "bg_label_k", placeholder: "3.5–4.6" },
  ca: { key: "ca", labelKey: "bg_label_ca", placeholder: "1.15–1.33" },
  cl: { key: "cl", labelKey: "bg_label_cl", placeholder: "98–106" },

  glucose: {
    key: "glucose",
    labelKey: "bg_label_glucose",
    placeholder: "mmol/L",
  },
  lactate: {
    key: "lactate",
    labelKey: "bg_label_lactate",
    placeholder: "mmol/L",
  },
  urea: { key: "urea", labelKey: "bg_label_urea", placeholder: "mmol/L" },
  creatinine: {
    key: "creatinine",
    labelKey: "bg_label_creatinine",
    placeholder: "µmol/L",
  },

  hct: { key: "hct", labelKey: "bg_label_hct", placeholder: "%" },
  hgb: { key: "hgb", labelKey: "bg_label_hgb", placeholder: "mmol/L" },

  crp: { key: "crp", labelKey: "bg_label_crp", placeholder: "mg/L" },
};

type Props = {
  values: BloodGasFormValues;
  onChange: (key: BloodGasFieldKey, value: string) => void;
  fields: BloodGasFieldKey[];
  title?: string;
};

export function BloodGasInputCard({ values, onChange, fields, title }: Props) {
  const { t } = useT();
  const { settings } = useSettings();

  return (
    <Card>
      {title ? <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "800" }}>{title}</Text> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {fields.map((fieldKey) => {
          const field = ALL_FIELDS[fieldKey];

          return (
            <View key={field.key} style={{ gap: 8, minWidth: 140, flexGrow: 1, flexBasis: "46%" }}>
              <Label>{t(field.labelKey as any)}</Label>
              <Input
                value={values[field.key]}
                onChangeText={(text) => onChange(field.key, text)}
                placeholder={field.placeholder}
                keyboardType="decimal-pad"
                autoCapitalize="none"
                autoCorrect={false}
                selectTextOnFocus
                style={values[field.key].trim() && parseNumber(values[field.key]) === undefined ? { borderColor: theme.colors.danger } : undefined}
              />
              {values[field.key].trim() && parseNumber(values[field.key]) === undefined ? (
                <Text style={{ color: theme.colors.danger, fontSize: 12 }}>
                  {settings.language === "da" ? "Indtast et gyldigt tal" : "Enter a valid number"}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </Card>
  );
}
