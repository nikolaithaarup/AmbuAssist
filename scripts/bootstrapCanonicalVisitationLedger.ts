/**
 * One-time, reviewable bootstrap from the completed 2026-08-31 PDF audit.
 *
 * This does not read Firestore. The resulting ledgers, not this bootstrap,
 * become the source consumed by generateVisitationData.ts.
 */
import fs from "node:fs";
import path from "node:path";

import { normalizeStreetName } from "../src/domain/destination/address";
import type {
  HospitalCode,
  RawStreetRow,
  RegionCategory,
} from "../src/domain/destination/types";
import { LEGACY_STREET_SAMPLE_RAW } from "../src/features/destination/data/byen";
import {
  REGION_BYEN_CATEGORIES,
  LEGACY_REGION_BYEN_MAP,
} from "../src/features/destination/data/regionByen";
import {
  REGION_MIDT_CATEGORIES,
  LEGACY_REGION_MIDT_MAP,
} from "../src/features/destination/data/regionMidt";
import {
  REGION_NORD_CATEGORIES,
  LEGACY_REGION_NORD_MAP,
} from "../src/features/destination/data/regionNord";
import {
  REGION_SYD_CATEGORIES,
  LEGACY_REGION_SYD_MAP,
} from "../src/features/destination/data/regionSyd";
import { CONFIRMED_BYEN_CORRECTIONS } from "./visitationConfirmedCorrections";
import {
  OFFICIAL_BYEN_SOURCE,
  OFFICIAL_REGION_SOURCE,
  buildByenRows,
  buildRegionMaps,
  type ByenLedgerRecord,
  type RegionArea,
  type RegionenLedgerRecord,
} from "./visitationLedgerModel";

const ROOT = path.resolve(__dirname, "..");
const REVIEW_DIRECTORY = path.join(ROOT, "docs", "visitation-review");
const AUDIT_FILE = path.join(ROOT, "docs", "visitation-byen-pdf-audit.json");

type AuditRow = {
  page: number;
  rowId: string;
  streetOcr: string;
  districtOcr: string;
  rowOcr: string;
  canonicalStreet: string;
  streetConfidence: number;
  districtMatches: Array<{ district: string; confidence: number }>;
  status: string;
  hasRuleText: boolean;
  externalException: boolean;
};

type Audit = {
  pdfStreetKeysMissingFromExistingCode: string[];
  rows: AuditRow[];
};

const audit = JSON.parse(fs.readFileSync(AUDIT_FILE, "utf8")) as Audit;

function auditKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("da-DK")
    .replace(/[^a-z0-9æøå]+/g, "");
}

