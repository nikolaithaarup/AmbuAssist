"""Validate reviewer queue, OCR coordinates, manifest, and derived PDF crops."""

from __future__ import annotations

import argparse
import csv
import difflib
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
import unicodedata
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / "docs" / "visitation-review" / "byen-review-queue.csv"
AUDIT = ROOT / "docs" / "visitation-byen-pdf-audit.json"
MANIFEST = ROOT / "docs" / "visitation-review" / "reviewer-data" / "review-items.json"
PDF = ROOT / "docs" / "visitation-source" / "VisitationByen.pdf"
ASSETS = MANIFEST.parent / "crops"
TABLES = {"left": (291, 795), "right": (888, 1392)}
Y_MIN = 1050
Y_MAX = 2050


def normalized(value: str) -> str:
    value = unicodedata.normalize("NFKD", value.casefold())
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9æøå]+", "", value)


def similarity(left: str, right: str) -> float:
    return difflib.SequenceMatcher(None, normalized(left), normalized(right)).ratio()


def grouped_lines(gray: np.ndarray, x1: int, x2: int) -> list[int]:
    darkness = (gray[Y_MIN:Y_MAX, x1:x2] < 150).sum(axis=1)
    candidates = np.where(darkness > (x2 - x1) * 0.85)[0] + Y_MIN
    groups: list[list[int]] = []
    for candidate in candidates:
        value = int(candidate)
        if not groups or value > groups[-1][-1] + 2:
            groups.append([value])
        else:
            groups[-1].append(value)
    return [round(sum(group) / len(group)) for group in groups]


def upscale(image: Image.Image, factor: float) -> Image.Image:
    return image.resize(
        (round(image.width * factor), round(image.height * factor)),
        Image.Resampling.LANCZOS,
    )


