import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const QUEUE_FILE = path.join(
  ROOT,
  "docs",
  "visitation-review",
  "byen-review-queue.csv",
);
const AUDIT_FILE = path.join(ROOT, "docs", "visitation-byen-pdf-audit.json");
const OUTPUT_FILE = path.join(
  ROOT,
  "docs",
  "visitation-review",
  "reviewer-data",
  "review-items.json",
);

type AuditRow = {
  page: number;
  rowId: string;
  streetOcr: string;
  districtOcr: string;
  rowOcr: string;
  canonicalStreet: string;
  streetConfidence: number;
  status: string;
  hasRuleText: boolean;
  externalException: boolean;
};

type Audit = { rows: AuditRow[] };

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(value);
      value = "";
    } else if (character === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  return rows;
}

function queueRecords(text: string): Record<string, string>[] {
  const [headers, ...rows] = parseCsv(text);
  if (!headers?.length) throw new Error("Review queue has no CSV header");
  return rows
    .filter((row) => row.some(Boolean))
    .map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
    );
}

function auditKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("da-DK")
    .replace(/[^a-z0-9æøå]+/g, "");
}

function deriveConditions(row: AuditRow): {
  postcode: string;
  numberFrom: number | null;
  numberTo: number | null;
  parity: "" | "odd" | "even";
  summary: string[];
} {
  const text = `${row.streetOcr} ${row.rowOcr}`;
  const postcode = text.match(/\b([12]\d{3})\b/)?.[1] ?? "";
  const parity = /\buli\s*ge\b|\bulige\b/iu.test(text)
    ? "odd"
    : /\bli\s*ge\b|\blige\b/iu.test(text)
      ? "even"
      : "";
  const numbers = [...text.matchAll(/\b(\d{1,4})\b/g)]
    .map((match) => Number(match[1]))
    .filter((number) => String(number) !== postcode);
  const summary: string[] = [];
  if (postcode) summary.push(`Possible postcode: ${postcode}`);
  if (numbers.length) {
    summary.push(`Possible printed number condition: ${numbers.join(", ")}`);
  }
  if (parity) summary.push(`Possible parity: ${parity}`);
  if (row.hasRuleText && !summary.length) {
    summary.push("Possible range/parity/postcode wording - inspect the crop");
  }
  return {
    postcode,
    numberFrom: numbers[0] ?? null,
    numberTo: numbers[1] ?? null,
    parity,
    summary,
  };
}

const queueText = fs.readFileSync(QUEUE_FILE, "utf8");
const queue = queueRecords(queueText);
const audit = JSON.parse(fs.readFileSync(AUDIT_FILE, "utf8")) as Audit;
if (queue.length !== 123) {
  throw new Error(`Expected 123 queue records, received ${queue.length}`);
}

const items = queue.map((record, index) => {
  const pdfPage = Number(record.pdfPage);
  const historicalPage = pdfPage + 1;
  const fuzzyCandidates = record.fuzzyCandidates
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);
  const matches = audit.rows.filter(
    (row) => row.page === historicalPage && row.rowOcr === record.exactOcrText,
  );
  const auditRow =
    matches.find(
      (row) => auditKey(row.canonicalStreet) === auditKey(fuzzyCandidates[0] ?? ""),
    ) ?? matches[0];
  if (!auditRow) {
    throw new Error(
      `Could not match queue row ${index + 1} to audit coordinates: ${record.exactOcrText}`,
    );
  }
  const coordinateMatch = auditRow.rowId.match(
    /^page-\d+-(left|right)-(\d+)$/,
  );
  if (!coordinateMatch) {
    throw new Error(`Invalid audit row id: ${auditRow.rowId}`);
  }
  const side = coordinateMatch[1] as "left" | "right";
  const rowIndex = Number(coordinateMatch[2]);
  const id = `byen-p${String(pdfPage).padStart(2, "0")}-${side}-${String(rowIndex).padStart(2, "0")}`;
  const ocrSourceRowId = `page-${String(pdfPage).padStart(2, "0")}-${side}-${String(rowIndex).padStart(2, "0")}`;
  const conditions = deriveConditions(auditRow);

  return {
    id,
    itemNumber: index + 1,
    totalItems: queue.length,
    pdfSource: "docs/visitation-source/VisitationByen.pdf",
    pdfPage,
    side,
    rowIndex,
    ocrSourcePage: pdfPage,
    ocrSourceRowId,
    ocrSourceCoordinates: { side, rowIndex },
    legacyAuditPage: auditRow.page,
    legacyAuditRowId: auditRow.rowId,
    rowCrop: `/reviewer-data/crops/${id}-row.png`,
    contextCrop: `/reviewer-data/crops/${id}-context.png`,
    pdfPageUrl: `/source-pdf#page=${pdfPage}`,
    ocrText: record.exactOcrText,
    streetOcr: auditRow.streetOcr,
    districtOcr: auditRow.districtOcr,
    fuzzyCandidates,
    fuzzyCandidatesSourceRowId: ocrSourceRowId,
    suggestionStatus: "requires_visual_transcription",
    suggestedOfficialStreet: "",
    suggestedDistrict: record.printedDistrictMapping.split("/")[0]?.trim() ?? "",
    suggestedConditions: conditions,
    currentBundledRepresentation: record.currentBundledRepresentation,
    currentFirestoreRepresentation: record.currentFirestoreRepresentation,
    confidence: Number(record.confidence),
    reasonFlagged: record.reasonAmbiguous,
    suggestedResolution: record.suggestedResolution,
  };
});

const ids = new Set(items.map((item) => item.id));
if (ids.size !== items.length) throw new Error("Review item coordinates are not unique");

const output = {
  version: 1,
  queueSha256: crypto.createHash("sha256").update(queueText).digest("hex"),
  sourcePdf: "docs/visitation-source/VisitationByen.pdf",
  generatedFrom: [
    "docs/visitation-review/byen-review-queue.csv",
    "docs/visitation-byen-pdf-audit.json",
  ],
  items,
};

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + "\n", "utf8");
process.stdout.write(`Generated ${path.relative(ROOT, OUTPUT_FILE)} with ${items.length} items\n`);
