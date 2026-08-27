import type { Area, ByenCategory, RegionCategory } from "./types";

/**
 * Stable user-facing clinical intent IDs. Regional visitation already has the
 * more complete taxonomy, so its IDs are retained as the canonical IDs.
 */
export type DestinationCategoryIntent = RegionCategory;

/** Only mappings with a deliberate source-level equivalent belong here. */
export const BYEN_CATEGORY_BY_INTENT: Partial<
  Record<DestinationCategoryIntent, ByenCategory>
> = {
  akutmodtagelse: "hospital",
  medicinsk_modtagelse: "medicin",
  reumatologi: "reumatologi",
  kirurgi_mave_tarm: "gaskir",
  apopleksi_ekskl_trombolyse: "neuro_apopleksi",
  neurologi_ekskl_apopleksi: "neuro_almen",
  kardiologi: "kardiologi",
  ortopaedkirurgi: "ortkir",
  paediatri: "paediatri",
  gynaekologi: "gyn",
  urologi: "uro",
};

export type GeographicCategory =
  | { available: true; area: "byen"; category: ByenCategory }
  | { available: true; area: "region"; category: RegionCategory }
  | { available: false; area: Area; intent: DestinationCategoryIntent };

export function getCategoryForArea(
  intent: DestinationCategoryIntent,
  area: "byen",
):
  | { available: true; area: "byen"; category: ByenCategory }
  | { available: false; area: "byen"; intent: DestinationCategoryIntent };
export function getCategoryForArea(
  intent: DestinationCategoryIntent,
  area: "region",
): { available: true; area: "region"; category: RegionCategory };
export function getCategoryForArea(
  intent: DestinationCategoryIntent,
  area: Area,
): GeographicCategory;
export function getCategoryForArea(
  intent: DestinationCategoryIntent,
  area: Area,
): GeographicCategory {
  if (area === "region") {
    return { available: true, area, category: intent };
  }

  const category = BYEN_CATEGORY_BY_INTENT[intent];
  return category
    ? { available: true, area, category }
    : { available: false, area, intent };
}
