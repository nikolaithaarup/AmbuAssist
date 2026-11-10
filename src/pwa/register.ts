if (
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  window.location.protocol === "https:"
) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
