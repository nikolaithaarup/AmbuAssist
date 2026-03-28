import type {
  Bydel,
  HospitalCode,
  Kommune,
  KommuneByen,
  KommuneMidt,
  KommuneNord,
  KommuneSyd,
} from "./types";

export function norm(s?: string | null) {
  return String(s ?? "")
    .toLowerCase()
    .trim();
}

export function mapPostcodeToBydel(postcode?: string): KommuneByen | "" {
  const pc = String(postcode ?? "").trim();

  // Bornholm
  if (
    [
      "3700",
      "3720",
      "3730",
      "3740",
      "3751",
      "3760",
      "3770",
      "3782",
      "3790",
    ].includes(pc)
  ) {
    return "Bornholm";
  }

  // Bispebjerg / Brønshøj / Nørrebro area
  if (pc === "2400") return "Bispebjerg";
  if (pc === "2700") return "Brønshøj/Husum";
  if (pc === "2200") return "Nørrebro";

  // Frederiksberg
  if (
    [
      "1800",
      "1850",
      "1870",
      "1900",
      "1920",
      "1950",
      "1970",
      "1999",
      "2000",
    ].includes(pc)
  ) {
    return "Frederiksberg";
  }

  // Indre by
  if (
    [
      "1000",
      "1050",
      "1060",
      "1070",
      "1092",
      "1093",
      "1095",
      "1200",
      "1250",
      "1300",
      "1350",
      "1400",
      "1411",
      "1420",
      "1432",
      "1450",
      "1468",
      "1471",
      "1473",
      "1550",
      "1560",
    ].includes(pc)
  ) {
    return "Indre by";
  }

  // Østerbro
  if (["2100", "2150"].includes(pc)) return "Østerbro";

  // Vanløse
  if (pc === "2720") return "Vanløse";

  // Vesterbro
  if (
    [
      "1500",
      "1600",
      "1620",
      "1650",
      "1660",
      "1670",
      "1710",
      "1720",
      "1750",
      "1760",
    ].includes(pc)
  ) {
    return "Vesterbro";
  }

  return "";
}

/**
 * Converts street-list bydeler into the broader Byen kommune groupings.
 * Useful when you only need the broad planning area.
 */
export function mapStreetBydelToKommuneByen(bydel?: string): KommuneByen | "" {
  const b = norm(bydel);

  if (b === "bispebjerg") return "Bispebjerg";
  if (b === "bornholm") return "Bornholm";

  if (b === "brønshøj/husum" || b === "bronshoj/husum") {
    return "Brønshøj/Husum";
  }

  if (b === "frederiksberg") return "Frederiksberg";

  if (b === "indre by" || b === "christianshavn") {
    return "Indre by";
  }

  if (
    b === "indre nørrebro" ||
    b === "indre norrebro" ||
    b === "ydre nørrebro" ||
    b === "ydre norrebro" ||
    b === "nørrebro" ||
    b === "norrebro"
  ) {
    return "Nørrebro";
  }

  if (b === "vanløse" || b === "vanlose") return "Vanløse";
  if (b === "vesterbro") return "Vesterbro";

  if (
    b === "indre østerbro" ||
    b === "indre osterbro" ||
    b === "ydre østerbro" ||
    b === "ydre osterbro" ||
    b === "østerbro" ||
    b === "osterbro" ||
    b === "ryvang øst" ||
    b === "ryvang ost"
  ) {
    return "Østerbro";
  }

  return "";
}

/**
 * Converts street-list bydeler into the official Byen matrix labels used by BYEN_MAP.
 * This is the safer helper for GPS + street matching in Byen mode.
 */
export function mapStreetBydelToOfficialBydel(bydel?: string): Bydel | "" {
  const b = norm(bydel);

  if (b === "bispebjerg") return "Bispebjerg";
  if (b === "brønshøj/husum" || b === "bronshoj/husum") {
    return "Brønshøj/Husum";
  }
  if (b === "christianshavn") return "Christianshavn";
  if (b === "frederiksberg") return "Frederiksberg (post-nr.)";
  if (b === "indre by") return "Indre by";

  if (b === "indre nørrebro" || b === "indre norrebro") {
    return "Nørrebro - indre";
  }
  if (b === "ydre nørrebro" || b === "ydre norrebro") {
    return "Nørrebro - ydre";
  }
  if (b === "nørrebro" || b === "norrebro") {
    return "Nørrebro - indre";
  }

  if (b === "ryvang øst" || b === "ryvang ost") {
    return "Ryvang øst";
  }
  if (b === "indre østerbro" || b === "indre osterbro") {
    return "Østerbro - indre";
  }
  if (b === "ydre østerbro" || b === "ydre osterbro") {
    return "Østerbro - ydre";
  }
  if (b === "østerbro" || b === "osterbro") {
    return "Østerbro - indre";
  }

  if (b === "vanløse" || b === "vanlose") return "Vanløse";
  if (b === "vesterbro") return "Vesterbro";

  return "";
}

/**
 * Converts broad postcode-based Byen kommune grouping into an official matrix bydel.
 * This is only a fallback when we do NOT have a street match.
 *
 * Note: some areas are more granular in the official matrix than in postcode form,
 * so this picks the safest/default matrix label available.
 */
export function mapKommuneByenToOfficialBydel(
  kommuneByen?: KommuneByen | "",
): Bydel | "" {
  switch (kommuneByen) {
    case "Bispebjerg":
      return "Bispebjerg";
    case "Brønshøj/Husum":
      return "Brønshøj/Husum";
    case "Frederiksberg":
      return "Frederiksberg (post-nr.)";
    case "Indre by":
      return "Indre by";
    case "Nørrebro":
      return "Nørrebro - indre";
    case "Vanløse":
      return "Vanløse";
    case "Vesterbro":
      return "Vesterbro";
    case "Østerbro":
      return "Østerbro - indre";
    default:
      return "";
  }
}

