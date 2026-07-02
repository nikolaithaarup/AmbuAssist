import { normalizeFavouritePath } from "../../domain/favourites/favourites";
import { FAVOURITABLE_TOOLS } from "./catalog";

describe("favouritable tool catalog paths", () => {
  test("all paths are canonical and unique", () => {
    const paths = FAVOURITABLE_TOOLS.map((tool) => tool.path);

    expect(paths.map(normalizeFavouritePath)).toEqual(paths);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
