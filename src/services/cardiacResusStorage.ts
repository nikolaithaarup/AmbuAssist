import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ArrestSession } from "../domain/cardiac-resus/session";

const ACTIVE_SESSION_KEY = "ambuassist.cardiac-resus.active.v1";
const LATEST_SESSION_KEY = "ambuassist.cardiac-resus.latest.v1";

function parseSession(raw: string | null): ArrestSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ArrestSession>;
    if (
      value.schemaVersion !== 1 ||
      typeof value.id !== "string" ||
      typeof value.startedAt !== "string" ||
      (value.status !== "active" && value.status !== "ended") ||
      !Number.isFinite(value.cycleDurationSeconds) ||
      !Array.isArray(value.events)
    ) return null;
    return value as ArrestSession;
  } catch {
    return null;
  }
}

export async function getActiveArrestSession(): Promise<ArrestSession | null> {
  const session = parseSession(await AsyncStorage.getItem(ACTIVE_SESSION_KEY));
  return session?.status === "active" ? session : null;
}

export async function saveActiveArrestSession(session: ArrestSession): Promise<void> {
  if (session.status !== "active") throw new Error("Only active sessions can be saved as drafts");
  await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
}

export async function clearActiveArrestSession(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
}

export async function saveEndedArrestSession(session: ArrestSession): Promise<void> {
  if (session.status !== "ended") throw new Error("Only ended sessions can be saved as latest sessions");
  await AsyncStorage.multiSet([[LATEST_SESSION_KEY, JSON.stringify(session)]]);
  await clearActiveArrestSession();
}

export async function getLatestArrestSession(): Promise<ArrestSession | null> {
  const session = parseSession(await AsyncStorage.getItem(LATEST_SESSION_KEY));
  return session?.status === "ended" ? session : null;
}
