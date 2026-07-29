# Visitation Byen PDF audit

Source: `Visitation Byen.pdf`, revised 15 January 2025. Pages 2–61 were rendered
and every one of the 1,982 physical table rows was extracted. The repeatable
OCR/grid tools live in `scripts/`; the complete row ledger is
`docs/visitation-byen-pdf-audit.json`.

## Result used by the app

- 1,471 normalized Copenhagen street keys are bundled.
- 68 multi-district streets have typed number/parity/postcode rules.
- 11 streets are explicitly unresolved and always fail safely.
- 811 high-confidence, single-district PDF rows are generated from the audit.
- Existing manually transcribed rows remain authoritative when present.
- Exact duplicate rules are removed; contradictory overlaps are rejected by
  the integrity test.

The OCR comparison found 1,460 candidate canonical PDF keys. Because the PDF is
image-only, 737 physical rows remain marked `uncertain` in the machine ledger
(mostly clipped glyphs and multi-line cells). They were not blindly promoted.
The JSON ledger retains 364 PDF-vs-code and 359 code-vs-PDF normalized-key
differences for human review; many are OCR spelling variants or current Danish
address-register corrections. This means the data should not be described as a
perfect human transcription of every glyph in the PDF.

## Explicit unresolved streets

1. Banevolden — named Vesterbro/Valby division, no number boundary.
2. Drejøgade — the printed ranges overlap at nos. 35–36.
3. Folke Bernadottes Allé — Indre By/Indre Østerbro, no boundary.
4. Hf. Aldersro — Ydre Østerbro/Bispebjerg, no boundary.
5. J. C. Jacobsens Gade — Kgs. Enghave/Vesterbro, no boundary.
6. Spiræavej — the Valby/Frederiksberg exception is not unambiguous in the cell.
7. Svaneknoppen — PDF says only Østerbro, while the matrix needs inner/outer.
8. Sølvgade — Indre By/Indre Østerbro, no boundary.
9. Vigerslevvej — no. 180 is a direct-hospital exception, not a district rule.
10. Øster Søgade — Indre By/Indre Østerbro, no boundary.
11. Øster Voldgade — Indre By/Indre Østerbro, no boundary.

## External-region partial rules

Forlandet, Grønnemose Allé, Høje Gladsaxe Vej, Jyllingevej, Mørkhøjvej,
Rebekkavej, Rygårds Allé, Strandvejen, Svanemøllevej, and similar rows only
bundle the number bands explicitly assigned to Byen. Their printed "remainder"
belongs to another CVI/municipality and therefore returns no safe Copenhagen
match instead of inheriting a district.

## Phone-data provenance

The local operational phone list is the exact typed source now shared by the
Firestore seed and runtime fallback. It contains 50 records across nine
hospitals. The PDF street document itself does not publish those numbers, so a
clinical owner must revalidate the specialty numbers before release even though
they were already the project's Firestore seed. No number was invented.
