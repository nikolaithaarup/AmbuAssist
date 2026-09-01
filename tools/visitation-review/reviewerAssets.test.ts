import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..", "..");

describe("visitation review artifacts", () => {
  it("provides one exact and one context crop for every pending row", () => {
    const queue = path.join(ROOT, "docs", "visitation-review", "byen-review-queue.csv");
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, "docs", "visitation-review", "reviewer-data", "review-items.json"),
        "utf8",
      ),
    ) as {
      queueSha256: string;
      items: Array<{
        id: string;
        rowCrop: string;
        contextCrop: string;
        pdfPage: number;
        ocrSourcePage: number;
        ocrSourceRowId: string;
        suggestedOfficialStreet: string;
        assetGeometry: unknown;
        assetSha256: { rowCrop: string; contextCrop: string };
      }>;
    };
    const decisions = JSON.parse(
      fs.readFileSync(path.join(ROOT, "docs", "visitation-review", "review-decisions.json"), "utf8"),
    ) as { queueSha256: string; decisions: Record<string, unknown> };
    const queueHash = crypto.createHash("sha256").update(fs.readFileSync(queue)).digest("hex");

    expect(manifest.items).toHaveLength(123);
    expect(new Set(manifest.items.map((item) => item.id)).size).toBe(123);
    expect(manifest.queueSha256).toBe(queueHash);
    expect(decisions.queueSha256).toBe(queueHash);
    expect(
      Object.keys(decisions.decisions).every((id) =>
        manifest.items.some((item) => item.id === id),
      ),
    ).toBe(true);
    for (const item of manifest.items) {
      expect(item.pdfPage).toBeGreaterThanOrEqual(1);
      expect(item.ocrSourcePage).toBe(item.pdfPage);
      expect(item.ocrSourceRowId).toContain(`page-${String(item.pdfPage).padStart(2, "0")}-`);
      expect(item.suggestedOfficialStreet).toBe("");
      expect(item.assetGeometry).toBeDefined();
      for (const url of [item.rowCrop, item.contextCrop]) {
        const file = path.join(ROOT, "docs", "visitation-review", url.replace("/reviewer-data/", "reviewer-data/"));
        expect(fs.statSync(file).size).toBeGreaterThan(1_000);
      }
      expect(item.assetSha256.rowCrop).toMatch(/^[a-f0-9]{64}$/);
      expect(item.assetSha256.contextCrop).toMatch(/^[a-f0-9]{64}$/);
    }
  });
});
