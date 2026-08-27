import {
  ABOUT_SUPPORT_TOOL,
  FAVOURITABLE_TOOLS,
  HOME_TOOLS,
} from "./catalog";

describe("home tool catalogue", () => {
  test("consolidates informational routes outside the clinical and favourite catalogues", () => {
    const homePaths = HOME_TOOLS.map((tool) => tool.path);
    const favouritePaths = FAVOURITABLE_TOOLS.map((tool) => tool.path);

    expect(ABOUT_SUPPORT_TOOL.path).toBe("/tools/about-support");
    expect(homePaths).toHaveLength(7);
    expect(homePaths).not.toEqual(
      expect.arrayContaining([
        "/tools/about",
        "/tools/contact",
        "/tools/medical-disclaimer",
        "/tools/about-support",
      ]),
    );
    expect(favouritePaths).not.toEqual(
      expect.arrayContaining([
        "/tools/about",
        "/tools/contact",
        "/tools/medical-disclaimer",
        "/tools/about-support",
      ]),
    );
  });
});
