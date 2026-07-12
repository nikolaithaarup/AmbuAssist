export const DEFAULT_CYCLE_DURATION_SECONDS = 120;
export const ADRENALINE_REMINDER_CYCLES = 2;

export type ArrestEventType =
  | "session_started"
  | "rhythm_check"
  | "shock_delivered"
  | "cpr_cycle_marker"
  | "adrenaline_given"
  | "amiodarone_given"
  | "airway_event"
  | "rosc"
  | "mors"
  | "transport_decision"
  | "physician_instruction"
  | "free_note"
  | "session_ended";

export type ShockRhythm = "VF" | "pVT";

export type ArrestEvent = {
  id: string;
  type: ArrestEventType;
  occurredAt: string;
  elapsedSeconds: number;
  cycleNumber: number;
  note?: string;
  source: "manual" | "system";
  correctedEventId?: string;
  metadata?: {
    shockRhythm?: ShockRhythm;
  };
};

export type ArrestSession = {
  id: string;
  startedAt: string;
  endedAt?: string;
  status: "active" | "ended";
  cycleDurationSeconds: number;
  events: ArrestEvent[];
  schemaVersion: 1;
};

export type ArrestSessionSummary = {
  durationSeconds: number;
  shockCount: number;
  shockVfCount: number;
  shockPvtCount: number;
  adrenalineCount: number;
  amiodaroneCount: number;
  airwayCount: number;
  hasRosc: boolean;
  hasMors: boolean;
  latestOutcome: "rosc" | "mors" | null;
  totalRecordedEvents: number;
};

type TimeValue = Date | string | number;

