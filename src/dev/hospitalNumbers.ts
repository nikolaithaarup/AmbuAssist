import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { HOSPITAL_PHONE_FALLBACK } from "../data/hospitalNumbersFallback";

export type HospitalPhoneNumber = {
  id: string;
  active: boolean;
  hospitalCode: string;
  hospitalName: string;
  specialtyKey: string;
  displayNameDa: string;
  displayNameEn: string;
  phone: string;
  updatedAt?: string;
  source: "firestore" | "bundled";
};

const COLLECTION_NAME = "hospital_numbers";

function mapDocToHospitalPhoneNumber(docSnap: any): HospitalPhoneNumber {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    active: Boolean(data.active),
    hospitalCode: String(data.hospitalCode ?? ""),
    hospitalName: String(data.hospitalName ?? ""),
    specialtyKey: String(data.specialtyKey ?? "main"),
    displayNameDa: String(data.displayNameDa ?? ""),
    displayNameEn: String(data.displayNameEn ?? ""),
    phone: String(data.phone ?? ""),
    updatedAt: data.updatedAt
      ? String(
          typeof data.updatedAt?.toDate === "function"
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
        )
      : undefined,
    source: "firestore",
  };
}

export async function getHospitalPhoneNumbersByCode(
  hospitalCode: string,
): Promise<HospitalPhoneNumber[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("hospitalCode", "==", hospitalCode),
  );

  try {
    const snap = await Promise.race([
      getDocs(q),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("HOSPITAL_PHONE_TIMEOUT")), 5_000),
      ),
    ]);

    const rows = snap.docs
      .map(mapDocToHospitalPhoneNumber)
      .filter((item) => item.active && !!item.phone);

    rows.sort((a, b) => {
      if (a.specialtyKey === "main" && b.specialtyKey !== "main") return 1;
      if (b.specialtyKey === "main" && a.specialtyKey !== "main") return -1;

      const aName = a.displayNameDa || a.displayNameEn || a.specialtyKey;
      const bName = b.displayNameDa || b.displayNameEn || b.specialtyKey;

      return aName.localeCompare(bName, "da");
    });

    if (rows.length > 0) return rows;
  } catch (error) {
    if (__DEV__) console.warn("Using bundled hospital number fallback", error);
  }

  return HOSPITAL_PHONE_FALLBACK
    .filter((item) => item.hospitalCode === hospitalCode)
    .map((item) => ({
      ...item,
      active: true,
      source: "bundled" as const,
      displayNameDa: `${item.displayNameDa} (offline)`,
      displayNameEn: `${item.displayNameEn} (offline)`,
    }))
    .sort((a, b) => {
      if (a.specialtyKey === "main" && b.specialtyKey !== "main") return 1;
      if (b.specialtyKey === "main" && a.specialtyKey !== "main") return -1;
      return a.displayNameDa.localeCompare(b.displayNameDa, "da");
    });
}

export async function getHospitalPhoneNumber(
  hospitalCode: string,
  specialtyKey: string,
): Promise<HospitalPhoneNumber | null> {
  const all = await getHospitalPhoneNumbersByCode(hospitalCode);

  const exact = all.find((item) => item.specialtyKey === specialtyKey);
  if (exact) return exact;

  const main = all.find((item) => item.specialtyKey === "main");
  if (main) return main;

  return all[0] ?? null;
}