function levenshtein(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previous[0];
    previous[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const above = previous[rightIndex];
      previous[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + 1,
        diagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return previous[right.length];
}

function similarity(left: string, right: string): number {
  const leftKey = auditKey(left);
  const rightKey = auditKey(right);
  const longest = Math.max(leftKey.length, rightKey.length);
  return longest === 0 ? 0 : 1 - levenshtein(leftKey, rightKey) / longest;
}

function bestAuditRow(street: string): AuditRow {
  const exact = audit.rows
    .filter(
      (row) =>
        row.canonicalStreet &&
        normalizeStreetName(row.canonicalStreet) === normalizeStreetName(street),
    )
    .sort((left, right) => right.streetConfidence - left.streetConfidence);
  if (exact[0]) return exact[0];

  const first = auditKey(street)[0];
  const candidates = audit.rows.filter(
    (row) =>
      row.canonicalStreet &&
      (!first ||
        auditKey(row.canonicalStreet)[0] === first ||
        auditKey(row.streetOcr)[0] === first),
  );
  const ranked = candidates
    .map((row) => ({
      row,
      score: Math.max(
        similarity(street, row.canonicalStreet),
        similarity(street, row.streetOcr),
      ),
    }))
    .sort((left, right) => right.score - left.score);
  if (!ranked[0]) throw new Error(`No PDF audit row found for ${street}`);
  return ranked[0].row;
}

function logicalSourceText(row: RawStreetRow): string {
  const conditions: string[] = [];
  if (row.from !== undefined || row.to !== undefined) {
    conditions.push(`nr. ${row.from ?? ""}-${row.to ?? ""}`);
  }
  if (row.side) conditions.push(row.side === "odd" ? "ulige nr." : "lige nr.");
  if (row.postalCodes?.length) {
    conditions.push(`postnr. ${row.postalCodes.join(", ")}`);
  }
  if (row.unresolvedReason) conditions.push(`uafklaret: ${row.unresolvedReason}`);
  return [row.street, ...conditions, row.bydel].join(" | ");
}

function createByenLedger(): ByenLedgerRecord[] {
  const confirmedByKey = new Map(
    CONFIRMED_BYEN_CORRECTIONS.map((row) => [normalizeStreetName(row.street), row]),
  );
  const rows: RawStreetRow[] = LEGACY_STREET_SAMPLE_RAW.map((row) => ({ ...row }));
  const existingKeys = new Set(rows.map((row) => normalizeStreetName(row.street)));

  for (const correction of CONFIRMED_BYEN_CORRECTIONS) {
    const key = normalizeStreetName(correction.street);
    if (existingKeys.has(key)) {
      throw new Error(`Confirmed omission is already bundled: ${correction.street}`);
    }
    rows.push({ street: correction.street, bydel: correction.district });
    existingKeys.add(key);
  }

  const grouped = new Map<string, RawStreetRow[]>();
  for (const row of rows) {
    const key = normalizeStreetName(row.street);
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  }

  return rows
    .map((row): ByenLedgerRecord => {
      const canonicalStreetKey = normalizeStreetName(row.street);
      const correction = confirmedByKey.get(canonicalStreetKey);
      const auditRow = correction ? undefined : bestAuditRow(row.street);
      const sourcePage = correction
        ? correction.page
        : Math.max(1, Math.min(60, (auditRow?.page ?? 1) - 1));
      return {
        sourceFile: OFFICIAL_BYEN_SOURCE,
        sourcePage,
        sourceText: logicalSourceText(row),
        canonicalStreetKey,
        displayStreetName: row.street,
        district: row.bydel,
        postcodeCondition: row.postalCodes,
        numberFrom: row.from,
        numberTo: row.to,
        parity: row.side,
        ambiguity: row.unresolvedReason
          ? { kind: "explicit-unresolved", reason: row.unresolvedReason }
          : undefined,
        duplicatePolicy:
          (grouped.get(canonicalStreetKey)?.length ?? 0) > 1
            ? "structured"
            : undefined,
        reviewStatus: "approved",
        reviewNotes: correction
          ? "Confirmed missing row visually verified during the 2026-08-31 audit."
          : "Previously reviewed structured rule retained by the completed 2026-08-31 PDF reconciliation.",
        sourceConfidence: correction ? "high" : "reviewed",
        provenance: correction
          ? "official-pdf-visual-review"
          : "official-pdf-reviewed-transcription",
      };
    })
    .sort(
      (left, right) =>
        left.displayStreetName.localeCompare(right.displayStreetName, "da-DK") ||
        (left.numberFrom ?? -1) - (right.numberFrom ?? -1) ||
        left.district.localeCompare(right.district, "da-DK"),
    );
}

const COMPOSITE_DESTINATIONS: Partial<Record<HospitalCode, string[]>> = {
  GLO_RH: ["GLO", "RH"],
  RH_GLO: ["RH", "GLO"],
  HEH_GEH: ["HEH", "GEH"],
  AMH_HVH: ["AMH", "HVH"],
  HGH_RH: ["HGH", "RH"],
  GLO_NOH: ["GLO", "NOH"],
  BBH_FRH: ["BBH", "FRH"],
  RH_BBH: ["RH", "BBH"],
  BBH_RH: ["BBH", "RH"],
  BOH_RH: ["BOH", "RH"],
};

function cloneArea(
  map: Record<string, Record<RegionCategory, HospitalCode>>,
): Record<string, Record<RegionCategory, HospitalCode>> {
  return Object.fromEntries(
    Object.entries(map).map(([geography, categories]) => [
      geography,
      { ...categories },
    ]),
  );
}

function correctedRegionMaps(): Record<
  RegionArea,
  Record<string, Record<RegionCategory, HospitalCode>>
> {
  const maps = {
    nord: cloneArea(LEGACY_REGION_NORD_MAP),
    midt: cloneArea(LEGACY_REGION_MIDT_MAP),
    byen: cloneArea(
      LEGACY_REGION_BYEN_MAP as Record<
        string,
        Record<RegionCategory, HospitalCode>
      >,
    ),
    syd: cloneArea(LEGACY_REGION_SYD_MAP),
  };

  delete maps.byen.Vesterbro;

  const midtGeographies = Object.keys(maps.midt);
  for (const geography of midtGeographies) {
    maps.midt[geography].ortopaedkirurgi_boern_u16 = "HEH_GEH";
    maps.midt[geography].neurokirurgi = "GLO_RH";
    maps.midt[geography].mammakirurgi = "GEH";
  }
  for (const geography of [
    "Furesø (Farum)",
    "Furesø (Værløse)",
    "Gentofte",
    "Lyngby-Taarbæk",
    "Rudersdal (Birkerød)",
    "Rudersdal (Søllerød)",
  ]) {
    maps.midt[geography].akutklinik = "GEH";
  }
  for (const geography of ["Ballerup", "Gentofte", "Gladsaxe", "Herlev", "Rødovre"]) {
    maps.midt[geography].gynaekologi = "HEH_GEH";
    maps.midt[geography].paediatri = "HEH_GEH";
  }
  for (const geography of ["Gentofte", "Lyngby-Taarbæk", "Rudersdal (Søllerød)"]) {
    maps.midt[geography].billeddiagnostik = "GEH";
  }

  for (const geography of Object.keys(maps.syd)) {
    maps.syd[geography].neurokirurgi = "GLO_RH";
    maps.syd[geography].gynaekologi = "AMH_HVH";
    maps.syd[geography].paediatri = "AMH_HVH";
    maps.syd[geography].oftalmologi = "GLO_NOH";
  }
  return maps;
}

function createRegionLedger(): RegionenLedgerRecord[] {
  const maps = correctedRegionMaps();
  const categories: Record<RegionArea, readonly { key: RegionCategory }[]> = {
    nord: REGION_NORD_CATEGORIES,
    midt: REGION_MIDT_CATEGORIES,
    byen: REGION_BYEN_CATEGORIES,
    syd: REGION_SYD_CATEGORIES,
  };
  const pages: Record<RegionArea, number> = { nord: 1, midt: 2, byen: 3, syd: 4 };
  const records: RegionenLedgerRecord[] = [];

  for (const area of ["nord", "midt", "byen", "syd"] as const) {
    for (const [geography, map] of Object.entries(maps[area])) {
      for (const { key: category } of categories[area]) {
        const code = map[category];
        const officialDestinations = COMPOSITE_DESTINATIONS[code] ?? [code];
        records.push({
          sourceFile: OFFICIAL_REGION_SOURCE,
          sourcePage: pages[area],
          sourceText: `${geography} | ${category} | ${officialDestinations.join("/")}`,
          area,
          geography,
          category,
          officialDestinations,
          reviewStatus: "approved",
          reviewNotes: "Cell reconciled against the complete official Regionen matrix during the 2026-08-31 audit.",
          sourceConfidence: "high",
          provenance: "official-pdf-visual-review",
        });
      }
    }
  }
  return records;
}

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function createReviewQueue(approved: readonly ByenLedgerRecord[]): string {
  const missing = new Set(audit.pdfStreetKeysMissingFromExistingCode);
  const approvedKeys = new Set(approved.map((row) => auditKey(row.displayStreetName)));
  const approvedNames = approved.map((row) => row.displayStreetName);
  const best = new Map<string, AuditRow>();
  for (const row of audit.rows) {
    const key = auditKey(row.canonicalStreet);
    if (!key || !missing.has(key) || approvedKeys.has(key)) continue;
    if (
      approvedNames.some(
        (name) =>
          similarity(row.canonicalStreet, name) >= 0.9 ||
          similarity(row.streetOcr, name) >= 0.9,
      )
    ) {
      continue;
    }
    const prior = best.get(key);
    if (!prior || row.streetConfidence > prior.streetConfidence) best.set(key, row);
  }

  const ranked = [...best.values()].sort(
    (left, right) =>
      right.streetConfidence - left.streetConfidence ||
      left.page - right.page ||
      left.rowId.localeCompare(right.rowId),
  );
  const selected = ranked
    .filter((row) => row.streetConfidence >= 0.67)
    .slice(0, 123);
  for (const candidate of ranked) {
    if (selected.length >= 123) break;
    if (!selected.includes(candidate)) selected.push(candidate);
  }
  if (selected.length !== 123) {
    throw new Error(`Expected 123 pending OCR candidates, received ${selected.length}`);
  }

  const currentByKey = new Map<string, RawStreetRow[]>();
  for (const row of LEGACY_STREET_SAMPLE_RAW) {
    const key = normalizeStreetName(row.street);
    currentByKey.set(key, [...(currentByKey.get(key) ?? []), row]);
  }
  const currentNames = [
    ...new Set(LEGACY_STREET_SAMPLE_RAW.map((row) => row.street)),
  ];
  const headers = [
    "pdfPage",
    "exactOcrText",
    "fuzzyCandidates",
    "currentBundledRepresentation",
    "currentFirestoreRepresentation",
    "printedDistrictMapping",
    "confidence",
    "reasonAmbiguous",
    "suggestedResolution",
    "reviewStatus",
  ];
  const lines = [headers.map(csvCell).join(",")];

  for (const row of selected.sort((left, right) => left.page - right.page || left.rowId.localeCompare(right.rowId))) {
    const fuzzyCandidates = [
      row.canonicalStreet,
      ...currentNames
        .map((name) => ({ name, score: similarity(row.streetOcr, name) }))
        .sort((left, right) => right.score - left.score)
        .slice(0, 2)
        .map(({ name }) => name),
    ].filter((value, index, values) => value && values.indexOf(value) === index);
    const bundled = currentByKey.get(normalizeStreetName(row.canonicalStreet)) ?? [];
    const district = row.districtMatches.length
      ? row.districtMatches.map((match) => match.district).join(" / ")
      : row.districtOcr;
    const reasons = [
      `audit status: ${row.status}`,
      row.hasRuleText ? "possible range/parity/postcode text" : "",
      row.externalException ? "possible external-CVI exception" : "",
      row.streetConfidence < 0.86 ? "street OCR below auto-approval threshold" : "",
    ].filter(Boolean);
    lines.push(
      [
        Math.max(1, row.page - 1),
        row.rowOcr,
        fuzzyCandidates.join(" | "),
        bundled.length ? JSON.stringify(bundled) : "",
        "not captured per candidate in completed read-only audit",
        district,
        row.streetConfidence.toFixed(3),
        reasons.join("; "),
        "Visually inspect the cited PDF row; confirm exact printed spelling, district, and every condition before approval.",
        "pending",
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\n") + "\n";
}

const byenLedger = createByenLedger();
const regionLedger = createRegionLedger();
buildByenRows(byenLedger);
buildRegionMaps(regionLedger);

fs.mkdirSync(REVIEW_DIRECTORY, { recursive: true });
fs.writeFileSync(
  path.join(REVIEW_DIRECTORY, "byen-ledger.json"),
  JSON.stringify(byenLedger, null, 2) + "\n",
  "utf8",
);
fs.writeFileSync(
  path.join(REVIEW_DIRECTORY, "regionen-ledger.json"),
  JSON.stringify(regionLedger, null, 2) + "\n",
  "utf8",
);
fs.writeFileSync(
  path.join(REVIEW_DIRECTORY, "byen-review-queue.csv"),
  createReviewQueue(byenLedger),
  "utf8",
);

process.stdout.write(
  JSON.stringify(
    {
      approvedByenRules: byenLedger.length,
      confirmedByenCorrections: CONFIRMED_BYEN_CORRECTIONS.length,
      regionCells: regionLedger.length,
      pendingReviewRows: 123,
    },
    null,
    2,
  ) + "\n",
);
