import { readFileSync } from "fs";
import { join } from "path";

describe("VGAS safety wording", () => {
  const presentation = readFileSync(join(__dirname, "BloodGasPresentation.tsx"), "utf8");
  const prelaunch = readFileSync(join(__dirname, "PrelaunchGate.tsx"), "utf8");
  const home = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/bloodgas/index.tsx"), "utf8");
  const infection = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/bloodgas/infection.tsx"), "utf8");
  const strings = readFileSync(join(__dirname, "../../i18n/strings.ts"), "utf8");

  test("keeps validation and venous pO2 limitations concise and accessible", () => {
    expect(prelaunch).toContain("ikke klinisk valideret");
    expect(presentation).toContain("Venøs pO₂ kan ikke fastslå arteriel iltning");
  });

  test("does not introduce an arterial/sample selector", () => {
    const patterns = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/bloodgas/patterns.tsx"), "utf8");
    expect(patterns).not.toMatch(/AGAS|arteriel|arterial|sample.?type/i);
  });

  test("states that CRP cannot determine treatment need", () => {
    expect(infection).toContain("CRP alene afgør ikke infektionstype eller behandling");
  });

  test("keeps the VGAS home compact and removes duplicate development/status panels", () => {
    expect(home).toContain("compact");
    expect(home).not.toContain("BloodGasProvenance");
    expect(home).not.toContain("Under udvikling");
    expect(prelaunch).not.toContain("Under udvikling");
  });

  test("avoids strong diagnostic abbreviations in Danish pattern output", () => {
    const danish = strings.slice(strings.indexOf("export const da"));
    expect(danish).not.toContain("Muligt DKA-mønster");
    expect(danish).not.toContain("Muligt HHS-mønster");
  });
});