export function mapRegionCityToKommune(
  city?: string,
  subregion?: string,
): Kommune | "" {
  const c = norm(city);
  const s = norm(subregion);
  const text = `${c} ${s}`;

  // -------- NORD --------
  if (text.includes("allerød") || text.includes("alleroed")) return "Allerød";
  if (text.includes("fredensborg")) return "Fredensborg";
  if (text.includes("frederikssund")) return "Frederikssund";
  if (text.includes("gribskov")) return "Gribskov";
  if (text.includes("halsnæs") || text.includes("halsnaes")) return "Halsnæs";
  if (text.includes("helsingør") || text.includes("helsingor")) {
    return "Helsingør";
  }
  if (text.includes("hillerød") || text.includes("hillerod")) {
    return "Hillerød";
  }
  if (
    text.includes("hørsholm") ||
    text.includes("horsholm") ||
    text.includes("hoersholm")
  ) {
    return "Hørsholm";
  }

  // -------- MIDT --------
  if (text.includes("ballerup")) return "Ballerup";

  if (text.includes("smørum") || text.includes("smorum")) {
    return "Egedal (Smørum)";
  }

  if (
    text.includes("ølstykke") ||
    text.includes("olstykke") ||
    text.includes("stenløse") ||
    text.includes("stenlose")
  ) {
    return "Egedal (Ølstykke, Stenløse)";
  }

  if (text.includes("farum")) return "Furesø (Farum)";

  if (
    text.includes("værløse") ||
    text.includes("vaerloese") ||
    text.includes("varlose")
  ) {
    return "Furesø (Værløse)";
  }

  if (text.includes("gentofte")) return "Gentofte";
  if (text.includes("gladsaxe")) return "Gladsaxe";
  if (text.includes("herlev")) return "Herlev";

  if (
    text.includes("lyngby") ||
    text.includes("taarbæk") ||
    text.includes("taarbaek") ||
    text.includes("tårbæk") ||
    text.includes("torbaek")
  ) {
    return "Lyngby-Taarbæk";
  }

  if (text.includes("birkerød") || text.includes("birkeroed")) {
    return "Rudersdal (Birkerød)";
  }

  if (
    text.includes("søllerød") ||
    text.includes("sollerod") ||
    text.includes("soelleroed")
  ) {
    return "Rudersdal (Søllerød)";
  }

  if (text.includes("rødovre") || text.includes("rodovre")) {
    return "Rødovre";
  }

  // -------- SYD --------
  if (text.includes("albertslund")) return "Albertslund";
  if (text.includes("amager vest")) return "Amager Vest";
  if (text.includes("amager øst") || text.includes("amager ost")) {
    return "Amager Øst";
  }
  if (text.includes("brøndby") || text.includes("brondby")) return "Brøndby";
  if (text.includes("dragør") || text.includes("dragor")) return "Dragør";
  if (text.includes("glostrup")) return "Glostrup";
  if (text.includes("hvidovre")) return "Hvidovre";

  if (
    text.includes("høje-taastrup") ||
    text.includes("hoje-taastrup") ||
    text.includes("høje taastrup") ||
    text.includes("hoje taastrup")
  ) {
    return "Høje-Taastrup";
  }

  if (text.includes("ishøj") || text.includes("ishoj")) return "Ishøj";
  if (text.includes("tårnby") || text.includes("tarnby")) return "Tårnby";
  if (text.includes("valby")) return "Valby";
  if (text.includes("vallensbæk") || text.includes("vallensbaek")) {
    return "Vallensbæk";
  }
  if (text.includes("vesterbro")) return "Vesterbro";

  return "";
}

export function isKommuneNord(v: string): v is KommuneNord {
  return [
    "Allerød",
    "Fredensborg",
    "Frederikssund",
    "Gribskov",
    "Halsnæs",
    "Helsingør",
    "Hillerød",
    "Hørsholm",
  ].includes(v);
}

export function isKommuneMidt(v: string): v is KommuneMidt {
  return [
    "Ballerup",
    "Egedal (Smørum)",
    "Egedal (Ølstykke, Stenløse)",
    "Furesø (Farum)",
    "Furesø (Værløse)",
    "Gentofte",
    "Gladsaxe",
    "Herlev",
    "Lyngby-Taarbæk",
    "Rudersdal (Birkerød)",
    "Rudersdal (Søllerød)",
    "Rødovre",
  ].includes(v);
}

export function isKommuneSyd(v: string): v is KommuneSyd {
  return [
    "Albertslund",
    "Amager Vest",
    "Amager Øst",
    "Brøndby",
    "Dragør",
    "Glostrup",
    "Hvidovre",
    "Høje-Taastrup",
    "Ishøj",
    "Tårnby",
    "Valby",
    "Vallensbæk",
    "Vesterbro",
  ].includes(v);
}

export function hospitalLabel(t: (k: string) => string, code: HospitalCode) {
  if (code === "UNKNOWN") return "Ukendt";
  if (code === "GLO_RH" || code === "RH_GLO") return "GLO/RH";
  if (code === "HEH_GEH") return "HEH/GEH";
  if (code === "AMH_HVH") return "AMH/HVH";
  if (code === "HGH_RH") return "HGH/RH";
  if (code === "GLO_NOH") return "GLO/NOH";
  if (code === "BBH_FRH") return "BBH/FRH";
  if (code === "RH_BBH" || code === "BBH_RH") return "BBH/RH";
  if (code === "BOH_RH") return "BOH/RH";

  const key = `dest_h_${code}`;
  const v = t(key);
  return v === key ? code : v;
}
