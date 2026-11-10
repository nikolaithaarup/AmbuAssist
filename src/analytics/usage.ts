import { Platform } from "react-native";

export type AmbuAssistToolId =
  | "assessment-tools"
  | "behavioural-geriatric"
  | "blood-gas"
  | "blood-gas-acid-base"
  | "blood-gas-infection"
  | "blood-gas-patterns"
  | "burns"
  | "cardiac-resuscitation"
  | "destination"
  | "exams"
  | "neurological"
  | "news2"
  | "paediatric"
  | "spinal-trauma"
  | "support-numbers"
  | "thrombolysis"
  | "weight-joule-dose"
  | "wells-dvt";

const DEFAULT_USAGE_URL =
  "https://portal.synapsestudio.dk/api/ambuassist/usage";

const TOOL_BY_PATH: Readonly<Record<string, AmbuAssistToolId>> = {
  "/tools/assessment-tools": "assessment-tools",
  "/tools/assessment-tools/behavioural-geriatric": "behavioural-geriatric",
  "/tools/assessment-tools/bloodgas": "blood-gas",
  "/tools/assessment-tools/bloodgas/acid-base": "blood-gas-acid-base",
  "/tools/assessment-tools/bloodgas/infection": "blood-gas-infection",
  "/tools/assessment-tools/bloodgas/patterns": "blood-gas-patterns",
  "/tools/brandsaar": "burns",
  "/tools/assessment-tools/cardiac-resus": "cardiac-resuscitation",
  "/tools/assessment-tools/cardiac-resus/session": "cardiac-resuscitation",
  "/tools/assessment-tools/cardiac-resus/summary": "cardiac-resuscitation",
  "/tools/destination": "destination",
  "/tools/exams": "exams",
  "/tools/assessment-tools/neurological": "neurological",
  "/tools/assessment-tools/news2": "news2",
  "/tools/assessment-tools/paediatric": "paediatric",
  "/tools/assessment-tools/spinal-trauma": "spinal-trauma",
  "/tools/support-numbers": "support-numbers",
  "/tools/trombolysis": "thrombolysis",
  "/tools/weight-joule-dose": "weight-joule-dose",
  "/tools/assessment-tools/wells-dvt": "wells-dvt",
};

let openRecorded = false;

export function usageToolForPath(pathname: string): AmbuAssistToolId | null {
  return TOOL_BY_PATH[pathname] ?? null;
}

async function sendUsage(
  body: { readonly type: "open" } | { readonly type: "tool"; readonly tool: AmbuAssistToolId },
): Promise<void> {
  if (Platform.OS !== "web") return;

  try {
    await fetch(
      process.env.EXPO_PUBLIC_PORTAL_USAGE_URL ?? DEFAULT_USAGE_URL,
      {
        method: "POST",
        credentials: "include",
        keepalive: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
  } catch {
    // Usage statistics must never interrupt a clinical workflow.
  }
}

export async function recordAppOpen(): Promise<void> {
  if (openRecorded) return;
  openRecorded = true;
  await sendUsage({ type: "open" });
}

export async function recordToolOpen(tool: AmbuAssistToolId): Promise<void> {
  await sendUsage({ type: "tool", tool });
}

export function resetUsageForTests(): void {
  if (process.env.NODE_ENV === "test") openRecorded = false;
}
