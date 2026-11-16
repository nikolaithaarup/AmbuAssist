import { readFileSync } from "fs";
import { join } from "path";
import type { ArrestEvent, ArrestSession } from "../../domain/cardiac-resus/session";
import {
  getCardiacLandingActionState,
  getCardiacLandingSummary,
} from "./presentation";

const STARTED_AT = "2026-11-15T09:00:00.000Z";
const SAFETY_TEXT_SNIPPET = "tids- og hændelsesstøtteværktøj";

function event(
  id: string,
  type: ArrestEvent["type"],
  occurredAt: string,
  correctedEventId?: string,
): ArrestEvent {
  return {
    id,
    type,
    occurredAt,
    elapsedSeconds: Math.max(0, (new Date(occurredAt).getTime() - new Date(STARTED_AT).getTime()) / 1000),
    cycleNumber: 1,
    source: type === "session_started" ? "system" : "manual",
    ...(correctedEventId ? { correctedEventId } : {}),
  };
}

function makeSession(events: ArrestEvent[] = []): ArrestSession {
  return {
    id: "active-session",
    startedAt: STARTED_AT,
    status: "active",
    cycleDurationSeconds: 120,
    events: [event("start", "session_started", STARTED_AT), ...events],
    schemaVersion: 1,
  };
}

describe("Hjertestop focused workflow", () => {
  const landing = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/cardiac-resus/index.tsx"), "utf8");
  const sessionScreen = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/cardiac-resus/session.tsx"), "utf8");
  const summary = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/cardiac-resus/summary.tsx"), "utf8");
  const presentation = readFileSync(join(__dirname, "presentation.ts"), "utf8");

  test("keeps the landing action-first without development labels", () => {
    expect(presentation).toContain('primaryLabel: activeSession ? "Fortsæt" : "Start"');
    expect(landing).toContain("Information om Hjertestop");
    expect(landing).toContain(SAFETY_TEXT_SNIPPET);
    expect(landing).not.toContain("Teamlederens workflow");
    expect(landing).not.toContain("Under udvikling");
    expect(landing).not.toContain("Hjertestop startet");
  });

  test("shows the correct landing actions for empty, active, and corrupted state", () => {
    expect(getCardiacLandingActionState(null, false)).toEqual({ primaryLabel: "Start", showPrimary: true, showClear: false });
    expect(getCardiacLandingActionState(makeSession(), false)).toEqual({ primaryLabel: "Fortsæt", showPrimary: true, showClear: true });
    expect(getCardiacLandingActionState(null, true)).toEqual({ primaryLabel: "Start", showPrimary: false, showClear: true });
  });

  test("summarises active events and excludes corrected events from counts", () => {
    const active = makeSession([
      event("shock-1", "shock_delivered", "2026-11-15T09:01:00.000Z"),
      event("shock-2", "shock_delivered", "2026-11-15T09:02:00.000Z"),
      event("adrenaline-1", "adrenaline_given", "2026-11-15T09:03:00.000Z"),
      event("correction", "event_correction", "2026-11-15T09:04:00.000Z", "shock-2"),
    ]);

    expect(getCardiacLandingSummary(active, "2026-11-15T09:05:00.000Z")).toMatchObject({
      sessionStartedAt: STARTED_AT,
      shockCount: 1,
      adrenalineCount: 1,
      elapsedSeconds: 300,
      outcome: null,
      outcomeOccurredAt: null,
    });
  });

  test.each([
    ["rosc", "ROSC"],
    ["mors", "MORS"],
  ] as const)("uses the recorded %s event timestamp", (type, _label) => {
    const occurredAt = "2026-11-15T09:06:30.000Z";
    expect(getCardiacLandingSummary(makeSession([event("outcome", type, occurredAt)]), "2026-11-15T09:07:00.000Z")).toMatchObject({
      outcome: type,
      outcomeOccurredAt: occurredAt,
    });
  });

  test("does not display a corrected outcome", () => {
    const roscAt = "2026-11-15T09:06:30.000Z";
    const corrected = makeSession([
      event("outcome", "rosc", roscAt),
      event("outcome-correction", "event_correction", "2026-11-15T09:06:45.000Z", "outcome"),
    ]);

    expect(getCardiacLandingSummary(corrected, "2026-11-15T09:07:00.000Z")).toMatchObject({
      outcome: null,
      outcomeOccurredAt: null,
    });
  });

  test("prioritises the cycle timer and keeps the approved event actions accessible", () => {
    expect(sessionScreen).toContain("fontSize: 54");
    expect(sessionScreen).toContain("accessibilityLabel={`Registrér ${item.label}`}");
    expect(sessionScreen).toContain("accessibilityState={{ expanded: showAllEvents }}");
    expect(sessionScreen).not.toContain("Knapperne registrerer kun");
  });

  test("keeps a compact summary and correction-preserving event log", () => {
    expect(summary).toContain("rettelser bevares");
    expect(summary).toContain("summary.shockVfCount");
    expect(summary).toContain("getCorrectedArrestEventIds");
  });
});
