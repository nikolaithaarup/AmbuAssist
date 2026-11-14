import { readFileSync } from "fs";
import { join } from "path";

describe("Hjertestop focused workflow", () => {
  const landing = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/cardiac-resus/index.tsx"), "utf8");
  const session = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/cardiac-resus/session.tsx"), "utf8");
  const summary = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/cardiac-resus/summary.tsx"), "utf8");

  test("keeps the landing action-first with safety details available once", () => {
    expect(landing).toContain("Fortsæt aktiv session");
    expect(landing).toContain("Sikkerhed og begrænsninger");
    expect(landing).not.toContain("Teamlederens workflow");
  });

  test("prioritises the cycle timer and keeps the approved event actions accessible", () => {
    expect(session).toContain("fontSize: 54");
    expect(session).toContain("accessibilityLabel={`Registrér ${item.label}`}");
    expect(session).toContain("accessibilityState={{ expanded: showAllEvents }}");
    expect(session).not.toContain("Knapperne registrerer kun");
  });

  test("keeps a compact summary and correction-preserving event log", () => {
    expect(summary).toContain("rettelser bevares");
    expect(summary).toContain("summary.shockVfCount");
    expect(summary).toContain("getCorrectedArrestEventIds");
  });
});
