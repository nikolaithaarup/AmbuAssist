export const theme = {
  colors: {
    text: "#ECECEC",
    mutedText: "#B9B9B9",
    card: "rgba(40, 44, 38, 0.70)",
    cardBorder: "rgba(220, 220, 220, 0.14)",
    border: "rgba(220, 220, 220, 0.14)",
    accent: "rgba(205, 205, 205, 0.35)",
    danger: "#FF6B6B",
    warn: "#FFD166",
    ok: "#8CE99A",
    topTone: "#3E4A36",
    backgroundBase: "#20271D",
    primary: "#4CAF50", // ← ADD THIS (pick your color)
  },
  radius: 16,
  spacing: {
    xxs: 4,
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  typography: {
    toolTitle: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "800" as const,
    },
    toolDescription: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "400" as const,
    },
  },
  touchTarget: {
    minimum: 48,
    compact: 44,
  },
  interaction: {
    pressedOpacity: 0.82,
    disabledOpacity: 0.45,
    pressedScale: 0.985,
    focusRingWidth: 2,
    focusRingOffset: 2,
  },
};
