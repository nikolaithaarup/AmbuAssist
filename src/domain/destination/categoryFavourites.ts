import type { DestinationCategoryIntent } from "./categoryRouting";
export const DEFAULT_DESTINATION_CATEGORY_FAVOURITES = [
  "skadestue",
  "medicinsk_modtagelse",
  "neurologi_ekskl_apopleksi",
  "paediatri",
  "gynaekologi",
  "obstetrik",
  "oere_naese_hals",
] as const satisfies readonly DestinationCategoryIntent[];

const VALID_CATEGORY_IDS = new Set<DestinationCategoryIntent>([
  "traumecenter", "skadestue", "medicinsk_modtagelse", "akutklinik",
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
      value.flatMap((item): DestinationCategoryIntent[] => {
        if (item === "akutmodtagelse") return ["skadestue"];
        return typeof item === "string" &&
          VALID_CATEGORY_IDS.has(item as DestinationCategoryIntent)
          ? [item as DestinationCategoryIntent]
          : [];
      }),
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
