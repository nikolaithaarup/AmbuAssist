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
  | "FRH"
  | "NOH"
  | "GEH"
  | "GLO"
  | "HEH"
  | "HVH"
  | "RH"
  | "GLO_RH"
  | "UNKNOWN";

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

export type KommuneNord =
  | "Allerød"
  | "Fredensborg"
  | "Frederikssund"
  | "Gribskov"
  | "Halsnæs"
  | "Helsingør"
  | "Hillerød"
  | "Hørsholm";

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
};
