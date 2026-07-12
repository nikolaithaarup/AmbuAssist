import {
  addArrestEvent,
  addShockEvent,
  addNoteEvent,
  createArrestSession,
  endArrestSession,
  endArrestSessionWithOutcome,
  findLatestAdrenalineEvent,
  getAdrenalineReminderSeconds,
  getCurrentCycleProgress,
  getCycleNumber,
  getCycleRemainingSeconds,
  getElapsedSeconds,
  getSecondsSinceLastAdrenaline,
  isAdrenalineReminderDue,
  isPrechargeCueActive,
  resumeArrestSession,
  summarizeArrestSession,
} from "./session";
import { formatArrestEventLabel, VISIBLE_EVENT_BUTTONS } from "../../features/cardiac-resus/presentation";

const START = "2026-07-12T10:00:00.000Z";

describe("CardiacResus session utilities", () => {
  test("creates an active session with a system start event", () => {
    const session = createArrestSession(START);
    expect(session).toMatchObject({
      startedAt: START,
      status: "active",
      cycleDurationSeconds: 120,
      schemaVersion: 1,
    });
    expect(session.events).toHaveLength(1);
    expect(session.events[0]).toMatchObject({ type: "session_started", elapsedSeconds: 0, cycleNumber: 1, source: "system" });
  });

  test("derives elapsed whole seconds from absolute timestamps", () => {
    expect(getElapsedSeconds(START, "2026-07-12T10:00:42.999Z")).toBe(42);
  });

  test.each([[0, 1], [119, 1], [120, 2], [121, 2], [239, 2], [240, 3]])(
    "maps %s seconds to cycle %s",
    (elapsed, cycle) => expect(getCycleNumber(elapsed, 120)).toBe(cycle),
  );

  test("calculates current cycle progress", () => {
    expect(getCurrentCycleProgress(30, 120)).toBe(0.25);
    expect(getCurrentCycleProgress(120, 120)).toBe(0);
  });

  test("adds a timestamped event without mutating the session", () => {
    const session = createArrestSession(START);
    const updated = addArrestEvent(session, "rhythm_check", "2026-07-12T10:02:01.000Z");
    expect(session.events).toHaveLength(1);
    expect(updated.events.at(-1)).toMatchObject({ type: "rhythm_check", elapsedSeconds: 121, cycleNumber: 2, source: "manual" });
  });

  test("ends a session and records a system end event", () => {
    const ended = endArrestSession(createArrestSession(START), "2026-07-12T10:03:00.000Z");
    expect(ended).toMatchObject({ status: "ended", endedAt: "2026-07-12T10:03:00.000Z" });
    expect(ended.events.at(-1)).toMatchObject({ type: "session_ended", elapsedSeconds: 180, source: "system" });
  });

  test("defensively clamps times before the session start", () => {
    expect(getElapsedSeconds(START, "2026-07-12T09:59:00.000Z")).toBe(0);
    const updated = addArrestEvent(createArrestSession(START), "free_note", "2026-07-12T09:59:00.000Z");
    expect(updated.events.at(-1)).toMatchObject({ occurredAt: START, elapsedSeconds: 0, cycleNumber: 1 });
  });

  test("preserves insertion order for events", () => {
    const first = addArrestEvent(createArrestSession(START), "rhythm_check", "2026-07-12T10:00:10.000Z");
    const second = addArrestEvent(first, "airway_event", "2026-07-12T10:00:20.000Z");
    expect(second.events.map((event) => event.type)).toEqual(["session_started", "rhythm_check", "airway_event"]);
  });

  test("finds the latest adrenaline event and resets elapsed reminder time", () => {
    const first = addArrestEvent(createArrestSession(START), "adrenaline_given", "2026-07-12T10:01:00.000Z");
    const second = addArrestEvent(first, "adrenaline_given", "2026-07-12T10:03:00.000Z");
    expect(findLatestAdrenalineEvent(second)?.occurredAt).toBe("2026-07-12T10:03:00.000Z");
    expect(getSecondsSinceLastAdrenaline(second, "2026-07-12T10:03:20.000Z")).toBe(20);
  });

  test("returns no adrenaline time and no due reminder without an adrenaline event", () => {
    const session = createArrestSession(START);
    expect(findLatestAdrenalineEvent(session)).toBeNull();
    expect(getSecondsSinceLastAdrenaline(session, "2026-07-12T10:10:00.000Z")).toBeNull();
    expect(isAdrenalineReminderDue(session, "2026-07-12T10:10:00.000Z")).toBe(false);
  });

  test.each([[239, false], [240, true], [241, true]])(
    "at %s seconds sets adrenaline reminder due to %s",
    (seconds, due) => {
      const session = addArrestEvent(createArrestSession(START), "adrenaline_given", START);
      expect(getAdrenalineReminderSeconds(session)).toBe(240);
      expect(isAdrenalineReminderDue(session, new Date(new Date(START).getTime() + seconds * 1000))).toBe(due);
    },
  );

  test("summarizes counts, duration, and latest outcome", () => {
    let session = createArrestSession(START);
    session = addArrestEvent(session, "shock_delivered", "2026-07-12T10:00:30.000Z");
    session = addArrestEvent(session, "shock_delivered", "2026-07-12T10:01:00.000Z");
    session = addArrestEvent(session, "adrenaline_given", "2026-07-12T10:01:30.000Z");
    session = addArrestEvent(session, "amiodarone_given", "2026-07-12T10:02:00.000Z");
    session = addArrestEvent(session, "airway_event", "2026-07-12T10:02:30.000Z");
    session = addArrestEvent(session, "rosc", "2026-07-12T10:03:00.000Z");
    session = addArrestEvent(session, "mors", "2026-07-12T10:03:30.000Z");
    const summary = summarizeArrestSession(endArrestSession(session, "2026-07-12T10:04:00.000Z"));
    expect(summary).toEqual({
      durationSeconds: 240,
      shockCount: 2,
      shockVfCount: 0,
      shockPvtCount: 0,
      adrenalineCount: 1,
      amiodaroneCount: 1,
      airwayCount: 1,
      hasRosc: true,
      hasMors: true,
      latestOutcome: "mors",
      totalRecordedEvents: 7,
    });
  });

  test("summarizes an empty session safely when endedAt is missing", () => {
    const session = { ...createArrestSession(START), events: [] };
    expect(summarizeArrestSession(session)).toEqual({
      durationSeconds: 0,
      shockCount: 0,
      shockVfCount: 0,
      shockPvtCount: 0,
      adrenalineCount: 0,
      amiodaroneCount: 0,
      airwayCount: 0,
      hasRosc: false,
      hasMors: false,
      latestOutcome: null,
      totalRecordedEvents: 0,
    });
  });

  test("default visible controls contain only the approved six actions", () => {
    const types = VISIBLE_EVENT_BUTTONS.map((button) => button.type);
    expect(types).toEqual(["shock_delivered", "adrenaline_given", "amiodarone_given", "rosc", "mors", "free_note"]);
  });

  test.each([
    [0, 120, false],
    [104, 16, false],
    [105, 15, true],
    [119, 1, true],
    [120, 120, false],
    [239, 1, true],
    [-5, 120, false],
    [NaN, 120, false],
  ])("at %s seconds has %s remaining and pre-charge=%s", (elapsed, remaining, active) => {
    expect(getCycleRemainingSeconds(elapsed, 120)).toBe(remaining);
    expect(isPrechargeCueActive(elapsed, 120)).toBe(active);
  });

  test.each(["VF", "pVT"] as const)("stores and formats a %s shock", (rhythm) => {
    const session = addShockEvent(createArrestSession(START), rhythm, "2026-07-12T10:01:00.000Z");
    const shock = session.events.at(-1)!;
    expect(shock.metadata).toEqual({ shockRhythm: rhythm });
    expect(formatArrestEventLabel(shock)).toBe(`Stød afgivet · ${rhythm}`);
    const summary = summarizeArrestSession(session);
    expect(summary.shockCount).toBe(1);
    expect(summary.shockVfCount).toBe(rhythm === "VF" ? 1 : 0);
    expect(summary.shockPvtCount).toBe(rhythm === "pVT" ? 1 : 0);
  });

  test("stores trimmed note text and ignores an empty note", () => {
    const session = createArrestSession(START);
    const unchanged = addNoteEvent(session, "   ", "2026-07-12T10:01:00.000Z");
    expect(unchanged).toBe(session);
    const updated = addNoteEvent(session, "  Teamledernote  ", "2026-07-12T10:01:00.000Z");
    expect(updated.events.at(-1)).toMatchObject({ type: "free_note", note: "Teamledernote" });
  });

  test.each(["rosc", "mors"] as const)("records %s and ends the session", (outcome) => {
    const ended = endArrestSessionWithOutcome(createArrestSession(START), outcome, "2026-07-12T10:04:00.000Z");
    expect(ended.status).toBe("ended");
    expect(ended.endedAt).toBe("2026-07-12T10:04:00.000Z");
    expect(summarizeArrestSession(ended).latestOutcome).toBe(outcome);
  });

  test("latest outcome follows chronological event order", () => {
    let session = addArrestEvent(createArrestSession(START), "mors", "2026-07-12T10:03:00.000Z");
    session = addArrestEvent(session, "rosc", "2026-07-12T10:04:00.000Z");
    expect(summarizeArrestSession(session).latestOutcome).toBe("rosc");
  });

  test("resumes an ended session while preserving events and clearing endedAt", () => {
    const ended = endArrestSession(createArrestSession(START), "2026-07-12T10:04:00.000Z");
    const resumed = resumeArrestSession(ended);
    expect(resumed.status).toBe("active");
    expect(resumed.endedAt).toBeUndefined();
    expect(resumed.events).toEqual(ended.events);
  });
});
