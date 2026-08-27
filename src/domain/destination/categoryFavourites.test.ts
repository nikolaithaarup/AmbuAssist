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
      "akutmodtagelse",
      "apopleksi_ekskl_trombolyse",
      "neurologi_ekskl_apopleksi",
      "paediatri",
      "traumecenter",
    ]);
  });

  test("adds and removes favourites while preserving ordering", () => {
    const added = toggleDestinationCategoryFavourite(
      ["akutmodtagelse", "paediatri"],
      "kardiologi",
    );
    expect(added).toEqual(["akutmodtagelse", "paediatri", "kardiologi"]);
    expect(toggleDestinationCategoryFavourite(added, "paediatri")).toEqual([
      "akutmodtagelse",
      "kardiologi",
    ]);
    expect(
      toggleDestinationCategoryFavourite(["akutmodtagelse"], "akutmodtagelse"),
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

  test("non-favourites remain available to the picker", () => {
    const favourites = getDestinationCategoryFavourites(
      ["akutmodtagelse"],
      available,
    );
    expect(available.filter((item) => !favourites.includes(item))).toContain(
      "reumatologi",
    );
  });
});
