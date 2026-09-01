import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { normalizeStreetName } from "../src/domain/destination/address";
import {
  buildByenRows,
  OFFICIAL_BYEN_SOURCE,
  type ByenLedgerRecord,
} from "./visitationLedgerModel";
import {
  validateDecision,
  type ReviewDecisionFile,
  type ReviewItem,
} from "../tools/visitation-review/reviewerModel";

const ROOT = path.resolve(__dirname, "..");
const QUEUE_FILE = path.join(ROOT, "docs", "visitation-review", "byen-review-queue.csv");
const MANIFEST_FILE = path.join(
  ROOT,
  "docs",
  "visitation-review",
  "reviewer-data",
  "review-items.json",
);
const DECISIONS_FILE = path.join(
  ROOT,
  "docs",
  "visitation-review",
  "review-decisions.json",
);
const LEDGER_FILE = path.join(ROOT, "docs", "visitation-review", "byen-ledger.json");

type Manifest = { queueSha256: string; items: ReviewItem[] };

function sha256(file: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function equivalent(a: ByenLedgerRecord, b: ByenLedgerRecord): boolean {
  return JSON.stringify([
    a.canonicalStreetKey,
    a.district,
    a.postcodeCondition ?? [],
    a.numberFrom ?? null,
    a.numberTo ?? null,
    a.parity ?? "",
  ]) === JSON.stringify([
    b.canonicalStreetKey,
    b.district,
    b.postcodeCondition ?? [],
    b.numberFrom ?? null,
    b.numberTo ?? null,
    b.parity ?? "",
  ]);
}

function printedCondition(record: ByenLedgerRecord): string {
  const parts: string[] = [];
  if (record.postcodeCondition?.length) parts.push(`postcode ${record.postcodeCondition.join(", ")}`);
  if (record.numberFrom !== undefined || record.numberTo !== undefined) {
    parts.push(`numbers ${record.numberFrom ?? "…"}-${record.numberTo ?? "…"}`);
  }
  if (record.parity) parts.push(record.parity);
  return parts.length ? ` (${parts.join("; ")})` : "";
}

function main(): void {
  const write = process.argv.includes("--write");
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf8")) as Manifest;
  const decisions = JSON.parse(fs.readFileSync(DECISIONS_FILE, "utf8")) as ReviewDecisionFile;
  const ledger = JSON.parse(fs.readFileSync(LEDGER_FILE, "utf8")) as ByenLedgerRecord[];
  const queueHash = sha256(QUEUE_FILE);

  if (manifest.queueSha256 !== queueHash || decisions.queueSha256 !== queueHash) {
    throw new Error("The queue, manifest, and decisions hashes differ; regenerate/reconcile before applying.");
  }

  const items = new Map(manifest.items.map((item) => [item.id, item]));
  const additions: ByenLedgerRecord[] = [];
  const alreadyRepresented: string[] = [];

  for (const [itemId, rawDecision] of Object.entries(decisions.decisions)) {
    const item = items.get(itemId);
    if (!item) throw new Error(`Decision references unknown review item ${itemId}`);
    const decision = validateDecision(item, rawDecision, rawDecision.reviewedAt);
    if (decision.status !== "approved") continue;

    const record: ByenLedgerRecord = {
      sourceFile: OFFICIAL_BYEN_SOURCE,
      sourcePage: item.pdfPage,
      sourceText: `${decision.officialStreetName}${printedCondition({
        postcodeCondition: decision.postcodeCondition.length ? decision.postcodeCondition : undefined,
        numberFrom: decision.numberFrom ?? undefined,
        numberTo: decision.numberTo ?? undefined,
        parity: decision.parity || undefined,
      } as ByenLedgerRecord)} | ${decision.district}`,
      canonicalStreetKey: normalizeStreetName(decision.officialStreetName),
      displayStreetName: decision.officialStreetName,
      district: decision.district,
      postcodeCondition: decision.postcodeCondition.length ? decision.postcodeCondition : undefined,
      numberFrom: decision.numberFrom ?? undefined,
      numberTo: decision.numberTo ?? undefined,
      parity: decision.parity || undefined,
      reviewStatus: "approved",
      reviewNotes: decision.notes || `Human-approved from official PDF in review item ${itemId}.`,
      sourceConfidence: "high",
      provenance: "official-pdf-visual-review",
    };

    const sameKey = [...ledger, ...additions].filter(
      (existing) => existing.canonicalStreetKey === record.canonicalStreetKey,
    );
    if (sameKey.some((existing) => equivalent(existing, record))) {
      alreadyRepresented.push(itemId);
      continue;
    }
    if (sameKey.length) {
      const structured = Boolean(
        record.postcodeCondition?.length ||
          record.numberFrom !== undefined ||
          record.numberTo !== undefined ||
          record.parity,
      );
      if (!structured || !sameKey.every((existing) => existing.duplicatePolicy === "structured")) {
        throw new Error(
          `${itemId} conflicts with existing canonical key ${JSON.stringify(record.canonicalStreetKey)}; ` +
            "resolve the structured duplicate explicitly before writing.",
        );
      }
      record.duplicatePolicy = "structured";
    }
    additions.push(record);
  }

  const output = [...ledger, ...additions].sort((a, b) =>
    a.canonicalStreetKey.localeCompare(b.canonicalStreetKey, "da") ||
    a.sourcePage - b.sourcePage ||
    (a.numberFrom ?? 0) - (b.numberFrom ?? 0),
  );
  buildByenRows(output);

  process.stdout.write(
    `Approved decisions: ${Object.values(decisions.decisions).filter((entry) => entry.status === "approved").length}\n` +
      `New ledger records: ${additions.length}\n` +
      `Already represented: ${alreadyRepresented.length}\n`,
  );
  if (!write) {
    process.stdout.write("Dry run only. Re-run with --write after reviewing decisions and this report.\n");
    return;
  }

  const temporary = `${LEDGER_FILE}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(output, null, 2) + "\n", "utf8");
  fs.renameSync(temporary, LEDGER_FILE);
  process.stdout.write(`Wrote ${output.length} approved records to ${path.relative(ROOT, LEDGER_FILE)}.\n`);
}

main();
