"""Render readable exact-row and neighbour-context crops for the local reviewer."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "docs" / "visitation-source" / "VisitationByen.pdf"
MANIFEST = (
    ROOT
    / "docs"
    / "visitation-review"
    / "reviewer-data"
    / "review-items.json"
)
OUTPUT = MANIFEST.parent / "crops"
TMP_BASE = ROOT / "tmp" / "pdfs"

TABLES = {
    "left": (291, 795),
    "right": (888, 1392),
}
Y_MIN = 1050
Y_MAX = 2050


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
    size = (round(image.width * factor), round(image.height * factor))
    return image.resize(size, Image.Resampling.LANCZOS)


def render_page(pdftoppm: str, page_number: int, destination: Path) -> Path:
    prefix = destination / f"page-{page_number:02d}"
    subprocess.run(
        [
            pdftoppm,
            "-f",
            str(page_number),
            "-l",
            str(page_number),
            "-r",
            "200",
            "-png",
            "-singlefile",
            str(PDF),
            str(prefix),
        ],
        check=True,
        capture_output=True,
    )
    return prefix.with_suffix(".png")


def main() -> None:
    if not PDF.exists() or not MANIFEST.exists():
        raise FileNotFoundError("Official PDF or reviewer manifest is missing")
    pdftoppm = shutil.which("pdftoppm")
    if not pdftoppm:
        raise RuntimeError("pdftoppm is required to render reviewer crops")

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    pages = sorted({int(item["pdfPage"]) for item in data["items"]})
    OUTPUT.mkdir(parents=True, exist_ok=True)
    TMP_BASE.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(
        dir=TMP_BASE, prefix="visitation-review-pages-"
    ) as temporary:
        temporary_path = Path(temporary)
        rendered = {
            page: render_page(pdftoppm, page, temporary_path) for page in pages
        }
        opened = {
            page: Image.open(image_path).convert("RGB")
            for page, image_path in rendered.items()
        }

        for item in data["items"]:
            page = opened[int(item["pdfPage"])]
            x1, x2 = TABLES[item["side"]]
            lines = grouped_lines(np.asarray(page.convert("L")), x1, x2)
            row_index = int(item["rowIndex"])
            top_line = row_index - 1
            bottom_line = row_index
            if top_line < 0 or bottom_line >= len(lines):
                raise ValueError(f"Row index outside detected grid: {item['id']}")

            top = lines[top_line]
            bottom = lines[bottom_line]
            exact = page.crop((x1 - 8, top - 5, x2 + 8, bottom + 5))
            exact = ImageEnhance.Contrast(exact).enhance(1.15)
            exact_output = OUTPUT / f"{item['id']}-row.png"
            upscale(exact, 3).save(exact_output, optimize=True)

            context_top_index = max(0, top_line - 1)
            context_bottom_index = min(len(lines) - 1, bottom_line + 1)
            context_top = lines[context_top_index]
            context_bottom = lines[context_bottom_index]
            context = page.crop(
                (x1 - 18, context_top - 10, x2 + 18, context_bottom + 10)
            ).convert("RGBA")
            relative_top = top - context_top + 10
            relative_bottom = bottom - context_top + 10
            overlay = Image.new("RGBA", context.size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)
            draw.rectangle(
                (8, relative_top, context.width - 8, relative_bottom),
                fill=(255, 205, 38, 34),
                outline=(220, 104, 3, 255),
                width=5,
            )
            context = Image.alpha_composite(context, overlay).convert("RGB")
            context_output = OUTPUT / f"{item['id']}-context.png"
            upscale(context, 2.5).save(context_output, optimize=True)
            item["assetGeometry"] = {
                "renderDpi": 200,
                "sourceRow": {"x1": x1, "x2": x2, "top": top, "bottom": bottom},
                "exactCrop": {
                    "x1": x1 - 8,
                    "y1": top - 5,
                    "x2": x2 + 8,
                    "y2": bottom + 5,
                    "scale": 3,
                },
                "contextCrop": {
                    "x1": x1 - 18,
                    "y1": context_top - 10,
                    "x2": x2 + 18,
                    "y2": context_bottom + 10,
                    "scale": 2.5,
                    "highlightTop": top,
                    "highlightBottom": bottom,
                },
            }
            item["assetSha256"] = {
                "rowCrop": hashlib.sha256(exact_output.read_bytes()).hexdigest(),
                "contextCrop": hashlib.sha256(context_output.read_bytes()).hexdigest(),
            }

    MANIFEST.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    print(f"Generated {len(data['items']) * 2} reviewer crop images")


if __name__ == "__main__":
    main()
