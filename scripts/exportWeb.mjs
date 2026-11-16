import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function resolveBuildId() {
  const environmentBuildId =
    process.env.EXPO_PUBLIC_BUILD_ID?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    process.env.GITHUB_SHA?.trim();
  if (environmentBuildId) return environmentBuildId;

  const gitResult = spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
    windowsHide: true,
  });
  return gitResult.status === 0 && gitResult.stdout.trim()
    ? gitResult.stdout.trim()
    : "development";
}

const buildId = resolveBuildId();
const versionPath = resolve("public", "version.json");
const expoCliPath = resolve("node_modules", "expo", "bin", "cli");
let exitCode = 1;

mkdirSync(resolve("public"), { recursive: true });
writeFileSync(versionPath, `${JSON.stringify({ buildId })}\n`, "utf8");

try {
  const result = spawnSync(
    process.execPath,
    [expoCliPath, "export", "--platform", "web", "--clear"],
    {
      stdio: "inherit",
      env: { ...process.env, EXPO_PUBLIC_BUILD_ID: buildId },
    },
  );
  if (result.error) throw result.error;
  exitCode = result.status ?? 1;
} finally {
  rmSync(versionPath, { force: true });
}

if (exitCode !== 0) process.exit(exitCode);
