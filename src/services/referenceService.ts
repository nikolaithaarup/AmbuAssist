import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export type Lang = "en" | "da";

export type LangMap = {
  en: string;
  da: string;
};

export type ReferenceSource = {
  id: string;
  title: LangMap;
  subtitle: LangMap;
  url?: LangMap;
};

export type ReferenceDoc = {
  key: string;
  version: number;
  updatedAt: string;
  disclaimer: LangMap;
  sourcesSub: LangMap;
  sources: ReferenceSource[];
};

function emptyLangMap(): LangMap {
  return { en: "", da: "" };
}

function normalizeLangMap(value: any): LangMap {
  return {
    en: typeof value?.en === "string" ? value.en : "",
    da: typeof value?.da === "string" ? value.da : "",
  };
}

function normalizeReferenceSource(source: any, index: number): ReferenceSource {
  const normalized: ReferenceSource = {
    id: typeof source?.id === "string" ? source.id : String(index + 1),
    title: normalizeLangMap(source?.title),
    subtitle: normalizeLangMap(source?.subtitle),
  };

  const urlMap = normalizeLangMap(source?.url);
  if (urlMap.en || urlMap.da) {
    normalized.url = urlMap;
  }

  return normalized;
}

function normalizeReference(raw: any, key: string): ReferenceDoc | null {
  if (!raw || typeof raw !== "object") return null;

  return {
    key: typeof raw.key === "string" ? raw.key : key,
    version: typeof raw.version === "number" ? raw.version : 1,
    updatedAt:
      typeof raw.updatedAt === "string"
        ? raw.updatedAt
        : new Date().toISOString(),
    disclaimer: raw?.disclaimer
      ? normalizeLangMap(raw.disclaimer)
      : emptyLangMap(),
    sourcesSub: raw?.sourcesSub
      ? normalizeLangMap(raw.sourcesSub)
      : emptyLangMap(),
    sources: Array.isArray(raw?.sources)
      ? raw.sources.map(normalizeReferenceSource)
      : [],
  };
}

export async function getReference(key: string): Promise<ReferenceDoc | null> {
  try {
    const ref = doc(db, "references", key);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return null;
    }

    return normalizeReference(snap.data(), key);
  } catch (error) {
    console.warn(`Failed to load reference "${key}" from Firestore:`, error);
    return null;
  }
}
