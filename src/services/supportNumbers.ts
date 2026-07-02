import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SUPPORT_NUMBERS_FALLBACK } from "../data/supportNumbersFallback";
import {
  parseSupportNumbersPayload,
  prepareSupportNumbers,
  resolveSupportNumbersUpdate,
  type SupportNumber,
} from "./supportNumbersSchema";

export type { SupportNumber } from "./supportNumbersSchema";

const CACHE_KEY = "ambuassist_support_numbers_v1";

const BUNDLED_SUPPORT_NUMBERS: SupportNumber[] = SUPPORT_NUMBERS_FALLBACK;

function safeParseCached(value: string | null): SupportNumber[] | null {
  if (!value) return null;

  try {
    return parseSupportNumbersPayload(JSON.parse(value));
  } catch {
    return null;
  }
}

export async function getSupportNumbers(): Promise<SupportNumber[]> {
  let cached: SupportNumber[] | null = null;

  try {
    cached = safeParseCached(await AsyncStorage.getItem(CACHE_KEY));
  } catch (error) {
    console.log("Could not load cached support numbers:", error);
  }

  try {
    const snapshot = await getDocs(collection(db, "support_numbers"));
    const remotePayload = snapshot.docs.map((supportDoc) => ({
      id: supportDoc.id,
      ...supportDoc.data(),
    }));
    const update = resolveSupportNumbersUpdate(
      remotePayload,
      cached,
      BUNDLED_SUPPORT_NUMBERS,
    );

    if (!update.dataToCache) {
      console.log("Could not use backend support numbers: validation failed");
      return update.data;
    }

    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(update.dataToCache));
    } catch (error) {
      console.log("Could not cache support numbers:", error);
    }

    return update.data;
  } catch (error) {
    console.log("Could not load backend support numbers:", error);
    return prepareSupportNumbers(cached ?? BUNDLED_SUPPORT_NUMBERS);
  }
}
