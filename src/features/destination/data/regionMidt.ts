import type { HospitalCode, KommuneMidt, RegionCategory } from "../types";

export const REGION_MIDT_CATEGORIES: {
  key: RegionCategory;
  labelKey: string;
}[] = [
  { key: "traumecenter", labelKey: "dest_reg_traumecenter" },
  { key: "akutmodtagelse", labelKey: "dest_reg_akutmodtagelse" },
  { key: "medicinsk_modtagelse", labelKey: "dest_reg_med_modtagelse" },
  { key: "akutklinik", labelKey: "dest_reg_akutklinik" },

  { key: "kirurgi_mave_tarm", labelKey: "dest_reg_kir_mave_tarm" },
  { key: "boernekirurgi", labelKey: "dest_reg_boernekir" },
  { key: "ortopaedkirurgi", labelKey: "dest_reg_ortkir" },
  { key: "ortopaedkirurgi_boern_u16", labelKey: "dest_reg_ortkir_boern" },
  { key: "karkirurgi", labelKey: "dest_reg_karkir" },
  { key: "thoraxkirurgi", labelKey: "dest_reg_thoraxkir" },
  { key: "neurokirurgi", labelKey: "dest_reg_neurokir" },
  { key: "urologi", labelKey: "dest_reg_urologi" },
  { key: "plastkirurgi", labelKey: "dest_reg_plastkir" },
  { key: "mammakirurgi", labelKey: "dest_reg_mammakir" },

  { key: "kardiologi", labelKey: "dest_reg_kardiologi" },
  { key: "lungemedicin", labelKey: "dest_reg_lungemed" },
  { key: "gastroenterologi", labelKey: "dest_reg_gastro" },
  { key: "endokrinologi", labelKey: "dest_reg_endo" },
  { key: "geriatrisk", labelKey: "dest_reg_geri" },
  { key: "reumatologi", labelKey: "dest_reg_reuma" },
  { key: "infektionsmedicin", labelKey: "dest_reg_infekt" },
  { key: "nefrologi", labelKey: "dest_reg_nefro" },
  { key: "haematologi", labelKey: "dest_reg_haemato" },
  { key: "neurologi_ekskl_apopleksi", labelKey: "dest_reg_neuro" },
  { key: "apopleksi_ekskl_trombolyse", labelKey: "dest_reg_apopleksi" },

  { key: "gynaekologi", labelKey: "dest_reg_gyn" },
  { key: "obstetrik", labelKey: "dest_reg_obst" },
  { key: "paediatri", labelKey: "dest_reg_paediatri" },

  { key: "billeddiagnostik", labelKey: "dest_reg_billeddiag" },

  { key: "klinisk_onkologi", labelKey: "dest_reg_onk" },
  { key: "palliativ_enhed", labelKey: "dest_reg_pall" },
  { key: "oftalmologi", labelKey: "dest_reg_oftal" },
  { key: "oere_naese_hals", labelKey: "dest_reg_oenh" },
  { key: "audiologi", labelKey: "dest_reg_audio" },
  { key: "odontologi", labelKey: "dest_reg_odont" },
  { key: "dermato_venerologi", labelKey: "dest_reg_derm" },
  { key: "allergologi", labelKey: "dest_reg_allergi" },
  { key: "arbejds_miljoemedicin", labelKey: "dest_reg_arbejds" },
  { key: "socialmedicin", labelKey: "dest_reg_social" },
];

export const REGION_MIDT_DEFAULT: Record<RegionCategory, HospitalCode> = {
  traumecenter: "RH",
  akutmodtagelse: "HEH",
  medicinsk_modtagelse: "HEH",
  akutklinik: "HEH",

  kirurgi_mave_tarm: "HEH",
  boernekirurgi: "HEH",
  ortopaedkirurgi: "HEH",
  ortopaedkirurgi_boern_u16: "HEH_GEH",
  karkirurgi: "RH",
  thoraxkirurgi: "RH",
  neurokirurgi: "GLO_RH",
  urologi: "HEH",
  plastkirurgi: "HEH",
  mammakirurgi: "GEH",

  kardiologi: "HEH",
  lungemedicin: "HEH",
  gastroenterologi: "HEH",
  endokrinologi: "HEH",
  geriatrisk: "HEH",
  reumatologi: "HEH",
  infektionsmedicin: "HEH",
  nefrologi: "HEH",
  haematologi: "RH",
  neurologi_ekskl_apopleksi: "HEH",
  apopleksi_ekskl_trombolyse: "HEH",

  gynaekologi: "HEH_GEH",
  obstetrik: "HEH",
  paediatri: "HEH_GEH",

  billeddiagnostik: "HEH",

  klinisk_onkologi: "HEH",
  palliativ_enhed: "HEH",
  oftalmologi: "GLO",
  oere_naese_hals: "NOH",
  audiologi: "NOH",
  odontologi: "RH",
  dermato_venerologi: "GEH",
  allergologi: "GEH",
  arbejds_miljoemedicin: "BBH",
  socialmedicin: "FRH",
};

export const REGION_MIDT_MAP: Record<
  KommuneMidt,
  Record<RegionCategory, HospitalCode>
> = {
  Ballerup: {
    ...REGION_MIDT_DEFAULT,
  },

  "Egedal (Smørum)": {
    ...REGION_MIDT_DEFAULT,
  },

  "Egedal (Ølstykke, Stenløse)": {
    ...REGION_MIDT_DEFAULT,
    gynaekologi: "NOH",
    obstetrik: "NOH",
    paediatri: "NOH",
    billeddiagnostik: "NOH",
    palliativ_enhed: "NOH_F",
    dermato_venerologi: "BBH",
  },

  "Furesø (Farum)": {
    ...REGION_MIDT_DEFAULT,
    gynaekologi: "NOH",
    obstetrik: "NOH",
    paediatri: "NOH",
    billeddiagnostik: "NOH",
    palliativ_enhed: "NOH_F",
    dermato_venerologi: "BBH",
  },

  "Furesø (Værløse)": {
    ...REGION_MIDT_DEFAULT,
    akutklinik: "GEH",
    gynaekologi: "NOH",
    obstetrik: "NOH",
    paediatri: "NOH",
  },

  Gentofte: {
    ...REGION_MIDT_DEFAULT,
    akutklinik: "GEH",
    billeddiagnostik: "GEH",
  },

  Gladsaxe: {
    ...REGION_MIDT_DEFAULT,
  },

  Herlev: {
    ...REGION_MIDT_DEFAULT,
  },

  "Lyngby-Taarbæk": {
    ...REGION_MIDT_DEFAULT,
    akutklinik: "GEH",
    gynaekologi: "NOH",
    obstetrik: "NOH",
    paediatri: "NOH",
    billeddiagnostik: "GEH",
  },

  "Rudersdal (Birkerød)": {
    ...REGION_MIDT_DEFAULT,
    gynaekologi: "NOH",
    obstetrik: "NOH",
    paediatri: "NOH",
    dermato_venerologi: "BBH",
  },

  "Rudersdal (Søllerød)": {
    ...REGION_MIDT_DEFAULT,
    akutklinik: "GEH",
    gynaekologi: "NOH",
    obstetrik: "NOH",
    paediatri: "NOH",
    billeddiagnostik: "GEH",
  },

  Rødovre: {
    ...REGION_MIDT_DEFAULT,
  },
};