import fs from "node:fs";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";

import {
  emptyDecisionFile,
  reviewSummary,
  validateDecision,
  type ReviewDecisionFile,
  type ReviewItem,
} from "./reviewerModel";

const ROOT = path.resolve(__dirname, "..", "..");
const STATIC_ROOT = path.join(ROOT, "tools", "visitation-review", "public");
const REVIEW_DATA_ROOT = path.join(
  ROOT,
  "docs",
  "visitation-review",
  "reviewer-data",
);
const MANIFEST_FILE = path.join(REVIEW_DATA_ROOT, "review-items.json");
const DECISIONS_FILE = process.env.VISITATION_REVIEW_DECISIONS_FILE
  ? path.resolve(process.env.VISITATION_REVIEW_DECISIONS_FILE)
  : path.join(ROOT, "docs", "visitation-review", "review-decisions.json");
const SOURCE_PDF = path.join(
  ROOT,
  "docs",
  "visitation-source",
  "VisitationByen.pdf",
);

type Manifest = {
  version: number;
  queueSha256: string;
  sourcePdf: string;
  items: ReviewItem[];
};

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
};

function readManifest(): Manifest {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf8")) as Manifest;
  if (manifest.items.length !== 123) {
    throw new Error(`Expected 123 review items, received ${manifest.items.length}`);
  }
  return manifest;
}

function readDecisions(manifest: Manifest): ReviewDecisionFile {
  if (!fs.existsSync(DECISIONS_FILE)) {
    return emptyDecisionFile(manifest.queueSha256);
  }
  const decisions = JSON.parse(
    fs.readFileSync(DECISIONS_FILE, "utf8"),
  ) as ReviewDecisionFile;
  if (decisions.queueSha256 !== manifest.queueSha256) {
    throw new Error(
      "Review queue changed after decisions were recorded. Reconcile the decisions file before continuing.",
    );
  }
  return decisions;
}

function writeDecisions(decisions: ReviewDecisionFile): void {
  const temporary = `${DECISIONS_FILE}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(decisions, null, 2) + "\n", "utf8");
  fs.renameSync(temporary, DECISIONS_FILE);
}

function json(response: ServerResponse, status: number, value: unknown): void {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(value));
}

function serveFile(response: ServerResponse, file: string): void {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    json(response, 404, { error: "Not found" });
    return;
  }
  response.writeHead(200, {
    "Content-Type": CONTENT_TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream",
    "Cache-Control": file.endsWith(".png") ? "public, max-age=31536000, immutable" : "no-store",
  });
  fs.createReadStream(file).pipe(response);
}

async function body(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 64_000) throw new Error("Request body is too large");
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<
    string,
    unknown
  >;
}

export function createReviewerServer(): http.Server {
  const manifest = readManifest();
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      if (request.method === "GET" && url.pathname === "/api/review") {
        const decisions = readDecisions(manifest);
        json(response, 200, {
          manifest,
          decisions: decisions.decisions,
          summary: reviewSummary(manifest.items.length, decisions.decisions),
        });
        return;
      }
      if (request.method === "GET" && url.pathname === "/api/export") {
        const decisions = readDecisions(manifest);
        response.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": 'attachment; filename="review-decisions.json"',
          "Cache-Control": "no-store",
        });
        response.end(JSON.stringify(decisions, null, 2) + "\n");
        return;
      }
      if (request.method === "POST" && url.pathname.startsWith("/api/decisions/")) {
        const itemId = decodeURIComponent(url.pathname.slice("/api/decisions/".length));
        const item = manifest.items.find((candidate) => candidate.id === itemId);
        if (!item) {
          json(response, 404, { error: "Unknown review item" });
          return;
        }
        const decision = validateDecision(item, await body(request));
        const decisions = readDecisions(manifest);
        decisions.decisions[itemId] = decision;
        decisions.updatedAt = decision.reviewedAt;
        writeDecisions(decisions);
        json(response, 200, {
          decision,
          decisions: decisions.decisions,
          summary: reviewSummary(manifest.items.length, decisions.decisions),
        });
        return;
      }
      if (request.method === "DELETE" && url.pathname.startsWith("/api/decisions/")) {
        const itemId = decodeURIComponent(url.pathname.slice("/api/decisions/".length));
        const decisions = readDecisions(manifest);
        delete decisions.decisions[itemId];
        decisions.updatedAt = new Date().toISOString();
        writeDecisions(decisions);
        json(response, 200, {
          decisions: decisions.decisions,
          summary: reviewSummary(manifest.items.length, decisions.decisions),
        });
        return;
      }
      if (request.method === "GET" && url.pathname === "/source-pdf") {
        serveFile(response, SOURCE_PDF);
        return;
      }
      if (request.method === "GET" && url.pathname.startsWith("/reviewer-data/")) {
        const relative = url.pathname.slice("/reviewer-data/".length);
        const file = path.resolve(REVIEW_DATA_ROOT, relative);
        if (!file.startsWith(path.resolve(REVIEW_DATA_ROOT) + path.sep)) {
          json(response, 403, { error: "Invalid asset path" });
          return;
        }
        serveFile(response, file);
        return;
      }

      const relative = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      const file = path.resolve(STATIC_ROOT, relative);
      if (!file.startsWith(path.resolve(STATIC_ROOT) + path.sep)) {
        json(response, 403, { error: "Invalid static path" });
        return;
      }
      serveFile(response, file);
    } catch (error) {
      json(response, 400, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.VISITATION_REVIEW_PORT ?? 4177);
  const server = createReviewerServer();
  server.listen(port, "127.0.0.1", () => {
    process.stdout.write(
      `Visitation reviewer: http://127.0.0.1:${port}\nDecisions: ${path.relative(ROOT, DECISIONS_FILE)}\n`,
    );
  });
}
