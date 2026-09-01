# Canonical visitation data

The authoritative sources are:

- `docs/visitation-source/VisitationByen.pdf`
- `docs/visitation-source/VisitationRegionen.pdf`

`byen-ledger.json` contains one explicit reviewed record per approved Byen
rule. It preserves the printed/logical source transcription separately from the
canonical lookup key and retains page, range, parity, postcode, ambiguity,
review, confidence, and provenance fields.

`byen-aliases.json` contains reviewed compatibility spellings separately from
official PDF rules. Each alias points to one canonical street key and carries
only its review reason and provenance; it cannot define a district or any
range, parity, or postcode behavior. Generation rejects missing or ambiguous
targets, collisions with official keys, and conflicting duplicate aliases.
Runtime lookup follows this exact map once and then applies the canonical rule;
it does not use fuzzy matching or broader normalization.

`regionen-ledger.json` contains all 1,599 official cells (41 geographies × 39
categories). Multi-destination cells are arrays in printed order; they are not
flattened during review.

`byen-review-queue.csv` contains 123 pending type-H OCR candidates. The queue
retains the exact OCR output and its fuzzy suggestions, but no row is approved
or generated. Exact and high-similarity matches to approved rows are excluded;
the queue consists of the remaining candidates at the completed audit's 0.67
confidence review cutoff followed by the next highest-confidence unresolved
rows until all 123 audit slots are explicit.

## Local visual reviewer

Run:

```text
npm run visitation:review
```

Then open `http://127.0.0.1:4177/`. This is a standalone local reviewer under
`tools/visitation-review`; it does not use or modify the AmbuAssist web/PWA.
Each item shows a large exact PDF row plus a highlighted context crop, OCR,
fuzzy candidates, the unapproved suggestion, current bundled representation,
and the audit reason. Filters, previous/next/skip navigation, progress, and the
summary view all operate on the same 123-item manifest.

The pending queue's historical audit identifiers are one page higher than the
current official PDF coordinates. The manifest records both values explicitly:
`ocrSourcePage`/`ocrSourceRowId` are the current PDF/OCR row, while
`legacyAuditPage`/`legacyAuditRowId` retain traceability to the old audit. The
asset generator records the 200 dpi source-row, exact-crop, context-crop, and
highlight coordinates plus SHA-256 hashes for both images.

Raw fuzzy candidates are transcription aids only. They are not promoted to an
official street suggestion, because the legacy fuzzy matcher frequently ranked
a visibly different street first. Consequently `Approve suggestion` remains
disabled for these 123 rows until a safe reviewed suggestion exists; choose a
candidate or type the printed value through `Correct manually` instead.

Review actions write atomically to the separate
`review-decisions.json` file, so browser refreshes do not erase work. The raw
CSV, official PDFs, and approved ledger are never changed by the reviewer.
`Approve suggestion` and `Correct manually` record explicit approved human
transcriptions; `Still unclear` keeps the item out of production output. No
decision is pre-populated or auto-approved.

The checked-in `reviewer-data/review-items.json` is tied to the queue by SHA-256.
Its `crops/` directory contains one enlarged row image and one highlighted
neighbour-context image for every pending item. To regenerate the manifest run
`npm run visitation:review:manifest`. Crop regeneration uses
`scripts/generateVisitationReviewerAssets.py`, Python with Pillow, and Poppler's
`pdftoppm`; it reads the PDF and replaces only derived reviewer images.
`scripts/validateVisitationReviewerAlignment.py` can independently re-render
the official pages and verify every queue/OCR/manifest coordinate, crop pixel,
highlight, geometry record, and asset hash.

After human review, run this safe preview first:

```text
npm run visitation:review:apply
```

The command validates the queue hash and all decisions, ignores `unclear`
items, reports already represented rules, rejects unstructured canonical-key
conflicts, validates the entire proposed Byen ledger, and performs no write.
Only after reviewing that report may a human explicitly run
`npm run visitation:review:apply -- --write`. That operation updates only the
canonical Byen ledger, atomically; generation of bundled data remains the
separate `npm run visitation:generate` step. Neither command reads or writes
Firestore.

Run `npm run visitation:generate` after an approved ledger edit. Generation
fails on pending records, invalid constraints, exact duplicates, unstructured
duplicate street keys, unsupported destination combinations, missing cells, or
an incomplete Regionen matrix. It never reads or writes Firestore.

The scripts `extractVisitationTableRows.py`,
`ocrVisitationPages.ps1`, and `buildVisitationPdfAudit.py` are retained as
legacy OCR aids. Their raw or confidence-filtered output is not safe production
input and must be reconciled into the reviewed ledgers first.

Human review should proceed one visual item at a time: inspect the exact row and
its neighbours, confirm the printed spelling and every district/range/parity/
postcode condition, then save the decision. A future Firestore
migration must be a separate reviewed operation generated from these ledgers;
this workflow performs no live writes.
