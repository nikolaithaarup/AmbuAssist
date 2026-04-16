import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export type HospitalPhoneNumber = {
  hospitalCode: string;
  hospitalName: string;
  specialtyKey: string;
  displayNameDa: string;
  displayNameEn?: string;
  phone: string;
  fallbackPhone?: string;
  active: boolean;
  updatedAt?: string;
};

async function getHospitalPhoneDoc(
  id: string,
): Promise<HospitalPhoneNumber | null> {
  try {
    const ref = doc(db, "hospital_numbers", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return snap.data() as HospitalPhoneNumber;
  } catch (error) {
    console.error("Failed to fetch hospital phone number:", error);
    return null;
  }
}

export async function getHospitalPhoneNumber(
  hospitalCode: string,
  specialtyKey: string,
): Promise<HospitalPhoneNumber | null> {
  const exactId = `${hospitalCode}_${specialtyKey}`;
  const fallbackId = `${hospitalCode}_main`;

  const exact = await getHospitalPhoneDoc(exactId);
  if (exact) return exact;

  const fallback = await getHospitalPhoneDoc(fallbackId);
  return fallback;
}