def expected_images(page: Image.Image, side: str, row_index: int) -> tuple[Image.Image, Image.Image, dict[str, int]]:
    x1, x2 = TABLES[side]
    lines = grouped_lines(np.asarray(page.convert("L")), x1, x2)
    top_line = row_index - 1
    bottom_line = row_index
    if top_line < 0 or bottom_line >= len(lines):
        raise ValueError(f"row {row_index} outside {len(lines) - 1} detected rows")
    top, bottom = lines[top_line], lines[bottom_line]
    exact = ImageEnhance.Contrast(
        page.crop((x1 - 8, top - 5, x2 + 8, bottom + 5))
    ).enhance(1.15)
    exact = upscale(exact, 3)

    context_top_index = max(0, top_line - 1)
    context_bottom_index = min(len(lines) - 1, bottom_line + 1)
    context_top = lines[context_top_index]
    context_bottom = lines[context_bottom_index]
    context = page.crop(
        (x1 - 18, context_top - 10, x2 + 18, context_bottom + 10)
    ).convert("RGBA")
    overlay = Image.new("RGBA", context.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rectangle(
        (
            8,
            top - context_top + 10,
            context.width - 8,
            bottom - context_top + 10,
        ),
        fill=(255, 205, 38, 34),
        outline=(220, 104, 3, 255),
        width=5,
    )
    context = upscale(Image.alpha_composite(context, overlay).convert("RGB"), 2.5)
    return exact, context, {
        "x1": x1,
        "x2": x2,
        "top": top,
        "bottom": bottom,
        "contextTop": context_top,
        "contextBottom": context_bottom,
    }


def same_pixels(left: Image.Image, right: Image.Image) -> bool:
    return left.size == right.size and ImageChops.difference(
        left.convert("RGB"), right.convert("RGB")
    ).getbbox() is None


def load_historical_rows(path: Path | None) -> dict[str, str]:
    if path is None or not path.exists():
        return {}
    rows = json.loads(path.read_text(encoding="utf-8-sig"))
    return {item["image"].removesuffix(".png"): item["text"] for item in rows}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--historical-rows", type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    queue_text = QUEUE.read_text(encoding="utf-8")
    queue = list(csv.DictReader(queue_text.splitlines()))
    audit_rows = json.loads(AUDIT.read_text(encoding="utf-8"))["rows"]
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    items = manifest["items"]
    historical = load_historical_rows(args.historical_rows)
    errors: list[str] = []
    warnings: list[str] = []
    details: list[dict[str, object]] = []

    if len(queue) != 123 or len(items) != 123:
        errors.append(f"expected 123 queue/manifest items, got {len(queue)}/{len(items)}")
    queue_hash = hashlib.sha256(queue_text.encode()).hexdigest()
    if manifest["queueSha256"] != queue_hash:
        errors.append("manifest queue SHA-256 does not match current CSV")

    pdftoppm = shutil.which("pdftoppm")
    if not pdftoppm:
        raise RuntimeError("pdftoppm is required")

    with tempfile.TemporaryDirectory(dir=ROOT / "tmp" / "pdfs", prefix="review-alignment-") as tmp:
        temporary = Path(tmp)
        pages: dict[int, Image.Image] = {}
        for page_number in sorted({int(item["pdfPage"]) for item in items}):
            prefix = temporary / f"page-{page_number:02d}"
            subprocess.run(
                [pdftoppm, "-f", str(page_number), "-l", str(page_number), "-r", "200", "-png", "-singlefile", str(PDF), str(prefix)],
                check=True,
                capture_output=True,
            )
            pages[page_number] = Image.open(prefix.with_suffix(".png")).convert("RGB")

        for index, (record, item) in enumerate(zip(queue, items), start=1):
            page = int(record["pdfPage"])
            matches = [
                row for row in audit_rows
                if row["page"] == page + 1 and row["rowOcr"] == record["exactOcrText"]
            ]
            if len(matches) != 1:
                errors.append(f"item {index}: expected one audit OCR match, found {len(matches)}")
                continue
            audit_row = matches[0]
            coordinate = re.fullmatch(r"page-(\d+)-(left|right)-(\d+)", audit_row["rowId"])
            if not coordinate:
                errors.append(f"item {index}: invalid OCR row id {audit_row['rowId']}")
                continue
            ocr_page, side, row_text = coordinate.groups()
            row_index = int(row_text)
            expected_id = f"byen-p{page:02d}-{side}-{row_index:02d}"
            if item["id"] != expected_id or item["side"] != side or int(item["rowIndex"]) != row_index:
                errors.append(f"item {index}: manifest coordinate differs from OCR coordinate")
            current_source_row_id = f"page-{page:02d}-{side}-{row_index:02d}"
            if (
                int(item.get("ocrSourcePage", 0)) != page
                or item.get("ocrSourceRowId") != current_source_row_id
                or item.get("fuzzyCandidatesSourceRowId") != current_source_row_id
                or int(item.get("legacyAuditPage", 0)) != int(ocr_page)
                or item.get("legacyAuditRowId") != audit_row["rowId"]
            ):
                errors.append(f"item {index}: OCR/candidate provenance differs from matched audit row")
            if item["ocrText"] != record["exactOcrText"]:
                errors.append(f"item {index}: manifest OCR differs from queue OCR")
            candidates = [value.strip() for value in record["fuzzyCandidates"].split("|") if value.strip()]
            if item["fuzzyCandidates"] != candidates:
                errors.append(f"item {index}: manifest candidates differ from queue")

            exact, context, coordinates = expected_images(pages[page], side, row_index)
            exact_file = ASSETS / f"{expected_id}-row.png"
            context_file = ASSETS / f"{expected_id}-context.png"
            exact_match = exact_file.exists() and same_pixels(exact, Image.open(exact_file))
            context_match = context_file.exists() and same_pixels(context, Image.open(context_file))
            if not exact_match:
                errors.append(f"item {index}: exact crop pixels differ from source coordinates")
            if not context_match:
                errors.append(f"item {index}: context crop pixels differ from source coordinates")
            expected_geometry = {
                "renderDpi": 200,
                "sourceRow": {
                    "x1": coordinates["x1"],
                    "x2": coordinates["x2"],
                    "top": coordinates["top"],
                    "bottom": coordinates["bottom"],
                },
                "exactCrop": {
                    "x1": coordinates["x1"] - 8,
                    "y1": coordinates["top"] - 5,
                    "x2": coordinates["x2"] + 8,
                    "y2": coordinates["bottom"] + 5,
                    "scale": 3,
                },
                "contextCrop": {
                    "x1": coordinates["x1"] - 18,
                    "y1": coordinates["contextTop"] - 10,
                    "x2": coordinates["x2"] + 18,
                    "y2": coordinates["contextBottom"] + 10,
                    "scale": 2.5,
                    "highlightTop": coordinates["top"],
                    "highlightBottom": coordinates["bottom"],
                },
            }
            if item.get("assetGeometry") != expected_geometry:
                errors.append(f"item {index}: recorded asset geometry differs from source coordinates")
            expected_hashes = {
                "rowCrop": hashlib.sha256(exact_file.read_bytes()).hexdigest(),
                "contextCrop": hashlib.sha256(context_file.read_bytes()).hexdigest(),
            }
            if item.get("assetSha256") != expected_hashes:
                errors.append(f"item {index}: recorded asset hash differs from crop file")
            if item.get("suggestedOfficialStreet"):
                errors.append(f"item {index}: unreviewed fuzzy candidate was promoted to official suggestion")

            current_ocr_key = f"page-{page:02d}-{side}-{row_index:02d}-row"
            current_ocr = historical.get(current_ocr_key, "")
            ocr_similarity = similarity(record["exactOcrText"], current_ocr) if current_ocr else None
            if ocr_similarity is not None and ocr_similarity < 0.55:
                warnings.append(
                    f"item {index}: queue OCR poorly matches independent OCR at {current_ocr_key} ({ocr_similarity:.3f})"
                )
            candidate_scores = [similarity(candidate, audit_row["streetOcr"]) for candidate in candidates]
            details.append({
                "itemNumber": index,
                "id": item["id"],
                "pdfPage": page,
                "ocrSourcePage": int(ocr_page),
                "ocrSourceRowId": audit_row["rowId"],
                "side": side,
                "rowIndex": row_index,
                "coordinates": coordinates,
                "queueOcr": record["exactOcrText"],
                "independentCoordinateOcr": current_ocr or None,
                "ocrSimilarity": round(ocr_similarity, 3) if ocr_similarity is not None else None,
                "fuzzyCandidates": candidates,
                "candidateScoresAgainstStreetOcr": [round(score, 3) for score in candidate_scores],
                "exactCropMatchesSourcePixels": exact_match,
                "contextCropMatchesSourcePixels": context_match,
            })

    report = {
        "items": len(items),
        "queueSha256": queue_hash,
        "errors": errors,
        "warnings": warnings,
        "allExactCropsMatchSourcePixels": all(row["exactCropMatchesSourcePixels"] for row in details),
        "allContextCropsMatchSourcePixels": all(row["contextCropMatchesSourcePixels"] for row in details),
        "minimumIndependentOcrSimilarity": min(
            (row["ocrSimilarity"] for row in details if row["ocrSimilarity"] is not None),
            default=None,
        ),
        "details": details,
    }
    output = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(output, encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key != "details"}, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
