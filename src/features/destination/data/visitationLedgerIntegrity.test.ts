import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  buildByenAliasMap,
  buildByenRows,
  buildRegionMaps,
  type ByenAliasRecord,
  type ByenLedgerRecord,
  type RegionenLedgerRecord,
} from "../../../../scripts/visitationLedgerModel";
import { generateVisitationData } from "../../../../scripts/generateVisitationData";
import { CONFIRMED_BYEN_CORRECTIONS } from "../../../../scripts/visitationConfirmedCorrections";
import { normalizeStreetName } from "../../../domain/destination/address";
import { resolveStreetRoute } from "../../../domain/destination/routing";
import { BYEN_STREET_ALIASES, STREET_SAMPLE_RAW } from "./byen";
import {
  GENERATED_BYEN_STREET_ALIASES,
  GENERATED_REGION_MAPS,
} from "./generated/visitationData";

const root = process.cwd();
const byenLedger = JSON.parse(
  fs.readFileSync(
    path.join(root, "docs", "visitation-review", "byen-ledger.json"),
    "utf8",
  ),
) as ByenLedgerRecord[];
const byenAliases = JSON.parse(
  fs.readFileSync(
    path.join(root, "docs", "visitation-review", "byen-aliases.json"),
    "utf8",
  ),
) as ByenAliasRecord[];
const regionLedger = JSON.parse(
  fs.readFileSync(
    path.join(root, "docs", "visitation-review", "regionen-ledger.json"),
    "utf8",
  ),
) as RegionenLedgerRecord[];

type ReviewDecision = {
  status: "approved" | "unclear";
  officialStreetName: string;
  district: string;
  postcodeCondition: string[];
  numberFrom: number | null;
  numberTo: number | null;
  parity: "" | "odd" | "even";
};

type ReconciliationManifest = {
  priorApprovedRules: number;
  approvedDecisions: number;
  newRules: number;
  alreadyRepresented: number;
  preAliasCleanupRecords: number;
  removedHistoricalDuplicateRules: number;
  currentPhysicalRecords: number;
  officialCanonicalRules: number;
  compatibilityAliases: number;
  ledgerSha256: string;
  aliasLedgerSha256: string;
  reviewDecisionsSha256: string;
  historicalSemanticCollisionGroups: string[][];
  reviewedSpellingCollisionAliases: string[][];
};

const ledgerFile = path.join(
  root,
  "docs",
  "visitation-review",
  "byen-ledger.json",
);
const decisionsFile = path.join(
  root,
  "docs",
  "visitation-review",
  "review-decisions.json",
);
const aliasFile = path.join(
  root,
  "docs",
  "visitation-review",
  "byen-aliases.json",
);
const reviewDecisions = JSON.parse(
  fs.readFileSync(decisionsFile, "utf8"),
) as { decisions: Record<string, ReviewDecision> };
const reconciliation = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "docs",
      "visitation-review",
      "reconciliation-manifest.json",
    ),
    "utf8",
  ),
) as ReconciliationManifest;

function rowSignature(row: {
  street: string;
  bydel: string;
  from?: number;
  to?: number;
  side?: string;
  postalCodes?: string[];
  unresolvedReason?: string;
}): string {
  return JSON.stringify([
    normalizeStreetName(row.street),
    row.bydel,
    row.from,
    row.to,
    row.side,
    row.postalCodes?.slice().sort(),
    row.unresolvedReason,
  ]);
}

