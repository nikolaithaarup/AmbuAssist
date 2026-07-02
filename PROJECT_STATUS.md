# AmbuAssist Project Status

Last updated: 2026-07-02

## Current baseline

AmbuAssist is an Expo 54 / React Native application using Expo Router, TypeScript in strict mode, Firebase/Firestore, AsyncStorage, and Danish/English translations.

Current verified baseline:

- `npm test -- --runInBand`: 23 test suites and 394 tests passing
- `npx tsc --noEmit`: passing
- Jest 29 is configured through the `jest-expo` preset
- Test, watch, and coverage scripts are available in `package.json`
- GitHub Actions CI is configured for tests and strict TypeScript checks and is required on `main`
- The tests are characterization and regression coverage; they do not replace independent clinical validation

## Extracted domain modules

### Medication

- `src/domain/medication/units.ts`: dose-unit definitions and compatible mass-unit conversion, with IE kept separate from mass units
- `src/domain/medication/calculations.ts`: weight-based dose, maximum-dose capping, concentration/volume, and IE calculations
- Integrated into the settings and weight/joule/dose feature

### Paediatric calculations

- `src/domain/paediatric/weight.ts`: APLS 1-5, APLS 6-12, and configurable linear weight formulas
- `src/domain/paediatric/joules.ts`: weight-based joule calculation, including the existing 120 J cap and cap indicator
- Integrated into the settings and weight/joule/dose feature

### Burns

- `src/domain/burns/constants.ts`: adult/child body-zone percentages, fluid thresholds, and Modified Parkland multiplier
- `src/domain/burns/calculations.ts`: TBSA summation, threshold evaluation, fluid total, 8/16-hour split, and hourly rates
- Integrated into the burns screen

### NEWS2

- `src/domain/news2/scoring.ts`: respiratory rate, systolic blood pressure, heart rate, temperature, SpO2 scales 1/2, supplemental oxygen, and consciousness scoring
- Calculates the total, detects an individual score of 3, and classifies escalation guidance
- Integrated into the NEWS2 screen

### Destination routing and hospital resolution

- `src/domain/destination/types.ts`: shared destination, municipality, category, street, and hospital-code types
- `src/domain/destination/routing.ts`: postcode, geocoder alias, municipality, district, and street-side routing helpers
- `src/domain/destination/resolution.ts`: pure city/region category-to-hospital-code resolution
- Compatibility re-exports remain under `src/features/destination`; the destination screen uses the extracted resolver

### Blood gas

- `src/domain/bloodgas/acidBase.ts`: acid/base interpretation, compensation classification, and severity codes
- `src/domain/bloodgas/patterns.ts`: blood-gas pattern detection
- `src/domain/bloodgas/infection.ts`: infection-related findings and suggestions
- `src/domain/bloodgas/engine.ts` and `types.ts`: the basic analyzer and shared input/output types
- The three specialist blood-gas screens use the extracted modules; `src/logic/bloodgasEngine.ts` remains as a compatibility re-export for the basic analyzer

### Supporting pure feature logic

- `src/features/bloodgas/helpers.ts`: numeric blood-gas form parsing
- `src/features/weight-joule-dose/utils`: parsing, formatting, and state helpers

## Runtime data validation

Visitation data now has runtime schema validation through Zod in `src/services/visitationSchema.ts`.

- Firestore-loaded visitation payloads are validated before the app uses or caches them.
- Cached visitation payloads are validated before use through the same schema.
- Validation covers the payload structure, category keys, hospital codes, maps, and street sample rows.
- Valid remote data is used and replaces the cache.
- Invalid remote data is rejected and cannot overwrite a known-good cache.
- Fallback order is: valid remote data → valid cached data → bundled local visitation data.
- Tests characterize valid payloads, malformed payloads, preservation of assignments, cache fallback, bundled-data fallback, and whether a cache write is permitted.

## Runtime validation and fallback coverage

- Runtime validation is implemented for visitation data, support numbers, and clinical references.
- Remote and cached payloads are validated before use.
- Invalid remote data cannot overwrite known-good cached data.
- Offline and fallback characterization tests cover valid remote data, malformed payloads, cached data, and bundled fallback data.

## Product and UX progress

- Home screen redesign completed with the AmbuAssist dark premium visual system.
- Favourites system implemented, persisted through AsyncStorage, and synchronized between tool-page stars and the Home favourites section.
- Blood Gas prelaunch gate implemented with persisted acceptance and Danish/English warning content.

## Completed milestones

