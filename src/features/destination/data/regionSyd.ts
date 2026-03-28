import type { HospitalCode, KommuneSyd, RegionCategory } from "../types";

export const REGION_SYD_CATEGORIES: {
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

export const REGION_SYD_DEFAULT: Record<RegionCategory, HospitalCode> = {
  traumecenter: "RH",
  akutmodtagelse: "HVH",
  medicinsk_modtagelse: "HVH",
  akutklinik: "HVH",

  kirurgi_mave_tarm: "HVH",
  boernekirurgi: "HVH",
  ortopaedkirurgi: "HVH",
  ortopaedkirurgi_boern_u16: "HVH",
  karkirurgi: "RH",
  thoraxkirurgi: "RH",
  neurokirurgi: "GLO_RH",
  urologi: "HEH",
  plastkirurgi: "RH",
  mammakirurgi: "GEH",

  kardiologi: "HVH",
  lungemedicin: "HVH",
  gastroenterologi: "HVH",
  endokrinologi: "HVH",
  geriatrisk: "HVH",
  reumatologi: "HVH",
  infektionsmedicin: "HVH",
  nefrologi: "HEH",
  haematologi: "RH",
  neurologi_ekskl_apopleksi: "GLO",
  apopleksi_ekskl_trombolyse: "GLO",

  gynaekologi: "AMH_HVH",
  obstetrik: "HVH",
  paediatri: "AMH_HVH",

  billeddiagnostik: "GLO",

  klinisk_onkologi: "HEH",
  palliativ_enhed: "HEH",
  oftalmologi: "GLO_NOH",
  oere_naese_hals: "RH",
  audiologi: "BBH",
  odontologi: "RH",
  dermato_venerologi: "GEH",
  allergologi: "GEH",
  arbejds_miljoemedicin: "BBH",
  socialmedicin: "FRH",
};

export const REGION_SYD_MAP: Record<
  KommuneSyd,
  Record<RegionCategory, HospitalCode>
> = {
  Albertslund: {
    ...REGION_SYD_DEFAULT,
  },

  "Amager Vest": {
    ...REGION_SYD_DEFAULT,
    medicinsk_modtagelse: "AMH",
    akutklinik: "AMH",
    urologi: "RH",
    kardiologi: "AMH",
    lungemedicin: "AMH",
    endokrinologi: "AMH",
    geriatrisk: "AMH",
    nefrologi: "RH",
    billeddiagnostik: "AMH",
    klinisk_onkologi: "RH",
    palliativ_enhed: "RH",
    dermato_venerologi: "BBH",
  },

  "Amager Øst": {
    ...REGION_SYD_DEFAULT,
    medicinsk_modtagelse: "AMH",
    akutklinik: "AMH",
    urologi: "RH",
    kardiologi: "AMH",
    lungemedicin: "AMH",
    endokrinologi: "AMH",
    geriatrisk: "AMH",
    nefrologi: "RH",
    billeddiagnostik: "AMH",
    klinisk_onkologi: "RH",
    palliativ_enhed: "RH",
    dermato_venerologi: "BBH",
  },

  Brøndby: {
    ...REGION_SYD_DEFAULT,
    billeddiagnostik: "GLO",
  },

  Dragør: {
    ...REGION_SYD_DEFAULT,
    medicinsk_modtagelse: "AMH",
    akutklinik: "AMH",
    urologi: "RH",
    kardiologi: "AMH",
    lungemedicin: "AMH",
    endokrinologi: "AMH",
    geriatrisk: "AMH",
    billeddiagnostik: "AMH",
    klinisk_onkologi: "RH",
    palliativ_enhed: "RH",
  },

  Glostrup: {
    ...REGION_SYD_DEFAULT,
  },

  Hvidovre: {
    ...REGION_SYD_DEFAULT,
    billeddiagnostik: "HVH",
  },

  "Høje-Taastrup": {
    ...REGION_SYD_DEFAULT,
  },

  Ishøj: {
    ...REGION_SYD_DEFAULT,
  },

  Tårnby: {
    ...REGION_SYD_DEFAULT,
    medicinsk_modtagelse: "AMH",
    akutklinik: "AMH",
    urologi: "HGH_RH",
    kardiologi: "AMH",
    lungemedicin: "AMH",
    endokrinologi: "AMH",
    geriatrisk: "AMH",
    billeddiagnostik: "AMH",
    klinisk_onkologi: "RH",
    palliativ_enhed: "RH",
  },

  Valby: {
    ...REGION_SYD_DEFAULT,
    urologi: "HGH_RH",
    nefrologi: "RH",
    billeddiagnostik: "HVH",
    klinisk_onkologi: "RH",
    palliativ_enhed: "RH",
    dermato_venerologi: "BBH",
  },

  Vallensbæk: {
    ...REGION_SYD_DEFAULT,
    billeddiagnostik: "GLO",
  },

  Vesterbro: {
    ...REGION_SYD_DEFAULT,
    urologi: "HGH_RH",
    nefrologi: "RH",
    billeddiagnostik: "HVH",
    klinisk_onkologi: "RH",
    palliativ_enhed: "RH",
    dermato_venerologi: "BBH",
  },
};
