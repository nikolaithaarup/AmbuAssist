"""Build a reviewable Visitation Byen audit from cell OCR plus official street names.

OCR is never promoted blindly: only high-confidence, single-district rows without
number/postal/exception text enter the generated simple-row module. Every other
physical PDF row remains visible in the audit as a rule or an uncertainty.
"""

from __future__ import annotations

import argparse
import difflib
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path


DISTRICTS = [
    "Amager", "Vestamager", "Sundby Nord", "Bispebjerg", "Brønshøj/Husum",
    "Christianshavn", "Frederiksberg", "Indre By", "Kgs. Enghave",
    "Indre Nørrebro", "Ydre Nørrebro", "Ryvang Øst", "Valby", "Vanløse",
    "Vesterbro", "Indre Østerbro", "Ydre Østerbro",
]
RULE_WORDS = re.compile(
    r"\b(nr|nummer|lige|ulige|post\s*nr|postnummer|resten|kun|fra|til|minus)\b|\d",
    re.IGNORECASE,
)


def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", value.casefold())
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9æøå]+", "", value)


def clean_cell(value: str) -> str:
    value = re.sub(r"\s+", " ", value).strip(" |\\")
    value = re.sub(r"^I\s+|\s+I$", "", value).strip()
    return value


def district_matches(raw: str) -> list[tuple[str, float]]:
    cleaned = clean_cell(raw).replace("lndre", "Indre")
    lowered = cleaned.casefold()
    substitutions = {
        "rwanq": "ryvang", "rwana": "ryvang", "pebier": "bispebjerg",
        "debier": "bispebjerg", "lløse": "vanløse", "mmaqe": "amager",
        "ønshøj": "brønshøj",
    }
    for old, new in substitutions.items():
        lowered = lowered.replace(old, new)
    cleaned_norm = norm(lowered)
    found: list[tuple[str, float]] = []
    for district in DISTRICTS:
        district_norm = norm(district)
        if district_norm in cleaned_norm:
            found.append((district, 1.0))
            continue
        ratio = difflib.SequenceMatcher(None, cleaned_norm, district_norm).ratio()
        if ratio >= 0.66:
            found.append((district, ratio))
    found.sort(key=lambda item: item[1], reverse=True)
    if "/" not in cleaned and found:
        return found[:1]
    return found[:2]


def extract_existing(source: str) -> tuple[list[str], dict[str, set[str]]]:
    rows = re.findall(
        r'\{\s*street:\s*"([^"]+)",\s*bydel:\s*"([^"]+)"', source
    )
    names: list[str] = []
    assignments: dict[str, set[str]] = defaultdict(set)
    for street, district in rows:
        names.append(street)
        assignments[norm(street)].add(district)
    return names, assignments


