export type Area = "byen" | "region";

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

export type RegionCategory =
  | "traumecenter"
  | "akutmodtagelse"
  | "medicinsk_modtagelse"
  | "akutklinik"
  | "kirurgi_mave_tarm"
  | "boernekirurgi"
  | "ortopaedkirurgi"
  | "ortopaedkirurgi_boern_u16"
  | "karkirurgi"
  | "thoraxkirurgi"
  | "neurokirurgi"
  | "urologi"
  | "plastkirurgi"
  | "mammakirurgi"
  | "kardiologi"
  | "lungemedicin"
  | "gastroenterologi"
  | "endokrinologi"
  | "geriatrisk"
  | "reumatologi"
  | "infektionsmedicin"
  | "nefrologi"
  | "haematologi"
  | "neurologi_ekskl_apopleksi"
  | "apopleksi_ekskl_trombolyse"
  | "gynaekologi"
  | "obstetrik"
  | "paediatri"
  | "billeddiagnostik"
  | "klinisk_onkologi"
  | "palliativ_enhed"
  | "oftalmologi"
  | "oere_naese_hals"
  | "audiologi"
  | "odontologi"
  | "dermato_venerologi"
  | "allergologi"
  | "arbejds_miljoemedicin"
  | "socialmedicin";

export type HospitalCode =
  | "AMH"
  | "BBH"
  | "BOH"
  | "FRH"
  | "GEH"
  | "GLO"
  | "HEH"
  | "HVH"
  | "NOH"
  | "NOH_F"
  | "RH"
  | "UNKNOWN"
  | "GLO_RH"
  | "RH_GLO"
  | "HEH_GEH"
  | "AMH_HVH"
  | "HGH_RH"
  | "GLO_NOH"
  | "BBH_FRH"
  | "RH_BBH"
  | "BBH_RH"
  | "BOH_RH";

/**
 * Official Byen matrix labels used in hospital routing tables.
 */
export type Bydel =
  | "Amager (2300, 2770 og 2791)"
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

/**
 * Street lookup labels from the gadefortegnelse.
 * These are not identical to the official Bydel labels above.
 */
export type StreetBydel =
  | "Amager"
  | "Bispebjerg"
  | "Brønshøj/Husum"
  | "Christianshavn"
  | "Frederiksberg"
  | "Indre By"
  | "Indre Nørrebro"
  | "Ydre Nørrebro"
  | "Ryvang Øst"
  | "Valby"
  | "Vanløse"
  | "Vesterbro"
  | "Indre Østerbro"
  | "Ydre Østerbro"
  | "Østerbro"
  | "Vestamager"
  | "Bornholm"
  | "Nørrebro";

export type KommuneByen =
  | "Bispebjerg"
  | "Bornholm"
  | "Brønshøj/Husum"
  | "Frederiksberg"
  | "Indre by"
  | "Nørrebro"
  | "Vanløse"
  | "Vesterbro"
  | "Østerbro";

export type KommuneNord =
  | "Allerød"
  | "Fredensborg"
  | "Frederikssund"
  | "Gribskov"
  | "Halsnæs"
  | "Helsingør"
  | "Hillerød"
  | "Hørsholm";

export type KommuneMidt =
  | "Ballerup"
  | "Egedal (Smørum)"
  | "Egedal (Ølstykke, Stenløse)"
  | "Furesø (Farum)"
  | "Furesø (Værløse)"
  | "Gentofte"
  | "Gladsaxe"
  | "Herlev"
  | "Lyngby-Taarbæk"
  | "Rudersdal (Birkerød)"
  | "Rudersdal (Søllerød)"
  | "Rødovre";

export type KommuneSyd =
  | "Albertslund"
  | "Amager Vest"
  | "Amager Øst"
  | "Brøndby"
  | "Dragør"
  | "Glostrup"
  | "Hvidovre"
  | "Høje-Taastrup"
  | "Ishøj"
  | "Tårnby"
  | "Valby"
  | "Vallensbæk"
  | "Vesterbro";

export type Kommune = KommuneNord | KommuneMidt | KommuneSyd | KommuneByen;

export type DetectedArea = {
  label: string;
  postcode?: string;
  city?: string;
  district?: string;
  subregion?: string;
};

export type StreetRow = {
  street: string;
  bydel: Bydel;
  from?: number;
  to?: number;
  side?: "odd" | "even";
};

export type RawStreetRow = {
  street: string;
  bydel: string;
  from?: number;
  to?: number;
  side?: "odd" | "even";
};
