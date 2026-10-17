export type InstallPlatform = "ios" | "android";

export function detectInstallPlatform(
  userAgent: string,
  maxTouchPoints = 0,
): InstallPlatform {
  if (/android/i.test(userAgent)) return "android";

  const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent);
  const isTouchMac = /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
  return isAppleMobile || isTouchMac ? "ios" : "ios";
}

export function isStandaloneDisplay(
  displayModeStandalone: boolean,
  navigatorStandalone: boolean | undefined,
) {
  return displayModeStandalone || navigatorStandalone === true;
}