def best_street(raw: str, official: list[str], existing: list[str]) -> tuple[str, float]:
    cleaned = clean_cell(raw)
    cleaned_norm = norm(cleaned)
    if not cleaned_norm:
        return "", 0.0

    pool_by_norm: dict[str, str] = {}
    for name in existing + official:
        pool_by_norm[norm(name)] = name

    prefix = [
        (key, name) for key, name in pool_by_norm.items()
        if len(key) >= 3 and cleaned_norm.startswith(key)
    ]
    if prefix:
        key, name = max(prefix, key=lambda item: len(item[0]))
        remainder = cleaned_norm[len(key):]
        if not remainder or RULE_WORDS.search(cleaned) or len(remainder) <= 2:
            return name, 1.0

    first = cleaned_norm[:1]
    candidates = [
        (key, name) for key, name in pool_by_norm.items()
        if key[:1] == first and abs(len(key) - len(cleaned_norm)) <= 5
    ] or list(pool_by_norm.items())
    key, name = max(
        candidates,
        key=lambda item: difflib.SequenceMatcher(None, cleaned_norm, item[0]).ratio(),
    )
    return name, difflib.SequenceMatcher(None, cleaned_norm, key).ratio()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cells", type=Path, required=True)
    parser.add_argument("--rows", type=Path, required=True)
    parser.add_argument("--source", type=Path, nargs="+", required=True)
    parser.add_argument("--dawa", type=Path, nargs="+", required=True)
    parser.add_argument("--audit", type=Path, required=True)
    parser.add_argument("--generated", type=Path, required=True)
    args = parser.parse_args()

    cells = json.loads(args.cells.read_text(encoding="utf-8-sig"))
    rows = json.loads(args.rows.read_text(encoding="utf-8-sig"))
    cell_map = {item["image"].removesuffix(".png"): item["text"] for item in cells}
    row_map = {item["image"].removesuffix("-row.png"): item["text"] for item in rows}
    source_text = "\n".join(path.read_text(encoding="utf-8") for path in args.source)
    existing, existing_assignments = extract_existing(source_text)

    official: list[str] = []
    for path in args.dawa:
        official.extend(item["navn"] for item in json.loads(path.read_text(encoding="utf-8-sig")))
    official = sorted(set(official), key=lambda value: value.casefold())

    keys = sorted(
        name.removesuffix("-street") for name in cell_map if name.endswith("-street")
    )
    audited = []
    generated: dict[tuple[str, str], dict[str, str | int]] = {}
    pdf_names: set[str] = set()

    for key in keys:
        street_ocr = clean_cell(cell_map.get(f"{key}-street", ""))
        district_ocr = clean_cell(cell_map.get(f"{key}-district", ""))
        row_ocr = clean_cell(row_map.get(key, ""))
        canonical, street_confidence = best_street(street_ocr, official, existing)
        districts = district_matches(district_ocr)
        has_rule = bool(RULE_WORDS.search(street_ocr))
        external = bool(re.search(r"\b(CVI|HGH|HVH|BBH|Gentofte|Gladsaxe|Herlev)\b", row_ocr, re.I))
        composite = "/" in district_ocr or len(districts) > 1
        page_match = re.search(r"page-(\d+)", key)
        page = int(page_match.group(1)) if page_match else 0

        if canonical:
            pdf_names.add(norm(canonical))
        status = "uncertain"
        if has_rule or external or composite:
            status = "rule_or_exception"
        elif street_confidence >= 0.86 and len(districts) == 1:
            status = "structured_simple"
            district = districts[0][0]
            generated[(norm(canonical), district)] = {
                "street": canonical, "bydel": district, "pdfPage": page
            }

        audited.append({
            "page": page,
            "rowId": key,
            "streetOcr": street_ocr,
            "districtOcr": district_ocr,
            "rowOcr": row_ocr,
            "canonicalStreet": canonical,
            "streetConfidence": round(street_confidence, 3),
            "districtMatches": [
                {"district": district, "confidence": round(confidence, 3)}
                for district, confidence in districts
            ],
            "status": status,
            "hasRuleText": has_rule,
            "externalException": external,
        })

    current_names = set(existing_assignments)
    audit = {
        "source": "Visitation Byen, revised 2025-01-15",
        "physicalRowsAudited": len(audited),
        "canonicalStreetKeysInPdf": len(pdf_names),
        "generatedSimpleStreetRows": len(generated),
        "ruleOrExceptionRows": sum(row["status"] == "rule_or_exception" for row in audited),
        "uncertainRows": sum(row["status"] == "uncertain" for row in audited),
        "pdfStreetKeysMissingFromExistingCode": sorted(pdf_names - current_names),
        "existingCodeKeysNotMatchedInPdf": sorted(current_names - pdf_names),
        "rows": audited,
    }
    args.audit.parent.mkdir(parents=True, exist_ok=True)
    args.audit.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    generated_districts: dict[str, set[str]] = defaultdict(set)
    for (street_key, district) in generated:
        generated_districts[street_key].add(district)
    # A row classified as "simple" in isolation may still collide with another
    # page (or reveal an OCR near-match). Such names remain in the audit and are
    # never promoted until a human supplies an explicit split rule.
    safe_generated = {
        key: value
        for key, value in generated.items()
        if len(generated_districts[key[0]]) == 1
    }
    audit["generatedSimpleStreetRows"] = len(safe_generated)
    audit["excludedGeneratedConflicts"] = sorted(
        key for key, districts in generated_districts.items() if len(districts) > 1
    )
    args.audit.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    items = sorted(safe_generated.values(), key=lambda row: (str(row["street"]).casefold(), str(row["bydel"])))
    lines = [
        'import type { RawStreetRow } from "../types";',
        "",
        "/** High-confidence single-district rows audited from every PDF table row. */",
        "export const PDF_SIMPLE_STREET_ROWS: readonly RawStreetRow[] = [",
    ]
    for item in items:
        street = json.dumps(item["street"], ensure_ascii=False)
        district = json.dumps(item["bydel"], ensure_ascii=False)
        lines.append(f"  {{ street: {street}, bydel: {district} }}, // PDF p. {item['pdfPage']}")
    lines.extend(["] as const;", ""])
    args.generated.parent.mkdir(parents=True, exist_ok=True)
    args.generated.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({key: audit[key] for key in audit if key != "rows"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
