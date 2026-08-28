import {
  DEFAULT_DESTINATION_CATEGORY_FAVOURITES,
  getDestinationCategoryFavourites,
  normalizeDestinationCategoryFavouritePreference,
  toggleDestinationCategoryFavourite,
} from "./categoryFavourites";
import type { DestinationCategoryIntent } from "./categoryRouting";

const available: DestinationCategoryIntent[] = [
  ...DEFAULT_DESTINATION_CATEGORY_FAVOURITES,
  "kardiologi",
  "reumatologi",
];

describe("Destination category favourites", () => {
  test("a new user receives the intended ordered defaults", () => {
    expect(getDestinationCategoryFavourites(null, available)).toEqual([
      "skadestue",
      "medicinsk_modtagelse",
      "neurologi_ekskl_apopleksi",
      "paediatri",
      "gynaekologi",
      "obstetrik",
      "oere_naese_hals",
    ]);
  });

  test("adds and removes favourites while preserving ordering", () => {
    const added = toggleDestinationCategoryFavourite(
      ["skadestue", "paediatri"],
      "kardiologi",
    );
    expect(added).toEqual(["skadestue", "paediatri", "kardiologi"]);
    expect(toggleDestinationCategoryFavourite(added, "paediatri")).toEqual([
      "skadestue",
      "kardiologi",
    ]);
    expect(
      toggleDestinationCategoryFavourite(["skadestue"], "skadestue"),
    ).toEqual([]);
  });

  test("normalizes persisted values and keeps an intentional empty list", () => {
    expect(normalizeDestinationCategoryFavouritePreference(undefined)).toBeNull();
    expect(normalizeDestinationCategoryFavouritePreference([])).toEqual([]);
    expect(getDestinationCategoryFavourites([], available)).toEqual([]);
    expect(
      normalizeDestinationCategoryFavouritePreference([
        "kardiologi",
        "not-a-category",
        "kardiologi",
      ]),
    ).toEqual(["kardiologi"]);
  });

  test("migrates the legacy acute favourite without resetting custom order", () => {
    expect(
      normalizeDestinationCategoryFavouritePreference([
        "kardiologi",
        "akutmodtagelse",
        "paediatri",
      ]),
    ).toEqual(["kardiologi", "skadestue", "paediatri"]);
  });

  test("non-favourites remain available to the picker", () => {
    const favourites = getDestinationCategoryFavourites(
      ["skadestue"],
      available,
    );
    expect(available.filter((item) => !favourites.includes(item))).toContain(
      "reumatologi",
    );
  });
});
