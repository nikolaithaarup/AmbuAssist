import { fetchPublishedVisitation } from "./visitationRemote.web";

describe("published visitation Portal boundary", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test("requests the authenticated published snapshot without caching", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: "published-v2" }),
    }) as jest.Mock;

    await expect(fetchPublishedVisitation()).resolves.toEqual({ version: "published-v2" });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://portal.synapsestudio.dk/api/ambuassist/visitation",
      expect.objectContaining({ credentials: "include", cache: "no-store" }),
    );
  });

  test("returns null for unavailable or rejected endpoints so offline fallback remains usable", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as jest.Mock;
    await expect(fetchPublishedVisitation()).resolves.toBeNull();
    global.fetch = jest.fn().mockRejectedValue(new Error("offline")) as jest.Mock;
    await expect(fetchPublishedVisitation()).resolves.toBeNull();
  });
});
