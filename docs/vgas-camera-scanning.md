# VGAS camera scanning – implementation plan

## Scope and safety boundary

Camera scanning must remain an input aid, not an interpretation path. The mandatory flow is:

1. Capture an image.
2. Recognise candidate values and units.
3. Review and edit every detected value.
4. Explicitly confirm the reviewed set.
5. Populate the existing form.
6. Run the existing interpretation.

No OCR candidate may update the form or trigger a calculation before confirmation. Manual entry must always remain available.

The current architecture already supports this separation: screens own `BloodGasFormValues`, input components receive `values` and `onChange`, and clinical functions only receive parsed, validated values. A future adapter should therefore return a structured candidate object and merge it into the existing form only after confirmation. Interpretation code must not import camera or OCR modules.

## Capture support

- **iOS/Android:** evaluate the Expo SDK camera module supported by the app’s current SDK. Request permission only when the user starts scanning, not at app launch.
- **Installed PWA/mobile browser:** use a file input with camera capture where supported; retain gallery/file selection because browser camera behaviour varies.
- **Desktop:** support image upload and, where available, webcam capture. Never make camera access a requirement.
- Handle permission denial, unavailable cameras, and cancelled capture by returning to the unchanged manual form.

## Image preparation

- Present a crop/rotate step before OCR.
- Correct EXIF orientation and allow 90-degree rotation.
- Encourage a tight crop around the analyser display or result table.
- Treat analyser displays and printed reports as separate recognition profiles: displays have glare, segmented glyphs and fixed layouts; reports have tables, labels and possible patient identifiers.

## OCR and privacy

Prefer on-device processing when accuracy and bundle size are acceptable. It keeps images off the network and is the default privacy direction for patient-adjacent material. If remote processing is later required, it needs a separate security review, explicit user disclosure, transport encryption, short retention, deletion guarantees, regional processing, and a design that avoids uploading identifiers whenever possible.

Do not retain source images by default. Crop or mask patient-identifying areas before any optional upload. Do not write images or recognised text to analytics or logs.

## Structured candidate model

The adapter should return candidates keyed by existing `BloodGasFieldKey` values, for example:

```ts
type OcrCandidate = {
  field: BloodGasFieldKey;
  rawText: string;
  normalizedValue?: string;
  detectedUnit?: string;
  confidence: number;
  warnings: string[];
};
```

Map labels and common variants for pH, pCO₂, pO₂, HCO₃⁻, BE, sO₂, lactate, glucose, Na, K, Ca, Cl, urea, creatinine, Hct, Hgb and CRP. Unknown labels stay unassigned for manual review.

## Normalisation and validation

- Accept decimal commas and points, but display the reviewed value using the app’s current locale conventions.
- Detect units before conversion. Convert only supported, unambiguous units and show the conversion to the user.
- Flag omitted decimal separators, confused characters (`O/0`, `I/1`, minus signs), duplicate parameters, missing units and values outside existing plausibility limits.
- Never silently repair an implausible result. Keep it editable and visibly flagged.
- Do not display reference intervals from a report as patient measurements.

## Review UI

Show the cropped image beside the candidate list on wide screens and above it on phones. Each row contains parameter, detected value, detected unit, confidence/warning state and an editable field. Unrecognised text is shown separately and is not imported. The confirm button remains disabled until blocking mapping/unit issues are resolved; users may omit uncertain candidates.

After explicit confirmation, merge only the accepted values into the existing form and let the current field validation and interpretation run normally.

## Delivery phases

1. Collect de-identified test images from supported analyser displays and printed formats.
2. Build an offline recognition spike and measure per-field precision/recall.
3. Implement capture, crop/rotate and the candidate model behind a development-only flag.
4. Add review/confirmation UI and adapter tests; keep interpretation tests unchanged.
5. Validate permissions, denial fallback, rotation, unit conversion, decimal formats and offline behaviour on iOS, Android, installed PWA and desktop browsers.
6. Complete privacy and clinical-safety review before exposing the feature.

No camera dependency, permission request, button, placeholder route or backend service is included in the current UX cleanup release.
