// Capture before Expo Router initializes or rewrites browser history.
export const initialBrowserUrl =
  typeof window !== "undefined" && window.location
    ? window.location.href
    : undefined;
