const mockStorage = new Map<string, string>();
let mockRemoveShouldFail = false;

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) => Promise.resolve(mockStorage.get(key) ?? null)),
    setItem: jest.fn((key: string, value: string) => {
      mockStorage.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      if (mockRemoveShouldFail) return Promise.reject(new Error("remove failed"));
      mockStorage.delete(key);
      return Promise.resolve();
    }),
  },
}));

import { addAdrenalineTimerResetEvent, addArrestEvent, addCycleTimerResetEvent, createArrestSession, endArrestSession } from "../domain/cardiac-resus/session";
import {
  clearActiveArrestSession,
  inspectActiveArrestSession,
  parseStoredArrestSession,
  saveActiveArrestSession,
  saveEndedArrestSession,
} from "./cardiacResusStorage";

const ACTIVE_KEY = "ambuassist.cardiac-resus.active.v1";
const LATEST_KEY = "ambuassist.cardiac-resus.latest.v1";

describe("CardiacResus storage", () => {
  beforeEach(() => {
    mockStorage.clear();
    mockRemoveShouldFail = false;
  });

  test("detects malformed active storage and allows it to be cleared", async () => {
    mockStorage.set(ACTIVE_KEY, "{bad json");
    await expect(inspectActiveArrestSession()).resolves.toEqual({ session: null, corrupted: true });
    await clearActiveArrestSession();
    await expect(inspectActiveArrestSession()).resolves.toEqual({ session: null, corrupted: false });
  });

  test("validates nested event timestamps", () => {
    const session = createArrestSession("2026-07-12T10:00:00.000Z");
    const invalid = { ...session, events: [{ ...session.events[0], occurredAt: "invalid" }] };
    expect(parseStoredArrestSession(JSON.stringify(invalid))).toBeNull();
  });

  test("safely converts an unknown legacy event to a note", () => {
    const session = createArrestSession("2026-07-12T10:00:00.000Z");
    const legacy = { ...session, events: [{ ...session.events[0], type: "legacy_unknown" }] };
    expect(parseStoredArrestSession(JSON.stringify(legacy))?.events[0]).toMatchObject({
      type: "free_note",
      note: "Ukendt tidligere hændelse: legacy_unknown",
    });
  });

  test("saves an ended summary and removes the active draft", async () => {
    const active = createArrestSession("2026-07-12T10:00:00.000Z");
    await saveActiveArrestSession(active);
    const result = await saveEndedArrestSession(endArrestSession(active, "2026-07-12T10:04:00.000Z"));
    expect(result).toEqual({ activeDraftRemoved: true });
    expect(mockStorage.has(ACTIVE_KEY)).toBe(false);
    expect(mockStorage.has(LATEST_KEY)).toBe(true);
  });

  test("reports partial success when latest saves but active deletion fails", async () => {
    const active = createArrestSession("2026-07-12T10:00:00.000Z");
    await saveActiveArrestSession(active);
    mockRemoveShouldFail = true;
    const result = await saveEndedArrestSession(endArrestSession(active, "2026-07-12T10:04:00.000Z"));
    expect(result).toEqual({ activeDraftRemoved: false });
    expect(mockStorage.has(LATEST_KEY)).toBe(true);
    expect(mockStorage.has(ACTIVE_KEY)).toBe(true);
  });

  test("accepts and preserves timer reset event types and cycle metadata", () => {
    let session = createArrestSession("2026-07-12T10:00:00.000Z");
    session = addArrestEvent(session, "adrenaline_given", "2026-07-12T10:01:00.000Z");
    session = addCycleTimerResetEvent(session, "2026-07-12T10:01:30.000Z");
    session = addAdrenalineTimerResetEvent(session, "2026-07-12T10:02:00.000Z");
    const parsed = parseStoredArrestSession(JSON.stringify(session));
    expect(parsed?.events.map((event) => event.type)).toEqual([
      "session_started", "adrenaline_given", "cycle_timer_reset", "adrenaline_timer_reset",
    ]);
    expect(parsed?.events[2].metadata).toEqual({ cycleNumberAtReset: 1 });
  });
});
