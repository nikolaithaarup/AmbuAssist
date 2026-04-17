import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export type SupportNumber = {
  id: string;
  nameDa: string;
  nameEn: string;
  phone: string;
  sortOrder?: number;
  active?: boolean;
};

export async function getSupportNumbers(): Promise<SupportNumber[]> {
  const snapshot = await getDocs(collection(db, "support_numbers"));

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<SupportNumber, "id">),
    }))
    .filter((item) => item.active === true)
    .sort((a, b) => {
      const orderDiff = (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
      if (orderDiff !== 0) return orderDiff;

      return a.nameDa.localeCompare(b.nameDa, "da");
    });
}