function toTimestamp(value: TimeValue): number | null {
  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function makeId(prefix: string, timestamp: number): string {
  return `${prefix}-${timestamp}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getElapsedSeconds(startedAt: TimeValue, now: TimeValue): number {
  const start = toTimestamp(startedAt);
  const current = toTimestamp(now);
  if (start === null || current === null || current <= start) return 0;
  return Math.floor((current - start) / 1000);
}

export function getCycleNumber(elapsedSeconds: number, cycleDurationSeconds: number): number {
  const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
  const duration = Number.isFinite(cycleDurationSeconds) && cycleDurationSeconds > 0
    ? cycleDurationSeconds
    : DEFAULT_CYCLE_DURATION_SECONDS;
  return Math.floor(elapsed / duration) + 1;
}

export function getCurrentCycleProgress(elapsedSeconds: number, cycleDurationSeconds: number): number {
  const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
  const duration = Number.isFinite(cycleDurationSeconds) && cycleDurationSeconds > 0
    ? cycleDurationSeconds
    : DEFAULT_CYCLE_DURATION_SECONDS;
  return (elapsed % duration) / duration;
}

export function getCycleRemainingSeconds(elapsedSeconds: number, cycleDurationSeconds: number): number {
  const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, Math.floor(elapsedSeconds)) : 0;
  const duration = Number.isFinite(cycleDurationSeconds) && cycleDurationSeconds > 0
    ? Math.floor(cycleDurationSeconds)
    : DEFAULT_CYCLE_DURATION_SECONDS;
  const position = elapsed % duration;
  return position === 0 ? duration : duration - position;
}

export function isPrechargeCueActive(
  elapsedSeconds: number,
  cycleDurationSeconds: number,
  cueWindowSeconds = 15,
): boolean {
  const window = Number.isFinite(cueWindowSeconds) ? Math.max(0, cueWindowSeconds) : 15;
  const remaining = getCycleRemainingSeconds(elapsedSeconds, cycleDurationSeconds);
  return remaining > 0 && remaining <= window;
}

export function findLatestAdrenalineEvent(session: ArrestSession): ArrestEvent | null {
  return session.events.reduce<ArrestEvent | null>((latest, event) => {
    if (event.type !== "adrenaline_given") return latest;
    if (!latest) return event;
    const latestTime = toTimestamp(latest.occurredAt) ?? 0;
    const eventTime = toTimestamp(event.occurredAt) ?? 0;
    return eventTime >= latestTime ? event : latest;
  }, null);
}

export function getSecondsSinceLastAdrenaline(session: ArrestSession, now: TimeValue): number | null {
  const latest = findLatestAdrenalineEvent(session);
  return latest ? getElapsedSeconds(latest.occurredAt, now) : null;
}

export function getAdrenalineReminderSeconds(session: ArrestSession): number {
  const cycleDuration = Number.isFinite(session.cycleDurationSeconds) && session.cycleDurationSeconds > 0
    ? session.cycleDurationSeconds
    : DEFAULT_CYCLE_DURATION_SECONDS;
  return cycleDuration * ADRENALINE_REMINDER_CYCLES;
}

export function isAdrenalineReminderDue(session: ArrestSession, now: TimeValue): boolean {
  const secondsSince = getSecondsSinceLastAdrenaline(session, now);
  return secondsSince !== null && secondsSince >= getAdrenalineReminderSeconds(session);
}

export function summarizeArrestSession(session: ArrestSession): ArrestSessionSummary {
  const count = (type: ArrestEventType) => session.events.filter((event) => event.type === type).length;
  const lastEventAt = session.events.reduce<string | undefined>((latest, event) => {
    if (!latest) return event.occurredAt;
    return (toTimestamp(event.occurredAt) ?? 0) >= (toTimestamp(latest) ?? 0) ? event.occurredAt : latest;
  }, undefined);
  const outcomes = session.events.filter((event) => event.type === "rosc" || event.type === "mors");
  const latestOutcomeEvent = outcomes.reduce<ArrestEvent | null>((latest, event) => {
    if (!latest) return event;
    return (toTimestamp(event.occurredAt) ?? 0) >= (toTimestamp(latest.occurredAt) ?? 0) ? event : latest;
  }, null);

  return {
    durationSeconds: getElapsedSeconds(session.startedAt, session.endedAt ?? lastEventAt ?? session.startedAt),
    shockCount: count("shock_delivered"),
    shockVfCount: session.events.filter((event) => event.type === "shock_delivered" && event.metadata?.shockRhythm === "VF").length,
    shockPvtCount: session.events.filter((event) => event.type === "shock_delivered" && event.metadata?.shockRhythm === "pVT").length,
    adrenalineCount: count("adrenaline_given"),
    amiodaroneCount: count("amiodarone_given"),
    airwayCount: count("airway_event"),
    hasRosc: count("rosc") > 0,
    hasMors: count("mors") > 0,
    latestOutcome: latestOutcomeEvent?.type === "rosc" || latestOutcomeEvent?.type === "mors"
      ? latestOutcomeEvent.type
      : null,
    totalRecordedEvents: session.events.filter((event) => event.source === "manual").length,
  };
}

export function createArrestSession(now: TimeValue): ArrestSession {
  const timestamp = toTimestamp(now) ?? Date.now();
  const startedAt = new Date(timestamp).toISOString();
  const session: ArrestSession = {
    id: makeId("arrest", timestamp),
    startedAt,
    status: "active",
    cycleDurationSeconds: DEFAULT_CYCLE_DURATION_SECONDS,
    events: [],
    schemaVersion: 1,
  };
  return addArrestEvent(session, "session_started", timestamp, undefined, "system");
}

export function addArrestEvent(
  session: ArrestSession,
  type: ArrestEventType,
  now: TimeValue,
  note?: string,
  source: ArrestEvent["source"] = "manual",
  metadata?: ArrestEvent["metadata"],
): ArrestSession {
  const startTimestamp = toTimestamp(session.startedAt) ?? 0;
  const requestedTimestamp = toTimestamp(now) ?? startTimestamp;
  const timestamp = Math.max(startTimestamp, requestedTimestamp);
  const elapsedSeconds = getElapsedSeconds(session.startedAt, timestamp);
  const trimmedNote = note?.trim();
  const event: ArrestEvent = {
    id: makeId("event", timestamp),
    type,
    occurredAt: new Date(timestamp).toISOString(),
    elapsedSeconds,
    cycleNumber: getCycleNumber(elapsedSeconds, session.cycleDurationSeconds),
    source,
    ...(trimmedNote ? { note: trimmedNote } : {}),
    ...(metadata ? { metadata } : {}),
  };
  return { ...session, events: [...session.events, event] };
}

export function addShockEvent(
  session: ArrestSession,
  rhythm: ShockRhythm,
  now: TimeValue,
): ArrestSession {
  return addArrestEvent(session, "shock_delivered", now, undefined, "manual", { shockRhythm: rhythm });
}

export function addNoteEvent(
  session: ArrestSession,
  note: string,
  now: TimeValue,
): ArrestSession {
  return note.trim() ? addArrestEvent(session, "free_note", now, note) : session;
}

export function endArrestSession(session: ArrestSession, now: TimeValue): ArrestSession {
  if (session.status === "ended") return session;
  const withEndEvent = addArrestEvent(session, "session_ended", now, undefined, "system");
  const endedAt = withEndEvent.events.at(-1)?.occurredAt ?? session.startedAt;
  return { ...withEndEvent, status: "ended", endedAt };
}

export function endArrestSessionWithOutcome(
  session: ArrestSession,
  outcome: "rosc" | "mors",
  now: TimeValue,
): ArrestSession {
  return endArrestSession(addArrestEvent(session, outcome, now), now);
}

export function resumeArrestSession(session: ArrestSession): ArrestSession {
  const { endedAt: _endedAt, ...rest } = session;
  return { ...rest, status: "active" };
}
