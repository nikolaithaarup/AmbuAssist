import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ArrestEvent, ArrestEventType, ArrestSession } from "../domain/cardiac-resus/session";

const ACTIVE_SESSION_KEY = "ambuassist.cardiac-resus.active.v1";
const LATEST_SESSION_KEY = "ambuassist.cardiac-resus.latest.v1";

const KNOWN_EVENT_TYPES = new Set<ArrestEventType>([
  "session_started", "rhythm_check", "shock_delivered", "cpr_cycle_marker",
  "adrenaline_given", "amiodarone_given", "airway_event", "rosc", "mors",
  "transport_decision", "physician_instruction", "free_note", "session_ended",
]);

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(new Date(value).getTime());
}

function parseEvent(value: unknown): ArrestEvent | null {
  if (!value || typeof value !== "object") return null;
  const event = value as Record<string, unknown>;
  if (
    typeof event.id !== "string" ||
    !isValidTimestamp(event.occurredAt) ||
    !Number.isFinite(event.elapsedSeconds) || Number(event.elapsedSeconds) < 0 ||
    !Number.isFinite(event.cycleNumber) || Number(event.cycleNumber) < 1 ||
    (event.source !== "manual" && event.source !== "system") ||
    typeof event.type !== "string"
  ) return null;

  const knownType = KNOWN_EVENT_TYPES.has(event.type as ArrestEventType);
  const originalNote = typeof event.note === "string" ? event.note : undefined;
  const shockRhythm = event.metadata && typeof event.metadata === "object"
    ? (event.metadata as { shockRhythm?: unknown }).shockRhythm
    : undefined;

  return {
    id: event.id,
    type: knownType ? event.type as ArrestEventType : "free_note",
    occurredAt: event.occurredAt,
    elapsedSeconds: Math.floor(Number(event.elapsedSeconds)),
    cycleNumber: Math.floor(Number(event.cycleNumber)),
    source: event.source,
    ...(knownType
      ? (originalNote ? { note: originalNote } : {})
      : { note: `Ukendt tidligere hændelse: ${event.type}${originalNote ? ` · ${originalNote}` : ""}` }),
    ...(shockRhythm === "VF" || shockRhythm === "pVT" ? { metadata: { shockRhythm } } : {}),
    ...(typeof event.correctedEventId === "string" ? { correctedEventId: event.correctedEventId } : {}),
  };
}

export function parseStoredArrestSession(raw: string | null): ArrestSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (
      !value || typeof value !== "object" ||
      value.schemaVersion !== 1 ||
      typeof value.id !== "string" ||
      !isValidTimestamp(value.startedAt) ||
      (value.status !== "active" && value.status !== "ended") ||
      !Number.isFinite(value.cycleDurationSeconds) || Number(value.cycleDurationSeconds) <= 0 ||
      !Array.isArray(value.events) ||
      (value.endedAt !== undefined && !isValidTimestamp(value.endedAt))
    ) return null;
    const events = value.events.map(parseEvent);
    if (events.some((event) => event === null)) return null;
    return {
      id: value.id,
      startedAt: value.startedAt,
      status: value.status,
      cycleDurationSeconds: Number(value.cycleDurationSeconds),
      events: events as ArrestEvent[],
      schemaVersion: 1,
      ...(typeof value.endedAt === "string" ? { endedAt: value.endedAt } : {}),
    };
  } catch {
    return null;
  }
}

export type ActiveSessionInspection = {
  session: ArrestSession | null;
  corrupted: boolean;
};

export async function inspectActiveArrestSession(): Promise<ActiveSessionInspection> {
  const raw = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
  if (raw === null) return { session: null, corrupted: false };
  const session = parseStoredArrestSession(raw);
  return session?.status === "active"
    ? { session, corrupted: false }
    : { session: null, corrupted: true };
}

export async function getActiveArrestSession(): Promise<ArrestSession | null> {
  return (await inspectActiveArrestSession()).session;
}

export async function saveActiveArrestSession(session: ArrestSession): Promise<void> {
  if (session.status !== "active") throw new Error("Only active sessions can be saved as drafts");
  await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
}

export async function clearActiveArrestSession(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
}

export type EndedSessionSaveResult = { activeDraftRemoved: boolean };

export async function saveEndedArrestSession(session: ArrestSession): Promise<EndedSessionSaveResult> {
  if (session.status !== "ended") throw new Error("Only ended sessions can be saved as latest sessions");
  await AsyncStorage.setItem(LATEST_SESSION_KEY, JSON.stringify(session));
  try {
    await clearActiveArrestSession();
    return { activeDraftRemoved: true };
  } catch {
    return { activeDraftRemoved: false };
  }
}

export async function getLatestArrestSession(): Promise<ArrestSession | null> {
  const session = parseStoredArrestSession(await AsyncStorage.getItem(LATEST_SESSION_KEY));
  return session?.status === "ended" ? session : null;
}
