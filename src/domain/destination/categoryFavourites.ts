import type { DestinationCategoryIntent } from "./categoryRouting";
import type { RegionCategory } from "./types";

export const DEFAULT_DESTINATION_CATEGORY_FAVOURITES = [
  "akutmodtagelse",
  "apopleksi_ekskl_trombolyse",
  "neurologi_ekskl_apopleksi",
  "paediatri",
  "traumecenter",
] as const satisfies readonly DestinationCategoryIntent[];

const VALID_CATEGORY_IDS = new Set<RegionCategory>([
  "traumecenter", "akutmodtagelse", "medicinsk_modtagelse", "akutklinik",
  "kirurgi_mave_tarm", "boernekirurgi", "ortopaedkirurgi",
  "ortopaedkirurgi_boern_u16", "karkirurgi", "thoraxkirurgi",
  "neurokirurgi", "urologi", "plastkirurgi", "mammakirurgi",
  "kardiologi", "lungemedicin", "gastroenterologi", "endokrinologi",
  "geriatrisk", "reumatologi", "infektionsmedicin", "nefrologi",
  "haematologi", "neurologi_ekskl_apopleksi",
  "apopleksi_ekskl_trombolyse", "gynaekologi", "obstetrik", "paediatri",
  "billeddiagnostik", "klinisk_onkologi", "palliativ_enhed", "oftalmologi",
  "oere_naese_hals", "audiologi", "odontologi", "dermato_venerologi",
  "allergologi", "arbejds_miljoemedicin", "socialmedicin",
]);

export type DestinationCategoryFavouritePreference =
  | DestinationCategoryIntent[]
  | null;

export function normalizeDestinationCategoryFavouritePreference(
  value: unknown,
): DestinationCategoryFavouritePreference {
  if (value === null || value === undefined) return null;
  if (!Array.isArray(value)) return null;
  return Array.from(
    new Set(
      value.filter(
        (item): item is DestinationCategoryIntent =>
          typeof item === "string" &&
          VALID_CATEGORY_IDS.has(item as RegionCategory),
      ),
    ),
  );
}

export function getDestinationCategoryFavourites(
  preference: DestinationCategoryFavouritePreference,
  available: readonly DestinationCategoryIntent[],
) {
  const source =
    preference === null
      ? DEFAULT_DESTINATION_CATEGORY_FAVOURITES
      : preference;
  const availableSet = new Set(available);
  return source.filter((category) => availableSet.has(category));
}

export function toggleDestinationCategoryFavourite(
  current: readonly DestinationCategoryIntent[],
  category: DestinationCategoryIntent,
) {
  return current.includes(category)
    ? current.filter((item) => item !== category)
    : [...current, category];
}

