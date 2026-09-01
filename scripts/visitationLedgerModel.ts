import { normalizeStreetName } from "../src/domain/destination/address";
import type {
  HospitalCode,
  RawStreetRow,
  RegionCategory,
} from "../src/domain/destination/types";

export const OFFICIAL_BYEN_SOURCE = "docs/visitation-source/VisitationByen.pdf";
export const OFFICIAL_REGION_SOURCE =
  "docs/visitation-source/VisitationRegionen.pdf";

export type ReviewStatus = "approved" | "pending";
export type SourceConfidence = "high" | "reviewed" | "ocr-candidate";

export type ByenAliasReason =
  | "punctuation-spacing variant"
  | "historical OCR transcription"
  | "Danish-character transcription"
  | "legacy spelling compatibility";

export type ByenAliasRecord = {
  alias: string;
  canonicalStreetKey: string;
  reason: ByenAliasReason;
  provenance: "reviewed-historical-ledger-compatibility";
  reviewStatus: "approved";
  reviewNotes: string;
};

export type ByenLedgerRecord = {
  sourceFile: typeof OFFICIAL_BYEN_SOURCE;
  sourcePage: number;
  sourceText: string;
  canonicalStreetKey: string;
  displayStreetName: string;
  district: string;
  postcodeCondition?: string[];
  numberFrom?: number;
  numberTo?: number;
  parity?: "odd" | "even";
  ambiguity?: {
    kind: "explicit-unresolved";
    reason: string;
  };
  duplicatePolicy?: "structured";
  reviewStatus: ReviewStatus;
  reviewNotes: string;
  sourceConfidence: SourceConfidence;
  provenance: "official-pdf-reviewed-transcription" | "official-pdf-visual-review";
};

export type RegionArea = "nord" | "midt" | "byen" | "syd";

export type RegionenLedgerRecord = {
  sourceFile: typeof OFFICIAL_REGION_SOURCE;
  sourcePage: number;
  sourceText: string;
  area: RegionArea;
  geography: string;
  category: RegionCategory;
  officialDestinations: string[];
  reviewStatus: ReviewStatus;
  reviewNotes: string;
  sourceConfidence: SourceConfidence;
  provenance: "official-pdf-visual-review";
};

export type GeneratedRegionMaps = Record<
  RegionArea,
  Record<string, Record<RegionCategory, HospitalCode>>
>;

const HOSPITAL_CODES = new Set<HospitalCode>([
  "AMH",
  "BBH",
  "BOH",
  "FRH",
  "GEH",
  "GLO",
  "HEH",
  "HVH",
  "NOH",
  "NOH_F",
  "RH",
  "UNKNOWN",
  "GLO_RH",
  "RH_GLO",
  "HEH_GEH",
  "AMH_HVH",
  "HGH_RH",
  "GLO_NOH",
  "BBH_FRH",
  "RH_BBH",
  "BBH_RH",
  "BOH_RH",
]);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function byenSignature(record: ByenLedgerRecord): string {
  return JSON.stringify([
    record.canonicalStreetKey,
    record.district,
    record.numberFrom,
    record.numberTo,
    record.parity,
    record.postcodeCondition?.slice().sort(),
    record.ambiguity?.reason,
  ]);
}

function hasStructuredCondition(record: ByenLedgerRecord): boolean {
  return (
    record.numberFrom !== undefined ||
    record.numberTo !== undefined ||
    record.parity !== undefined ||
    Boolean(record.postcodeCondition?.length) ||
    record.ambiguity?.kind === "explicit-unresolved"
  );
}

export function buildByenRows(records: readonly ByenLedgerRecord[]): RawStreetRow[] {
  const groups = new Map<string, ByenLedgerRecord[]>();
  const signatures = new Set<string>();

  for (const [index, record] of records.entries()) {
    const label = `Byen ledger record ${index + 1}`;
    assert(record.reviewStatus === "approved", `${label} is not approved`);
    assert(record.sourceFile === OFFICIAL_BYEN_SOURCE, `${label} has an invalid source file`);
    assert(Number.isInteger(record.sourcePage) && record.sourcePage >= 1, `${label} has an invalid source page`);
    assert(record.sourceText.trim(), `${label} is missing source text`);
    assert(record.displayStreetName.trim(), `${label} is missing its display street name`);
    assert(record.district.trim(), `${label} is missing its district`);
    assert(record.reviewNotes.trim(), `${label} is missing review notes`);
    assert(
      record.canonicalStreetKey === normalizeStreetName(record.displayStreetName),
      `${label} canonical key does not match the app normalizer`,
    );
    assert(
      record.numberFrom === undefined || (Number.isInteger(record.numberFrom) && record.numberFrom > 0),
      `${label} has an invalid numberFrom`,
    );
    assert(
      record.numberTo === undefined || (Number.isInteger(record.numberTo) && record.numberTo > 0),
      `${label} has an invalid numberTo`,
    );
    assert(
      record.numberFrom === undefined || record.numberTo === undefined || record.numberFrom <= record.numberTo,
      `${label} has an inverted number range`,
    );
    for (const postcode of record.postcodeCondition ?? []) {
      assert(/^\d{4}$/.test(postcode), `${label} has an invalid postcode`);
    }

    const signature = byenSignature(record);
    assert(!signatures.has(signature), `${label} duplicates an existing rule exactly`);
    signatures.add(signature);
    groups.set(record.canonicalStreetKey, [
      ...(groups.get(record.canonicalStreetKey) ?? []),
      record,
    ]);
  }

  for (const [key, group] of groups) {
    if (group.length === 1) continue;
    assert(
      group.every((record) => record.duplicatePolicy === "structured") &&
        group.some(hasStructuredCondition),
      `Duplicate canonical street key ${JSON.stringify(key)} is not explicitly structured`,
    );
  }

  return records.map((record) => ({
    street: record.displayStreetName,
    bydel: record.district,
    from: record.numberFrom,
    to: record.numberTo,
    side: record.parity,
    postalCodes: record.postcodeCondition,
    unresolvedReason: record.ambiguity?.reason,
  }));
}

