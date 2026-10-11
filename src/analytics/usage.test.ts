import { Platform } from "react-native";
import {
  recordAppOpen,
  recordToolOpen,
  resetUsageForTests,
  usageToolForPath,
} from "./usage";

describe("privacy-conscious usage reporting", () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    resetUsageForTests();
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as jest.Mock;
  });

  afterAll(() => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
  });

  test("maps only allow-listed routes to aggregate tool identifiers", () => {
    expect(usageToolForPath("/tools/destination")).toBe("destination");
    expect(
      usageToolForPath("/tools/assessment-tools/cardiac-resus/session"),
    ).toBe("cardiac-resuscitation");
    expect(usageToolForPath("/tools/about-support")).toBeNull();
    expect(usageToolForPath("/tools/not-a-real-tool")).toBeNull();
  });

  test("records one open per browser document without user or clinical data", async () => {
    await recordAppOpen();
    await recordAppOpen();

    expect(fetch).toHaveBeenCalledTimes(1);
    const request = (fetch as jest.Mock).mock.calls[0][1];
    expect(JSON.parse(request.body)).toEqual({ type: "open" });
  });

  test("sends only the stable tool identifier", async () => {
    await recordToolOpen("news2");

    const request = (fetch as jest.Mock).mock.calls[0][1];
    expect(JSON.parse(request.body)).toEqual({ type: "tool", tool: "news2" });
    expect(request.credentials).toBe("include");
  });
});
