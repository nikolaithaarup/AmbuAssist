const admin = require("firebase-admin");
const serviceAccount = require("../../secrets/firebase-service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

type LangMap = {
  en: string;
  da: string;
};

type SeedSource = {
  id: string;
  title: LangMap;
  subtitle: LangMap;
  url?: LangMap;
};

type SeedReferenceDoc = {
  key: string;
  version: number;
  disclaimer: LangMap;
  sourcesSub: LangMap;
  sources: SeedSource[];
  updatedAt?: string;
};

type DocLike = {
  id: string;
  data: () => unknown;
};

function asLangMap(value: unknown): LangMap {
  const v = (value ?? {}) as Partial<LangMap>;

  return {
    en: String(v.en ?? ""),
    da: String(v.da ?? ""),
  };
}

function normalizeSource(source: unknown, index: number): SeedSource {
  const s = (source ?? {}) as {
    id?: unknown;
    title?: unknown;
    subtitle?: unknown;
    url?: unknown;
  };

  const normalized: SeedSource = {
    id: String(s.id ?? index + 1),
    title: asLangMap(s.title),
    subtitle: asLangMap(s.subtitle),
  };

  const urlObj = s.url as Partial<LangMap> | undefined;
  const hasUrl =
    !!urlObj &&
    (typeof urlObj.en !== "undefined" || typeof urlObj.da !== "undefined");

  if (hasUrl) {
    normalized.url = asLangMap(urlObj);
  }

  return normalized;
}

function normalizeReferenceDoc(key: string, raw: unknown): SeedReferenceDoc {
  const r = (raw ?? {}) as {
    version?: unknown;
    disclaimer?: unknown;
    sourcesSub?: unknown;
    sources?: unknown;
    updatedAt?: unknown;
  };

  return {
    key,
    version:
      typeof r.version === "number" &&
      Number.isInteger(r.version) &&
      r.version > 0
        ? r.version
        : 1,
    disclaimer: asLangMap(r.disclaimer),
    sourcesSub: asLangMap(r.sourcesSub),
    sources: Array.isArray(r.sources)
      ? r.sources.map((source: unknown, index: number) =>
          normalizeSource(source, index),
        )
      : [],
    updatedAt:
      typeof r.updatedAt === "string" && r.updatedAt.trim()
        ? r.updatedAt
        : undefined,
  };
}

async function exportReferences() {
  const snapshot = await db.collection("references").get();

  const docs: SeedReferenceDoc[] = (snapshot.docs as DocLike[])
    .map((doc: DocLike) => normalizeReferenceDoc(doc.id, doc.data()))
    .sort((a: SeedReferenceDoc, b: SeedReferenceDoc) =>
      a.key.localeCompare(b.key),
    );

  const output =
    "const REFERENCE_SEED_DATA: SeedReferenceDoc[] = " +
    JSON.stringify(docs, null, 2) +
    ";\n";

  console.log(output);
}

exportReferences().catch((err: unknown) => {
  console.error("❌ Export failed:");
  console.error(err);
  process.exit(1);
});