const BYEN_ALIAS_REASONS = new Set<ByenAliasReason>([
  "punctuation-spacing variant",
  "historical OCR transcription",
  "Danish-character transcription",
  "legacy spelling compatibility",
]);

export function buildByenAliasMap(
  records: readonly ByenLedgerRecord[],
  aliases: readonly ByenAliasRecord[],
): Record<string, string> {
  buildByenRows(records);

  const officialGroups = new Map<string, ByenLedgerRecord[]>();
  for (const record of records) {
    officialGroups.set(record.canonicalStreetKey, [
      ...(officialGroups.get(record.canonicalStreetKey) ?? []),
      record,
    ]);
  }

  const aliasMap: Record<string, string> = {};
  for (const [index, alias] of aliases.entries()) {
    const label = `Byen alias record ${index + 1}`;
    assert(alias.reviewStatus === "approved", `${label} is not approved`);
    assert(alias.alias.trim(), `${label} is missing its alias`);
    assert(alias.canonicalStreetKey.trim(), `${label} is missing its canonical target`);
    assert(BYEN_ALIAS_REASONS.has(alias.reason), `${label} has an invalid reason`);
    assert(
      alias.provenance === "reviewed-historical-ledger-compatibility",
      `${label} has invalid provenance`,
    );
    assert(alias.reviewNotes.trim(), `${label} is missing review notes`);

    const aliasKey = normalizeStreetName(alias.alias);
    assert(aliasKey, `${label} has an empty normalized alias`);
    const targets = officialGroups.get(alias.canonicalStreetKey) ?? [];
    assert(targets.length > 0, `${label} target is missing`);
    assert(
      targets.length === 1,
      `${label} target is ambiguous or structurally incompatible`,
    );
    assert(
      !officialGroups.has(aliasKey),
      `${label} collides with an official canonical key`,
    );
    assert(
      aliasMap[aliasKey] === undefined,
      aliasMap[aliasKey] && aliasMap[aliasKey] !== alias.canonicalStreetKey
        ? `${label} duplicates an alias with a conflicting target`
        : `${label} duplicates an existing alias`,
    );
    aliasMap[aliasKey] = alias.canonicalStreetKey;
  }

  return Object.fromEntries(
    Object.entries(aliasMap).sort(([left], [right]) =>
      left.localeCompare(right, "da"),
    ),
  );
}

function destinationsToHospitalCode(destinations: readonly string[]): HospitalCode {
  const code = destinations.join("_") as HospitalCode;
  assert(
    HOSPITAL_CODES.has(code),
    `Unsupported official destination sequence ${JSON.stringify(destinations)}`,
  );
  return code;
}

export function buildRegionMaps(
  records: readonly RegionenLedgerRecord[],
  options: { requireCompleteMatrix?: boolean } = {},
): GeneratedRegionMaps {
  const maps: GeneratedRegionMaps = { nord: {}, midt: {}, byen: {}, syd: {} };
  const signatures = new Set<string>();

  for (const [index, record] of records.entries()) {
    const label = `Regionen ledger record ${index + 1}`;
    assert(record.reviewStatus === "approved", `${label} is not approved`);
    assert(record.sourceFile === OFFICIAL_REGION_SOURCE, `${label} has an invalid source file`);
    assert(record.sourcePage === { nord: 1, midt: 2, byen: 3, syd: 4 }[record.area], `${label} has an invalid source page for ${record.area}`);
    assert(record.sourceText.trim(), `${label} is missing source text`);
    assert(record.geography.trim(), `${label} is missing geography`);
    assert(record.reviewNotes.trim(), `${label} is missing review notes`);
    assert(record.officialDestinations.length > 0, `${label} has no destination`);

    const signature = `${record.area}\u0000${record.geography}\u0000${record.category}`;
    assert(!signatures.has(signature), `${label} duplicates ${record.geography}/${record.category}`);
    signatures.add(signature);

    const geography = (maps[record.area][record.geography] ??= {} as Record<
      RegionCategory,
      HospitalCode
    >);
    geography[record.category] = destinationsToHospitalCode(record.officialDestinations);
  }

  if (options.requireCompleteMatrix !== false) {
    assert(records.length === 1_599, `Expected 1,599 Regionen cells, received ${records.length}`);
    const geographies = Object.values(maps).reduce(
      (count, area) => count + Object.keys(area).length,
      0,
    );
    assert(geographies === 41, `Expected 41 Regionen geographies, received ${geographies}`);
    for (const area of Object.values(maps)) {
      for (const [geography, categories] of Object.entries(area)) {
        assert(
          Object.keys(categories).length === 39,
          `${geography} has ${Object.keys(categories).length} categories instead of 39`,
        );
      }
    }
  }

  return maps;
}
