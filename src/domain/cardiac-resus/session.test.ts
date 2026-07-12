import {
  addArrestEvent,
  createArrestSession,
  endArrestSession,
  findLatestAdrenalineEvent,
  getAdrenalineReminderSeconds,
  getCurrentCycleProgress,
  getCycleNumber,
  getElapsedSeconds,
  getSecondsSinceLastAdrenaline,
  isAdrenalineReminderDue,
  summarizeArrestSession,
} from "./session";
import { VISIBLE_EVENT_BUTTONS } from "../../features/cardiac-resus/presentation";

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
      adrenalineCount: 0,
      amiodaroneCount: 0,
      airwayCount: 0,
      hasRosc: false,
      hasMors: false,
      latestOutcome: null,
      totalRecordedEvents: 0,
    });
  });

  test("default visible controls exclude legacy low-value events and include MORS", () => {
    const types = VISIBLE_EVENT_BUTTONS.map((button) => button.type);
    expect(types).not.toEqual(expect.arrayContaining(["rhythm_check", "cpr_cycle_marker", "physician_instruction"]));
    expect(types).toContain("mors");
  });
});
