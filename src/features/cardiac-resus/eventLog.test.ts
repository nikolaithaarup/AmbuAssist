import { readFileSync } from "fs";
import { join } from "path";
import { formatArrestClock, formatArrestMinuteOffset, VISIBLE_EVENT_BUTTONS } from "./presentation";

describe("Hjertestop readable event log", () => {
  const live = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/cardiac-resus/session.tsx"), "utf8");
  const summary = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/cardiac-resus/summary.tsx"), "utf8");

  test("shows clock time without date or seconds and +N whole minutes", () => {
    expect(formatArrestClock("2026-07-12T10:02:47.000Z")).toMatch(/^\d{2}:\d{2}$/);
    expect(formatArrestClock("invalid")).toBe("--:--");
    expect(formatArrestMinuteOffset(0)).toBe("+0 min");
    expect(formatArrestMinuteOffset(121)).toBe("+2 min");
    expect(formatArrestMinuteOffset(3599)).toBe("+59 min");
    expect(formatArrestMinuteOffset(Number.NaN)).toBe("+0 min");
    expect(live).toContain("formatArrestClock(event.occurredAt)");
    expect(live).toContain("formatArrestMinuteOffset(event.elapsedSeconds)");
    expect(summary).toContain("formatArrestClock(event.occurredAt)");
    expect(summary).toContain("formatArrestMinuteOffset(event.elapsedSeconds)");
    expect(summary).not.toContain("dateStyle");
  });

  test("uses distinct solid colour meanings for shocks, medication, ROSC, MORS and exit", () => {
    const names = Object.fromEntries(VISIBLE_EVENT_BUTTONS.map((b) => [b.type, b.category]));
    expect(names).toMatchObject({
      shock_delivered: "shock",
      adrenaline_given: "medication",
      amiodarone_given: "medication",
      rosc: "outcome-success",
      mors: "outcome-danger",
    });
    expect(live).toContain('"#F4C542"');
    expect(live).toContain('"#2679D3"');
    expect(live).toContain('"#26B46E"');
    expect(live).toContain('"#D9434D"');
    expect(live).toContain("adjustManualArrestEventMinute");
    expect(live).toContain("cardiac-minute-ruler");
  });
});
