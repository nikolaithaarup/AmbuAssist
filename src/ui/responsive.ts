import { Platform, useWindowDimensions } from "react-native";

export type LayoutBand = "compact" | "standard" | "expanded";

export const RESPONSIVE_BREAKPOINTS = {
  standard: 430,
  expanded: 744,
} as const;

export const EXPANDED_TOOL_RAIL_WIDTH = 156;

export function getLayoutBand(width: number): LayoutBand {
  if (width < RESPONSIVE_BREAKPOINTS.standard) return "compact";
  if (width < RESPONSIVE_BREAKPOINTS.expanded) return "standard";
  return "expanded";
}

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const band =
    Platform.OS === "web" ? getLayoutBand(width) : ("standard" as const);

  return {
    width,
    height,
    band,
    isCompact: band === "compact",
    isStandard: band === "standard",
    isExpanded: band === "expanded",
  };
}
