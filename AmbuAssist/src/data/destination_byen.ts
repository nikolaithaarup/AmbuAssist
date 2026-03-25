// src/data/destination_byen.ts
export type HospitalCode =
  | "AMH"
  | "BBH"
  | "FRH"
  | "NOH"
  | "GEH"
  | "GLO"
  | "HEH"
  | "HVH"
  | "RH"
  | "UNKNOWN";

export type Bydel =
  | "Amager"
  | "Bispebjerg"
  | "Brønshøj/Husum"
  | "Christianshavn"
  | "Frederiksberg (post-nr.)"
  | "Indre by"
  | "Kgs. Enghave (2450)"
  | "Nørrebro - indre"
  | "Nørrebro - ydre"
  | "Ryvang øst"
  | "Valby (2500)"
  | "Vanløse"
  | "Vesterbro"
  | "Østerbro - indre"
  | "Østerbro - ydre";

export type ByenCategory =
  | "hospital"
  | "medicin"
  | "reumatologi"
  | "gaskir"
  | "neuro_apopleksi"
  | "neuro_almen"
  | "kardiologi"
  | "ortkir"
  | "paediatri"
  | "gyn"
  | "uro";

export const BYEN_CATEGORIES: { key: ByenCategory; labelKey: string }[] = [
  { key: "hospital", labelKey: "dest_cat_hospital" },
  { key: "medicin", labelKey: "dest_cat_medicin" },
  { key: "reumatologi", labelKey: "dest_cat_reuma" },
  { key: "gaskir", labelKey: "dest_cat_gaskir" },
  { key: "neuro_apopleksi", labelKey: "dest_cat_neuro_apopleksi" },
  { key: "neuro_almen", labelKey: "dest_cat_neuro_almen" },
  { key: "kardiologi", labelKey: "dest_cat_kardiologi" },
  { key: "ortkir", labelKey: "dest_cat_ortkir" },
  { key: "paediatri", labelKey: "dest_cat_paediatri" },
  { key: "gyn", labelKey: "dest_cat_gyn" },
  { key: "uro", labelKey: "dest_cat_uro" },
];