1. Added Jest/Jest Expo test infrastructure and test, watch, and coverage commands.
2. Established regression coverage for medication, paediatric, burns, NEWS2, destination, and blood-gas behavior.
3. Extracted medication units and calculations from UI/state code.
4. Extracted paediatric weight and joule calculations.
5. Extracted burns calculations and connected the screen to them.
6. Extracted NEWS2 scoring and escalation classification and connected the screen to them.
7. Extracted destination routing types/helpers and final hospital resolution and connected the destination screen to the resolver.
8. Extracted acid/base, pattern, infection, and basic blood-gas logic and connected the specialist screens to the new modules.
9. Refactored the weight/joule/dose feature into a screen, hooks, components, and utilities backed by domain calculations.
10. Preserved a passing strict TypeScript baseline after the extraction work.
11. Extracted Wells DVT criterion scoring, totals, and two-/three-tier classifications, including the score-2 boundary behavior.
12. Added GitHub Actions CI for pushes and pull requests using Node 22, npm caching, clean installation, tests, and strict TypeScript checks.
13. Added Zod runtime validation and safe remote → cache → bundled-data fallback for visitation data.
14. Added runtime validation for support numbers and clinical references.
15. Added offline and fallback characterization tests for remote-backed data.
16. Completed the Home screen redesign and synchronized persisted favourites across Home and tool pages.
17. Added the persisted Blood Gas prelaunch warning gate while preserving tested clinical behavior.

## Remaining technical debt

### Clinical safety and data integrity

1. Add independently reviewed clinical fixtures for every scoring and calculation engine, including all threshold boundaries and invalid-input behavior.
2. Define clinical-content ownership, source/version metadata, review dates, approval, rollback, and audit procedures.
3. Add runtime schema validation for any remaining remote-data boundaries, including hospital phone numbers and their cached payloads.
4. Verify cold-start, offline, stale-cache, malformed-data, denied-location, and fallback behavior.
5. Add integrity tests for every bundled destination table, hospital code, and translation/source reference.

### Architecture and maintainability

1. Remove the remaining blood-gas compatibility layer once all consumers use `src/domain/bloodgas` directly, and confirm there is only one behavior path per tool.
2. Continue reducing large route components, especially `app/tools/destination.tsx`, while preserving tested behavior.
3. Consolidate duplicate/legacy destination data and confirm whether root legacy entry files can be removed.
4. Reduce broad `any` usage in translation keys, remote-data normalization, destination code, and shared UI props.
5. Split translations by feature while preserving strict key typing and add Danish/English parity tests.

### Delivery and quality tooling

1. Add ESLint and formatting checks.
2. Add React Native component tests for loading, error, offline, reset, and fallback states.
3. Add privacy-conscious diagnostics for backend validation failures and fallback activation.
4. Audit accessibility, dynamic text sizing, touch targets, contrast, and screen-reader behavior.
5. Review dependency health: the current install reports 37 audit findings (3 low, 26 moderate, 7 high, and 1 critical) before assessing safe upgrades and Expo compatibility.

### Known behavior ambiguities

- Destination street rows contain `from` and `to` fields, but routing does not evaluate house-number ranges; it only applies odd/even side selection.
- Requesting a street side with no matching row currently returns `still_ambiguous`, not `not_found`.
- Some postcode/geocoder mappings intentionally choose a default official district where the destination matrix is more granular; these defaults need product and clinical review.

## Remaining UX roadmap

1. Build a shared `NumberInput` component for consistent numeric entry, validation feedback, units, and keyboard behavior.
2. Continue tool-page polish while preserving clinical behavior and the shared visual system.
3. Add Blood Gas OCR import after the manual-entry prelaunch workflow is validated; OCR must require explicit value review before analysis.
4. Complete an accessibility audit covering screen readers, dynamic text, contrast, focus order, and touch targets.

## Recommended next steps

1. Extend runtime schemas and last-known-good fallback tests to any remaining remote boundaries, including hospital phone numbers.
2. Have a designated clinical reviewer approve the medication, paediatric, burns, NEWS2, Wells DVT, destination, and blood-gas fixtures and sources.
3. Add destination-table integrity tests and decide the intended house-number/range behavior before changing routing.
4. Add component-level tests around the highest-risk loading, malformed-data, offline, stale-cache, and reset flows.
5. Add privacy-conscious observability for validation failures and fallback activation without logging clinical or user-sensitive data.
6. Audit dependencies, prioritize the critical/high findings, and upgrade only with tests and Expo compatibility checks.

The preferred working sequence remains: characterize current behavior, extract pure logic without changing it, verify tests and TypeScript, obtain clinical review, and treat clinical-rule changes as separately approved work.
