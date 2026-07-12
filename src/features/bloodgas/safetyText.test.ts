import { readFileSync } from "fs";
import { join } from "path";

describe("VGAS safety wording", () => {
  const presentation = readFileSync(join(__dirname, "BloodGasPresentation.tsx"), "utf8");
  const infection = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/bloodgas/infection.tsx"), "utf8");
  const strings = readFileSync(join(__dirname, "../../i18n/strings.ts"), "utf8");

  test("states VGAS-only use and venous pO2 limitation", () => {
    expect(presentation).toContain("Kun VGAS");
    expect(presentation).toContain("pO₂ på VGAS kan ikke bruges alene");
  });

  test("does not introduce an arterial/sample selector", () => {
    const patterns = readFileSync(join(__dirname, "../../../app/tools/assessment-tools/bloodgas/patterns.tsx"), "utf8");
    expect(patterns).not.toMatch(/AGAS|arteriel|arterial|sample.?type/i);
  });

  test("states that CRP cannot determine treatment need", () => {
    expect(infection).toContain("CRP alene kan ikke afgøre infektionstype eller behandlingsbehov");
  });

  test("avoids strong diagnostic abbreviations in Danish pattern output", () => {
    const danish = strings.slice(strings.indexOf("export const da"));
    expect(danish).not.toContain("Muligt DKA-mønster");
    expect(danish).not.toContain("Muligt HHS-mønster");
  });
});