function sha256(file: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function decisionSignature(decision: ReviewDecision): string {
  return JSON.stringify([
    normalizeStreetName(decision.officialStreetName),
    decision.district,
    decision.numberFrom ?? undefined,
    decision.numberTo ?? undefined,
    decision.parity || undefined,
    decision.postcodeCondition.slice().sort(),
  ]);
}

function ledgerDecisionSignature(row: ByenLedgerRecord): string {
  return JSON.stringify([
    row.canonicalStreetKey,
    row.district,
    row.numberFrom,
    row.numberTo,
    row.parity,
    (row.postcodeCondition ?? []).slice().sort(),
  ]);
}

function auditSemanticKey(street: string): string {
  return street
    .normalize("NFKD")
    .toLocaleLowerCase("da-DK")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[.·'’`´]/g, "")
    .replace(/\s*-\s*/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function auditRuleContext(row: ByenLedgerRecord): string {
  return JSON.stringify([
    row.district,
    row.numberFrom,
    row.numberTo,
    row.parity,
    (row.postcodeCondition ?? []).slice().sort(),
    row.ambiguity?.reason,
  ]);
}

function sortedCollisionGroups(groups: readonly string[][]): string[][] {
  return groups
    .map((group) => [...group].sort((a, b) => a.localeCompare(b, "da")))
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), "da"));
}

function detectAuditSemanticCollisions(
  records: readonly ByenLedgerRecord[],
  reviewedSpellingAliases: readonly string[][],
): string[][] {
  const groups = new Map<string, ByenLedgerRecord[]>();
  for (const row of records) {
    const key = `${auditSemanticKey(row.displayStreetName)}\u0000${auditRuleContext(row)}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  const detected = [...groups.values()]
    .filter(
      (group) =>
        new Set(group.map((row) => row.canonicalStreetKey)).size > 1,
    )
    .map((group) => group.map((row) => row.displayStreetName));

  for (const aliases of reviewedSpellingAliases) {
    const matching = records.filter((row) =>
      aliases.includes(row.displayStreetName),
    );
    expect(matching).toHaveLength(aliases.length);
    expect(new Set(matching.map(auditRuleContext)).size).toBe(1);
    detected.push(aliases);
  }

  return sortedCollisionGroups(detected);
}

describe("canonical visitation ledger integrity", () => {
  test("reconciliation accounts for every approved Byen decision exactly once", () => {
    expect(byenLedger).toHaveLength(reconciliation.currentPhysicalRecords);
    expect(reconciliation.priorApprovedRules + reconciliation.newRules).toBe(
      reconciliation.preAliasCleanupRecords,
    );
    expect(
      reconciliation.preAliasCleanupRecords -
        reconciliation.removedHistoricalDuplicateRules,
    ).toBe(reconciliation.currentPhysicalRecords);
    expect(reconciliation.officialCanonicalRules).toBe(
      reconciliation.currentPhysicalRecords,
    );
    expect(reconciliation.approvedDecisions).toBe(
      reconciliation.newRules + reconciliation.alreadyRepresented,
    );
    expect(byenAliases).toHaveLength(reconciliation.compatibilityAliases);
    expect(sha256(ledgerFile)).toBe(reconciliation.ledgerSha256);
    expect(sha256(aliasFile)).toBe(reconciliation.aliasLedgerSha256);
    expect(sha256(decisionsFile)).toBe(reconciliation.reviewDecisionsSha256);
    expect(byenLedger.every((row) => row.reviewStatus === "approved")).toBe(true);
    expect(byenAliases.every((alias) => alias.reviewStatus === "approved")).toBe(
      true,
    );

    const approved = Object.entries(reviewDecisions.decisions).filter(
      ([, decision]) => decision.status === "approved",
    );
    expect(approved).toHaveLength(reconciliation.approvedDecisions);

    const applied = byenLedger.flatMap((row) => {
      const match = row.reviewNotes.match(
        /^Human-approved from official PDF in review item (byen-p\d{2}-(?:left|right)-\d{2})\.$/,
      );
      return match ? [{ itemId: match[1], row }] : [];
    });
    expect(applied).toHaveLength(reconciliation.newRules);
    expect(new Set(applied.map(({ itemId }) => itemId)).size).toBe(
      reconciliation.newRules,
    );

    const appliedById = new Map(
      applied.map(({ itemId, row }) => [itemId, row]),
    );
    let alreadyRepresented = 0;
    for (const [itemId, decision] of approved) {
      const appliedRow = appliedById.get(itemId);
      if (appliedRow) {
        expect(ledgerDecisionSignature(appliedRow)).toBe(
          decisionSignature(decision),
        );
        continue;
      }

      const equivalentRows = byenLedger.filter(
        (row) => ledgerDecisionSignature(row) === decisionSignature(decision),
      );
      expect(equivalentRows).toHaveLength(1);
      alreadyRepresented += 1;
    }
    expect(alreadyRepresented).toBe(reconciliation.alreadyRepresented);

    const unresolvedIds = Object.entries(reviewDecisions.decisions)
      .filter(([, decision]) => decision.status !== "approved")
      .map(([itemId]) => itemId);
    expect(unresolvedIds).toEqual(["byen-p22-left-01"]);
    expect(
      unresolvedIds.some((itemId) => appliedById.has(itemId)),
    ).toBe(false);
    expect(
      byenLedger.some(
        (row) => normalizeStreetName(row.displayStreetName) === "haveforeninger",
      ),
    ).toBe(false);

    const generated = buildByenRows(byenLedger);
    expect(generated).toHaveLength(byenLedger.length);
    expect(STREET_SAMPLE_RAW).toHaveLength(byenLedger.length);
    expect(generated.map(rowSignature).sort()).toEqual(
      STREET_SAMPLE_RAW.map(rowSignature).sort(),
    );
    expect(new Set(generated.map(rowSignature)).size).toBe(generated.length);

    const generatedAliases = buildByenAliasMap(byenLedger, byenAliases);
    expect(generatedAliases).toEqual(GENERATED_BYEN_STREET_ALIASES);
    expect(generatedAliases).toEqual(BYEN_STREET_ALIASES);
  });

  test("audit-only normalization finds no remaining semantic collisions", () => {
    const detected = detectAuditSemanticCollisions(
      byenLedger,
      reconciliation.reviewedSpellingCollisionAliases,
    );
    expect(detected).toEqual(
      sortedCollisionGroups(reconciliation.historicalSemanticCollisionGroups),
    );
    expect(detected).toEqual([]);
  });

  test("the 17 reviewed official rows exist exactly once with exact provenance", () => {
    const expected = [
      ["A. F. Beyers Vej", 1, "Vanløse"],
      ["A. H. Vedels Plads", 1, "Christianshavn"],
      ["A. L. Drewsens Vej", 1, "Indre Østerbro"],
      ["Danneskiold Samsøes Allé", 9, "Christianshavn"],
      ["Freundsgade", 14, "Vesterbro"],
      ["Fuglagervej", 14, "Vanløse"],
      ["Gammel Kalkbrænderivej", 15, "Indre Østerbro"],
      ["Gammel Torv", 15, "Indre By"],
      ["H. C. Andersens Boulevard", 18, "Indre By"],
      ["H. C. Lumbyes Gade", 18, "Ryvang Øst"],
      ["H. C. Sneedorffs Allé", 18, "Christianshavn"],
      ["J. A. Schwartz Gade", 25, "Indre Østerbro"],
      ["Linnesgade", 32, "Indre By"],
      ["P. D. Løvs Allé", 39, "Ydre Nørrebro"],
      ["Stenkløvervej", 47, "Bispebjerg"],
      ["Vanløsetorv", 54, "Vanløse"],
      ["Wiliam Wainsgade", 57, "Christianshavn"],
    ] as const;

    for (const [street, sourcePage, district] of expected) {
      const rows = byenLedger.filter(
        (row) => row.canonicalStreetKey === normalizeStreetName(street),
      );
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        displayStreetName: street,
        sourcePage,
        sourceText: `${street} | ${district}`,
        district,
      });
    }
  });

  test("all reviewed aliases resolve to their canonical official rule", () => {
    expect(byenLedger).toHaveLength(1_793);
    expect(byenAliases).toHaveLength(19);
    expect(STREET_SAMPLE_RAW).toHaveLength(1_793);

    for (const alias of byenAliases) {
      const targetRows = byenLedger.filter(
        (row) => row.canonicalStreetKey === alias.canonicalStreetKey,
      );
      expect(targetRows).toHaveLength(1);
      const target = targetRows[0];
      expect(target.numberFrom).toBeUndefined();
      expect(target.numberTo).toBeUndefined();
      expect(target.parity).toBeUndefined();
      expect(target.postcodeCondition).toBeUndefined();

      const officialResult = resolveStreetRoute(
        STREET_SAMPLE_RAW,
        target.displayStreetName,
      );
      const aliasResult = resolveStreetRoute(
        STREET_SAMPLE_RAW,
        alias.alias,
        "",
        undefined,
        undefined,
        BYEN_STREET_ALIASES,
      );
      expect(aliasResult).toEqual(officialResult);
      expect(aliasResult).toMatchObject({
        status: "single",
        matchedRule: { street: target.displayStreetName },
      });
      expect(
        BYEN_STREET_ALIASES[normalizeStreetName(alias.alias)],
      ).toBe(alias.canonicalStreetKey);
    }
  });

  test("alias validation rejects unsafe targets and conflicting aliases", () => {
    const first = byenLedger[0];
    const second = byenLedger[1];
    const baseAlias: ByenAliasRecord = {
      ...byenAliases[0],
      alias: "Legacy Test Alias",
      canonicalStreetKey: first.canonicalStreetKey,
    };

    expect(() =>
      buildByenAliasMap(byenLedger, [
        { ...baseAlias, canonicalStreetKey: "missing target" },
      ]),
    ).toThrow(/target is missing/);

    expect(() =>
      buildByenAliasMap(byenLedger, [
        {
          ...baseAlias,
          alias: first.displayStreetName,
          canonicalStreetKey: second.canonicalStreetKey,
        },
      ]),
    ).toThrow(/collides with an official canonical key/);

    expect(() =>
      buildByenAliasMap(byenLedger, [
        baseAlias,
        { ...baseAlias, canonicalStreetKey: second.canonicalStreetKey },
      ]),
    ).toThrow(/conflicting target/);

    const structuredOne: ByenLedgerRecord = {
      ...first,
      canonicalStreetKey: "structured testvej",
      displayStreetName: "Structured Testvej",
      sourceText: "Structured Testvej 1-9 | Vanløse",
      district: "Vanløse",
      numberFrom: 1,
      numberTo: 9,
      duplicatePolicy: "structured",
    };
    const structuredTwo: ByenLedgerRecord = {
      ...structuredOne,
      sourceText: "Structured Testvej 10-20 | Vanløse",
      numberFrom: 10,
      numberTo: 20,
    };
    expect(() =>
      buildByenAliasMap([structuredOne, structuredTwo], [
        { ...baseAlias, canonicalStreetKey: "structured testvej" },
      ]),
    ).toThrow(/ambiguous or structurally incompatible/);
  });

  test("an alias inherits structured requirements without overriding them", () => {
    const target: ByenLedgerRecord = {
      ...byenLedger[0],
      canonicalStreetKey: "structured testvej",
      displayStreetName: "Structured Testvej",
      sourceText: "Structured Testvej 1-9 | Vanløse",
      district: "Vanløse",
      numberFrom: 1,
      numberTo: 9,
    };
    const aliases = buildByenAliasMap([target], [
      {
        ...byenAliases[0],
        alias: "Legacy Structured Testvej",
        canonicalStreetKey: "structured testvej",
      },
    ]);
    const rows = buildByenRows([target]);

    expect(
      resolveStreetRoute(
        rows,
        "Legacy Structured Testvej",
        "",
        undefined,
        undefined,
        aliases,
      ),
    ).toEqual(resolveStreetRoute(rows, "Structured Testvej"));
    expect(
      resolveStreetRoute(rows, "Structured Testvej", "", 4),
    ).toEqual(
      resolveStreetRoute(
        rows,
        "Legacy Structured Testvej",
        "",
        4,
        undefined,
        aliases,
      ),
    );
  });

  test("generated module is current with the reviewed ledgers", () => {
    const generatedFile = fs.readFileSync(
      path.join(
        root,
        "src",
        "features",
        "destination",
        "data",
        "generated",
        "visitationData.ts",
      ),
      "utf8",
    );
    expect(generatedFile).toBe(generateVisitationData());
  });

  test("all 1,599 Regionen cells are represented exactly", () => {
    expect(regionLedger).toHaveLength(1_599);
    expect(regionLedger.every((row) => row.reviewStatus === "approved")).toBe(true);
    expect(buildRegionMaps(regionLedger)).toEqual(GENERATED_REGION_MAPS);

    expect(GENERATED_REGION_MAPS.byen.Vesterbro).toBeUndefined();
    expect(GENERATED_REGION_MAPS.syd.Vesterbro).toBeDefined();
    expect(GENERATED_REGION_MAPS.midt.Gentofte).toMatchObject({
      akutklinik: "GEH",
      ortopaedkirurgi_boern_u16: "HEH_GEH",
      neurokirurgi: "GLO_RH",
      mammakirurgi: "GEH",
      gynaekologi: "HEH_GEH",
      paediatri: "HEH_GEH",
      billeddiagnostik: "GEH",
    });
    expect(GENERATED_REGION_MAPS.syd.Tårnby).toMatchObject({
      neurokirurgi: "GLO_RH",
      gynaekologi: "AMH_HVH",
      paediatri: "AMH_HVH",
      oftalmologi: "GLO_NOH",
    });
  });

  test("duplicate canonical keys fail unless explicitly structured", () => {
    const source = byenLedger.find(
      (row) => row.displayStreetName === "Købmagergade",
    );
    expect(source).toBeDefined();
    expect(() =>
      buildByenRows([
        source!,
        { ...source!, district: "Vesterbro", sourceText: "invalid duplicate" },
      ]),
    ).toThrow(/not explicitly structured/);
  });

  test("known split, range, parity, and postcode streets retain structure", () => {
    const rulesFor = (street: string) =>
      byenLedger.filter(
        (row) => row.canonicalStreetKey === normalizeStreetName(street),
      );

    expect(rulesFor("Ågade")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ numberFrom: 88, numberTo: 110, parity: "even" }),
        expect.objectContaining({ numberFrom: 112, numberTo: 154, parity: "even" }),
      ]),
    );
    expect(rulesFor("Astrupvej").length).toBeGreaterThan(1);
    expect(
      byenLedger.some((row) => (row.postcodeCondition?.length ?? 0) > 0),
    ).toBe(true);
  });

  test("the eight reviewed K-page neighbours and Købmagergade are present", () => {
    const expected = new Map([
      ["Kychlersgade", "Vesterbro"],
      ["Kyringevej", "Brønshøj/Husum"],
      ["Kæmnervej", "Bispebjerg"],
      ["Kæragervej", "Vanløse"],
      ["Kærholmen", "Vanløse"],
      ["Kærsangervej", "Bispebjerg"],
      ["Købmagergade", "Indre By"],
      ["Kødboderne", "Vesterbro"],
    ]);
    for (const [street, district] of expected) {
      expect(byenLedger).toContainEqual(
        expect.objectContaining({
          sourcePage: 30,
          displayStreetName: street,
          canonicalStreetKey: normalizeStreetName(street),
          district,
          reviewStatus: "approved",
        }),
      );
    }
  });

  test("all 85 visually confirmed omissions are approved and bundled", () => {
    expect(CONFIRMED_BYEN_CORRECTIONS).toHaveLength(85);
    for (const correction of CONFIRMED_BYEN_CORRECTIONS) {
      expect(byenLedger).toContainEqual(
        expect.objectContaining({
          sourcePage: correction.page,
          displayStreetName: correction.street,
          canonicalStreetKey: normalizeStreetName(correction.street),
          district: correction.district,
          reviewStatus: "approved",
          provenance: "official-pdf-visual-review",
        }),
      );
      expect(STREET_SAMPLE_RAW).toContainEqual(
        expect.objectContaining({
          street: correction.street,
          bydel: correction.district,
        }),
      );
    }
  });

  test("official multi-destination Regionen cells remain ordered arrays", () => {
    expect(regionLedger).toContainEqual(
      expect.objectContaining({
        sourcePage: 2,
        geography: "Gentofte",
        category: "neurokirurgi",
        officialDestinations: ["GLO", "RH"],
      }),
    );
    expect(regionLedger).toContainEqual(
      expect.objectContaining({
        sourcePage: 4,
        geography: "Tårnby",
        category: "gynaekologi",
        officialDestinations: ["AMH", "HVH"],
      }),
    );
  });

  test("source page and provenance are retained for every approved row", () => {
    for (const row of [...byenLedger, ...regionLedger]) {
      expect(row.sourcePage).toBeGreaterThan(0);
      expect(row.sourceFile).toMatch(/^docs\/visitation-source\//);
      expect(row.sourceText).not.toBe("");
      expect(row.provenance).toMatch(/^official-pdf-/);
    }
  });

  test("pending review rows cannot enter production output", () => {
    expect(() =>
      buildByenRows([{ ...byenLedger[0], reviewStatus: "pending" }]),
    ).toThrow(/not approved/);
    expect(() =>
      buildRegionMaps(
        [{ ...regionLedger[0], reviewStatus: "pending" }],
        { requireCompleteMatrix: false },
      ),
    ).toThrow(/not approved/);

    const queue = fs
      .readFileSync(
        path.join(root, "docs", "visitation-review", "byen-review-queue.csv"),
        "utf8",
      )
      .trimEnd()
      .split(/\r?\n/);
    expect(queue).toHaveLength(124);
    expect(queue.slice(1).every((line) => line.endsWith(',"pending"'))).toBe(true);
  });
});
