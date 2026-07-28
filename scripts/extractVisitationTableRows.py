"""Crop each row of the two street tables from rendered Visitation Byen pages."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageOps


TABLES = {
    # Vertical grid lines in the 200 dpi renders. Keep the complete cell width:
    # the earlier prototype started ~35 px inside each street cell and could
    # silently lose the first letters (for example "Abel" became "el").
    "left": (291, 534, 795),
    "right": (888, 1133, 1392),
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


def text_bands(image: Image.Image) -> list[tuple[int, int]]:
    gray = np.asarray(image.convert("L"))
    ink = (gray < 180).sum(axis=1)
    candidates = np.where(ink > 3)[0]
    groups: list[list[int]] = []
    for candidate in candidates:
        value = int(candidate)
        if not groups or value > groups[-1][-1] + 3:
            groups.append([value])
        else:
            groups[-1].append(value)
    return [(max(0, group[0] - 3), min(image.height, group[-1] + 4)) for group in groups]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("image_directory", type=Path)
    parser.add_argument("output_directory", type=Path)
    args = parser.parse_args()
    args.output_directory.mkdir(parents=True, exist_ok=True)

    for source in sorted(args.image_directory.glob("page-*.png")):
        page = Image.open(source).convert("RGB")
        gray = np.asarray(page.convert("L"))
        for side, (x1, separator, x2) in TABLES.items():
            lines = grouped_lines(gray, x1, x2)
            for index, (top, bottom) in enumerate(zip(lines, lines[1:]), start=1):
                if bottom - top < 12:
                    continue
                for cell, (cell_x1, cell_x2) in {
                    "street": (x1, separator),
                    "district": (separator, x2),
                    # OCR also gets the intact row. It often reads rule text and
                    # the district more accurately when it can see their layout.
                    "row": (x1, x2),
                }.items():
                    crop = page.crop(
                        (cell_x1 + 5, top + 3, cell_x2 - 5, bottom - 3)
                    )
                    crop = ImageOps.expand(crop, border=16, fill="white")
                    crop = crop.resize((crop.width * 3, crop.height * 3))
                    crop = ImageEnhance.Contrast(crop).enhance(1.6)
                    crop.save(
                        args.output_directory
                        / f"{source.stem}-{side}-{index:02d}-{cell}.png"
                    )
                    if cell == "street":
                        raw_cell = page.crop(
                            (cell_x1 + 5, top + 3, cell_x2 - 5, bottom - 3)
                        )
                        for line_index, (line_top, line_bottom) in enumerate(
                            text_bands(raw_cell), start=1
                        ):
                            line = raw_cell.crop((0, line_top, raw_cell.width, line_bottom))
                            line = ImageOps.expand(line, border=20, fill="white")
                            line = line.resize((line.width * 4, line.height * 4))
                            line = ImageEnhance.Contrast(line).enhance(1.8)
                            line.save(
                                args.output_directory
                                / f"{source.stem}-{side}-{index:02d}-street-line-{line_index:02d}.png"
                            )


if __name__ == "__main__":
    main()
