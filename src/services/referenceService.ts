import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  parseReferencePayload,
  type LangMap,
  type ReferenceDoc,
  type ReferencePayload,
  type ReferenceSource,
} from "./referenceSchema";

export type {
  Lang,
  LangMap,
  ReferenceDoc,
  ReferenceSource,
} from "./referenceSchema";

function emptyLangMap(): LangMap {
  return { en: "", da: "" };
}

function normalizeLangMap(value?: LangMap): LangMap {
  return {
    en: typeof value?.en === "string" ? value.en : "",
    da: typeof value?.da === "string" ? value.da : "",
  };
}

function normalizeReferenceSource(
  source: NonNullable<ReferencePayload["sources"]>[number],
  index: number,
): ReferenceSource {
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

function normalizeReference(raw: ReferencePayload, key: string): ReferenceDoc {
  return {
    key: raw.key ?? key,
    version: raw.version ?? 1,
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
    ...(raw.reviewDate ? { reviewDate: raw.reviewDate } : {}),
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

    const validated = parseReferencePayload(snap.data());
    if (!validated) {
      console.warn(`Invalid reference payload for "${key}" from Firestore.`);
      return null;
    }

    return normalizeReference(validated, key);
  } catch (error) {
    console.warn(`Failed to load reference "${key}" from Firestore:`, error);
    return null;
  }
}
