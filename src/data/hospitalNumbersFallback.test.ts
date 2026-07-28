import {
  HOSPITAL_MAIN_NUMBER_FALLBACK,
  HOSPITAL_PHONE_FALLBACK,
} from "./hospitalNumbersFallback";

test("bundled hospital fallback has unique, callable numbers", () => {
  expect(new Set(HOSPITAL_MAIN_NUMBER_FALLBACK.map(([code]) => code)).size).toBe(
    HOSPITAL_MAIN_NUMBER_FALLBACK.length,
  );
  for (const [, , phone] of HOSPITAL_MAIN_NUMBER_FALLBACK) {
    expect(phone).toMatch(/^\+45\d{8}$/);
  }
});

test("every bundled operational number is unique by id and callable", () => {
  expect(HOSPITAL_PHONE_FALLBACK.length).toBeGreaterThan(
    HOSPITAL_MAIN_NUMBER_FALLBACK.length,
  );
  expect(new Set(HOSPITAL_PHONE_FALLBACK.map((item) => item.id)).size).toBe(
    HOSPITAL_PHONE_FALLBACK.length,
  );
  for (const item of HOSPITAL_PHONE_FALLBACK) {
    expect(item.phone).toMatch(/^\+45\d{8}$/);
    expect(item.hospitalCode).toMatch(/^[A-Z]{2,3}$/);
    expect(item.specialtyKey).not.toBe("");
  }
});
