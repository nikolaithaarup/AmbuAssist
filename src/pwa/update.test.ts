import {
  fetchAvailablePwaBuildId,
  isSafePwaUpdatePath,
  parsePwaVersion,
  shouldApplyPwaUpdate,
} from "./update";

describe("PWA update coordination", () => {
  test("parses only a non-empty build identifier", () => {
    expect(parsePwaVersion({ buildId: " release-b " })).toEqual({
      buildId: "release-b",
    });
    expect(parsePwaVersion({ buildId: "" })).toBeNull();
    expect(parsePwaVersion({ version: "release-b" })).toBeNull();
  });

  test("only treats the root and Home as safe automatic update points", () => {
    expect(isSafePwaUpdatePath("/")).toBe(true);
    expect(isSafePwaUpdatePath("/home")).toBe(true);
    expect(isSafePwaUpdatePath("/tools/destination")).toBe(false);
    expect(
      isSafePwaUpdatePath("/tools/assessment-tools/cardiac-resus/session"),
    ).toBe(false);
  });

  test("never reloads an unchanged build or an active arrest session", () => {
    expect(
      shouldApplyPwaUpdate({
        availableBuildId: "release-a",
        currentBuildId: "release-a",
        pathname: "/home",
        hasActiveArrestSession: false,
      }),
    ).toBe(false);
    expect(
      shouldApplyPwaUpdate({
        availableBuildId: "release-b",
        currentBuildId: "release-a",
        pathname: "/home",
        hasActiveArrestSession: true,
      }),
    ).toBe(false);
  });

  test("applies a newer build at Home when no arrest session is active", () => {
    expect(
      shouldApplyPwaUpdate({
        availableBuildId: "release-b",
        currentBuildId: "release-a",
        pathname: "/home",
        hasActiveArrestSession: false,
      }),
    ).toBe(true);
  });

  test("fails closed when the version request is interrupted", async () => {
    const failedFetch = jest.fn().mockRejectedValue(new Error("offline"));
    await expect(fetchAvailablePwaBuildId(failedFetch)).resolves.toBeNull();
  });

  test("requests the version without accepting a cached response", async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ buildId: "release-b" }),
    });
    await expect(fetchAvailablePwaBuildId(fetcher)).resolves.toBe("release-b");
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringMatching(/^\/version\.json\?t=\d+$/),
      expect.objectContaining({ cache: "no-store" }),
    );
  });
});