// Mapping transcribed from your Byen table screenshot
export const BYEN_MAP: Record<Bydel, Record<ByenCategory, HospitalCode>> = {
  Amager: {
    hospital: "AMH",
    medicin: "HVH",
    reumatologi: "GLO",
    gaskir: "HVH",
    neuro_apopleksi: "GLO",
    neuro_almen: "GLO",
    kardiologi: "AMH",
    ortkir: "HVH",
    paediatri: "HVH",
    gyn: "HVH",
    uro: "UNKNOWN",
  },
  Bispebjerg: {
    hospital: "BBH",
    medicin: "BBH",
    reumatologi: "FRH",
    gaskir: "BBH",
    neuro_apopleksi: "BBH",
    neuro_almen: "BBH",
    kardiologi: "BBH",
    ortkir: "BBH",
    paediatri: "HEH",
    gyn: "HEH",
    uro: "UNKNOWN",
  },
  "Brønshøj/Husum": {
    hospital: "BBH",
    medicin: "BBH",
    reumatologi: "FRH",
    gaskir: "BBH",
    neuro_apopleksi: "BBH",
    neuro_almen: "BBH",
    kardiologi: "BBH",
    ortkir: "BBH",
    paediatri: "HEH",
    gyn: "HEH",
    uro: "UNKNOWN",
  },
  Christianshavn: {
    hospital: "BBH",
    medicin: "BBH",
    reumatologi: "FRH",
    gaskir: "BBH",
    neuro_apopleksi: "BBH",
    neuro_almen: "RH",
    kardiologi: "BBH",
    ortkir: "BBH",
    paediatri: "HVH",
    gyn: "HVH",
    uro: "UNKNOWN",
  },
  "Frederiksberg (post-nr.)": {
    hospital: "BBH",
    medicin: "BBH",
    reumatologi: "FRH",
    gaskir: "BBH",
    neuro_apopleksi: "BBH",
    neuro_almen: "BBH",
    kardiologi: "BBH",
    ortkir: "BBH",
    paediatri: "HEH",
    gyn: "HEH",
    uro: "UNKNOWN",
  },
  "Indre by": {
    hospital: "RH",
    medicin: "BBH",
    reumatologi: "FRH",
    gaskir: "BBH",
    neuro_apopleksi: "BBH",
    neuro_almen: "RH",
    kardiologi: "BBH",
    ortkir: "RH",
    paediatri: "RH",
    gyn: "RH",
    uro: "UNKNOWN",
  },
  "Kgs. Enghave (2450)": {
    hospital: "HVH",
    medicin: "HVH",
    reumatologi: "GLO",
    gaskir: "HVH",
    neuro_apopleksi: "GLO",
    neuro_almen: "GLO",
    kardiologi: "HVH",
    ortkir: "HVH",
    paediatri: "HVH",
    gyn: "HVH",
    uro: "UNKNOWN",
  },
  "Nørrebro - indre": {
    hospital: "BBH",
    medicin: "BBH",
    reumatologi: "FRH",
    gaskir: "BBH",
    neuro_apopleksi: "BBH",
    neuro_almen: "BBH",
    kardiologi: "BBH",
    ortkir: "BBH",
    paediatri: "RH",
    gyn: "RH",
    uro: "UNKNOWN",
  },
  "Nørrebro - ydre": {
    hospital: "BBH",
    medicin: "BBH",
    reumatologi: "FRH",
    gaskir: "BBH",
    neuro_apopleksi: "BBH",
    neuro_almen: "BBH",
    kardiologi: "BBH",
    ortkir: "BBH",
    paediatri: "RH",
    gyn: "RH",
    uro: "UNKNOWN",
  },
  "Ryvang øst": {
    hospital: "BBH",
    medicin: "BBH",
    reumatologi: "FRH",
    gaskir: "BBH",
    neuro_apopleksi: "BBH",
    neuro_almen: "BBH",
    kardiologi: "BBH",
    ortkir: "BBH",
    paediatri: "RH",
    gyn: "RH",
    uro: "UNKNOWN",
  },
  "Valby (2500)": {
    hospital: "HVH",
    medicin: "HVH",
    reumatologi: "GLO",
    gaskir: "HVH",
    neuro_apopleksi: "GLO",
    neuro_almen: "GLO",
    kardiologi: "HVH",
    ortkir: "HVH",
    paediatri: "HVH",
    gyn: "HVH",
    uro: "UNKNOWN",
  },
  Vanløse: {
    hospital: "BBH",
    medicin: "BBH",
    reumatologi: "FRH",
    gaskir: "BBH",
    neuro_apopleksi: "BBH",
    neuro_almen: "BBH",
    kardiologi: "BBH",
    ortkir: "BBH",
    paediatri: "HEH",
    gyn: "HEH",
    uro: "UNKNOWN",
  },
  Vesterbro: {
    hospital: "HVH",
    medicin: "HVH",
    reumatologi: "GLO",
    gaskir: "HVH",
    neuro_apopleksi: "GLO",
    neuro_almen: "GLO",
    kardiologi: "HVH",
    ortkir: "HVH",
    paediatri: "HVH",
    gyn: "HVH",
    uro: "UNKNOWN",
  },
  "Østerbro - indre": {
    hospital: "RH",
    medicin: "BBH",
    reumatologi: "FRH",
    gaskir: "BBH",
    neuro_apopleksi: "BBH",
    neuro_almen: "RH",
    kardiologi: "BBH",
    ortkir: "RH",
    paediatri: "RH",
    gyn: "RH",
    uro: "UNKNOWN",
  },
  "Østerbro - ydre": {
    hospital: "BBH",
    medicin: "BBH",
    reumatologi: "FRH",
    gaskir: "BBH",
    neuro_apopleksi: "BBH",
    neuro_almen: "BBH",
    kardiologi: "BBH",
    ortkir: "BBH",
    paediatri: "RH",
    gyn: "RH",
    uro: "UNKNOWN",
  },
};
