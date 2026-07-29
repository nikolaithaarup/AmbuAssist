import { BUNDLED_HOSPITAL_PHONE_NUMBERS } from "./hospitalPhoneData";

/** Complete offline operational fallback, shared with the Firestore seed. */
export const HOSPITAL_PHONE_FALLBACK = BUNDLED_HOSPITAL_PHONE_NUMBERS;

/** Kept for callers/tests that only need one switchboard number per hospital. */
export const HOSPITAL_MAIN_NUMBER_FALLBACK = HOSPITAL_PHONE_FALLBACK
  .filter((item) => item.specialtyKey === "main")
  .map((item) => [item.hospitalCode, item.hospitalName, item.phone] as const);
