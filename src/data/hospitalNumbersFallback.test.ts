import { HOSPITAL_MAIN_NUMBER_FALLBACK } from "./hospitalNumbersFallback";

test("bundled hospital fallback has unique, callable numbers", () => {
  expect(new Set(HOSPITAL_MAIN_NUMBER_FALLBACK.map(([code]) => code)).size).toBe(
    HOSPITAL_MAIN_NUMBER_FALLBACK.length,
  );
  for (const [, , phone] of HOSPITAL_MAIN_NUMBER_FALLBACK) {
    expect(phone).toMatch(/^\+45\d{8}$/);
  }
});

