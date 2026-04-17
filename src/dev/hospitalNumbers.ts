import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

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
  };
}

export async function getHospitalPhoneNumbersByCode(
  hospitalCode: string,
): Promise<HospitalPhoneNumber[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("hospitalCode", "==", hospitalCode),
  );

  const snap = await getDocs(q);

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

  return rows;
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
