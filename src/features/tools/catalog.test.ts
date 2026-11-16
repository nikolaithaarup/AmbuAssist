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
    expect(homePaths).toHaveLength(8);
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

  test("keeps the clinical home order and exposes each favourite route once", () => {
    expect(HOME_TOOLS.map((tool) => tool.path)).toEqual([
      "/tools/assessment-tools/cardiac-resus",
      "/tools/destination",
      "/tools/weight-joule-dose",
      "/tools/trombolysis",
      "/tools/assessment-tools/bloodgas",
      "/tools/support-numbers",
      "/tools/exams",
      "/tools/assessment-tools",
    ]);

    const favouritePaths = FAVOURITABLE_TOOLS.map((tool) => tool.path);
    expect(new Set(favouritePaths).size).toBe(favouritePaths.length);
  });
});
