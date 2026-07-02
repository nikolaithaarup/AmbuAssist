import { normalizeFavouritePaths, toggleFavouritePath } from "./favourites";

describe("favourite helpers", () => {
  test("normalizes persisted tool paths and removes duplicates", () => {
    expect(normalizeFavouritePaths(["/tools/destination", "/tools/destination", null, 42, "/not-a-tool"])).toEqual(["/tools/destination"]);
  });

  test.each([null, undefined, {}, "invalid"])("treats invalid persisted data as empty: %p", (value) => {
    expect(normalizeFavouritePaths(value)).toEqual([]);
  });

  test("adds a favourite without mutating the current list", () => {
    const current = ["/tools/destination"];
    expect(toggleFavouritePath(current, "/tools/brandsaar")).toEqual(["/tools/destination", "/tools/brandsaar"]);
    expect(current).toEqual(["/tools/destination"]);
  });

  test("removes an existing favourite", () => {
    expect(toggleFavouritePath(["/tools/destination", "/tools/brandsaar"], "/tools/destination")).toEqual(["/tools/brandsaar"]);
  });
});
