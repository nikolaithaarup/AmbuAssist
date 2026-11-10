import { detectInstallPlatform, isStandaloneDisplay } from "./install";
import { da, en } from "../i18n/strings";

describe("PWA installation platform helpers", () => {
  test("detects Android before other mobile user-agent tokens", () => {
    expect(
      detectInstallPlatform(
        "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36",
      ),
    ).toBe("android");
  });

  test("uses the iPhone guide for iOS and iPad desktop user agents", () => {
    expect(
      detectInstallPlatform(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      ),
    ).toBe("ios");
    expect(
      detectInstallPlatform(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Safari/605.1.15",
        5,
      ),
    ).toBe("ios");
  });

  test("recognizes both standard and legacy iOS standalone modes", () => {
    expect(isStandaloneDisplay(true, false)).toBe(true);
    expect(isStandaloneDisplay(false, true)).toBe(true);
    expect(isStandaloneDisplay(false, false)).toBe(false);
  });

  test("provides concise installation guidance in both supported languages", () => {
    expect(en.install_ios_3).toBe("Choose Add to Home Screen.");
    expect(en.install_android_3).toContain("Install app");
    expect(da.install_ios_3).toBe("Vælg Føj til hjemmeskærm.");
    expect(da.install_android_3).toContain("Installer app");
  });
});
