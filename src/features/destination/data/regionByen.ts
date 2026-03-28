import type { KommuneByen, HospitalCode, RegionCategory } from "../types";

export const REGION_BYEN_CATEGORIES: {
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

export const REGION_BYEN_DEFAULT: Record<RegionCategory, HospitalCode> = {
  traumecenter: "RH",
  akutmodtagelse: "BBH",
  medicinsk_modtagelse: "BBH",
  akutklinik: "BBH",

  kirurgi_mave_tarm: "BBH",
  boernekirurgi: "HEH",
  ortopaedkirurgi: "BBH",
  ortopaedkirurgi_boern_u16: "HVH",
  karkirurgi: "RH",
  thoraxkirurgi: "RH",
  neurokirurgi: "RH_GLO",
  urologi: "HGH_RH",
  plastkirurgi: "RH",
  mammakirurgi: "GEH",

  kardiologi: "BBH",
  lungemedicin: "BBH",
  gastroenterologi: "BBH",
  endokrinologi: "BBH",
  geriatrisk: "BBH_FRH",
  reumatologi: "FRH",
  infektionsmedicin: "RH",
  nefrologi: "RH",
  haematologi: "RH",
  neurologi_ekskl_apopleksi: "BBH",
  apopleksi_ekskl_trombolyse: "BBH",

  gynaekologi: "HEH",
  obstetrik: "HEH",
  paediatri: "HEH",

  billeddiagnostik: "BBH",

  klinisk_onkologi: "RH",
  palliativ_enhed: "BBH",
  oftalmologi: "GLO",
  oere_naese_hals: "RH",
  audiologi: "BBH",
  odontologi: "RH",
  dermato_venerologi: "BBH",
  allergologi: "GEH",
  arbejds_miljoemedicin: "BBH",
  socialmedicin: "FRH",
};

export const REGION_BYEN_MAP: Record<
  KommuneByen,
  Record<RegionCategory, HospitalCode>
> = {
  Bispebjerg: {
    ...REGION_BYEN_DEFAULT,
  },

  Bornholm: {
    ...REGION_BYEN_DEFAULT,
    akutmodtagelse: "BOH",
    medicinsk_modtagelse: "BOH",
    akutklinik: "BOH",

    kirurgi_mave_tarm: "BOH",
    boernekirurgi: "BOH",
    ortopaedkirurgi: "BOH",
    ortopaedkirurgi_boern_u16: "BOH",
    karkirurgi: "BOH",
    thoraxkirurgi: "RH",
    neurokirurgi: "RH_GLO",
    urologi: "HGH_RH",
    plastkirurgi: "RH",
    mammakirurgi: "GEH",

    kardiologi: "BOH",
    lungemedicin: "BOH",
    gastroenterologi: "BOH",
    endokrinologi: "BOH",
    geriatrisk: "BOH",
    reumatologi: "BOH",
    infektionsmedicin: "BOH",
    nefrologi: "BOH",
    haematologi: "BOH",
    neurologi_ekskl_apopleksi: "BOH",
    apopleksi_ekskl_trombolyse: "BOH",

    gynaekologi: "BOH",
    obstetrik: "BOH",
    paediatri: "BOH",

    billeddiagnostik: "BOH",

    klinisk_onkologi: "BOH",
    palliativ_enhed: "BOH",
    oftalmologi: "GLO",
    oere_naese_hals: "BOH_RH",
    audiologi: "BOH",
    odontologi: "RH",
    dermato_venerologi: "BOH",
    allergologi: "GEH",
    arbejds_miljoemedicin: "BBH",
    socialmedicin: "FRH",
  },

  "Brønshøj/Husum": {
    ...REGION_BYEN_DEFAULT,
  },

  Frederiksberg: {
    ...REGION_BYEN_DEFAULT,
    akutklinik: "FRH",

    kardiologi: "FRH",
    lungemedicin: "FRH",
    gastroenterologi: "FRH",
    endokrinologi: "FRH",
    geriatrisk: "BBH_FRH",
    reumatologi: "FRH",

    billeddiagnostik: "FRH",
  },

  "Indre by": {
    ...REGION_BYEN_DEFAULT,
    akutmodtagelse: "RH",
    akutklinik: "RH",

    boernekirurgi: "RH",
    ortopaedkirurgi: "RH_BBH",
    ortopaedkirurgi_boern_u16: "RH",

    endokrinologi: "RH",
    geriatrisk: "BBH_FRH",
    neurologi_ekskl_apopleksi: "BBH_RH",

    gynaekologi: "RH",
    obstetrik: "RH",
    paediatri: "RH",

    billeddiagnostik: "FRH",
  },

  Nørrebro: {
    ...REGION_BYEN_DEFAULT,
    akutmodtagelse: "BBH",
    medicinsk_modtagelse: "BBH",
    akutklinik: "BBH",

    boernekirurgi: "RH",

    geriatrisk: "BBH_FRH",

    gynaekologi: "RH",
    obstetrik: "RH",
    paediatri: "RH",

    billeddiagnostik: "FRH",
  },

  Vanløse: {
    ...REGION_BYEN_DEFAULT,
    akutklinik: "FRH",

    kardiologi: "FRH",
    lungemedicin: "FRH",
    gastroenterologi: "FRH",
    endokrinologi: "FRH",
    geriatrisk: "BBH_FRH",
    reumatologi: "FRH",

    billeddiagnostik: "HVH",
  },

  Vesterbro: {
    ...REGION_BYEN_DEFAULT,
    akutklinik: "RH",

    boernekirurgi: "RH",
    ortopaedkirurgi: "BBH_RH",
    ortopaedkirurgi_boern_u16: "RH",

    endokrinologi: "RH",
    geriatrisk: "BBH_FRH",
    neurologi_ekskl_apopleksi: "BBH_RH",

    gynaekologi: "RH",
    obstetrik: "RH",
    paediatri: "RH",

    billeddiagnostik: "FRH",
  },
};