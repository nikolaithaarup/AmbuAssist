const app = require("./app.json");

const DEFAULT_APP_ORIGIN = "https://ambuassist.synapsestudio.dk";

function resolveAppOrigin(value = process.env.EXPO_PUBLIC_APP_ORIGIN) {
  const origin = value?.trim() || DEFAULT_APP_ORIGIN;

  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error("EXPO_PUBLIC_APP_ORIGIN must be a valid absolute origin.");
  }

  const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(
    parsed.hostname,
  );
  const isAllowedProtocol =
    parsed.protocol === "https:" ||
    (parsed.protocol === "http:" && isLoopback);

  if (
    !isAllowedProtocol ||
    parsed.origin !== origin ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      "EXPO_PUBLIC_APP_ORIGIN must be an HTTPS origin without a path, query, credentials, or fragment (HTTP is allowed only for loopback development).",
    );
  }

  return origin;
}

module.exports = () => ({
  ...app.expo,
  plugins: app.expo.plugins.map((plugin) => {
    if (Array.isArray(plugin) && plugin[0] === "expo-router") {
      return [
        plugin[0],
        {
          ...(plugin[1] ?? {}),
          origin: resolveAppOrigin(),
        },
      ];
    }

    return plugin;
  }),
});

module.exports.resolveAppOrigin = resolveAppOrigin;
