import type { Bydel, HospitalCode, KommuneNord } from "./types";

export function norm(s: string) {
  return String(s ?? "")
    .toLowerCase()
    .trim();
}

export function mapPostcodeToBydel(postcode?: string): Bydel | "" {
  const pc = String(postcode ?? "").trim();

  if (pc === "2300" || pc === "2770" || pc === "2791") {
    return "Amager (2300, 2770 og 2791)";
  }
  if (pc === "2450") return "Kgs. Enghave (2450)";
  if (pc === "2500") return "Valby (2500)";
  if (["2400"].includes(pc)) return "Bispebjerg";
  if (["2700"].includes(pc)) return "Brønshøj/Husum";
  if (["2720"].includes(pc)) return "Vanløse";
  if (["1900", "2000"].includes(pc)) return "Frederiksberg (post-nr.)";

  if (
    [
      "1050",
      "1060",
      "1100",
      "1123",
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

  return "";
}

export function mapRegionCityToKommune(
  city?: string,
  subregion?: string,
): KommuneNord | "" {
  const c = norm(city);
  const s = norm(subregion);
  const text = `${c} ${s}`;

  if (text.includes("allerød")) return "Allerød";
  if (text.includes("fredensborg")) return "Fredensborg";
  if (text.includes("frederikssund")) return "Frederikssund";
  if (text.includes("gribskov")) return "Gribskov";
  if (text.includes("halsnæs")) return "Halsnæs";
  if (text.includes("helsingør")) return "Helsingør";
  if (text.includes("hillerød")) return "Hillerød";
  if (text.includes("hørsholm") || text.includes("horsholm")) return "Hørsholm";

  return "";
}

export function hospitalLabel(t: (k: any) => string, code: HospitalCode) {
  if (code === "GLO_RH") return "GLO/RH";
  const key = `dest_h_${code}`;
  const v = t(key);
  return v === key ? code : v;
}
