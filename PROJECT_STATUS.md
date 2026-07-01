# AmbuAssist Project Status

Last updated: 2026-07-02

## Current baseline

AmbuAssist is an Expo 54 / React Native application using Expo Router, TypeScript in strict mode, Firebase/Firestore, AsyncStorage, and Danish/English translations.

Verified from the current checkout on 2026-07-02:

- `npm test -- --runInBand`: 16 test suites and 331 tests passing
- `npx tsc --noEmit`: passing
- Jest 29 is configured through the `jest-expo` preset
- Test, watch, and coverage scripts are available in `package.json`
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

## Remaining technical debt

### Clinical safety and data integrity

1. Add independently reviewed clinical fixtures for every scoring and calculation engine, including all threshold boundaries and invalid-input behavior.
2. Define clinical-content ownership, source/version metadata, review dates, approval, rollback, and audit procedures.
3. Add runtime schema validation for Firestore references, visitation data, support numbers, and cached clinical data.
4. Verify cold-start, offline, stale-cache, malformed-data, denied-location, and fallback behavior.
5. Add integrity tests for every bundled destination table, hospital code, and translation/source reference.

### Architecture and maintainability

1. Extract Wells DVT scoring and both two-tier and three-tier classification from its route component.
2. Remove the remaining blood-gas compatibility layer once all consumers use `src/domain/bloodgas` directly, and confirm there is only one behavior path per tool.
3. Continue reducing large route components, especially `app/tools/destination.tsx`, while preserving tested behavior.
4. Consolidate duplicate/legacy destination data and confirm whether root legacy entry files can be removed.
5. Reduce broad `any` usage in translation keys, remote-data normalization, destination code, and shared UI props.
6. Split translations by feature while preserving strict key typing and add Danish/English parity tests.

### Delivery and quality tooling

1. Add CI that requires tests and TypeScript checks on every pull request.
2. Add ESLint and formatting checks.
3. Add React Native component tests for loading, error, offline, reset, and fallback states.
4. Add privacy-conscious diagnostics for backend validation failures and fallback activation.
5. Audit accessibility, dynamic text sizing, touch targets, contrast, and screen-reader behavior.
6. Review dependency health: the current install reports 37 audit findings (3 low, 26 moderate, 7 high, and 1 critical) before assessing safe upgrades and Expo compatibility.

### Known behavior ambiguities

- Destination street rows contain `from` and `to` fields, but routing does not evaluate house-number ranges; it only applies odd/even side selection.
- Requesting a street side with no matching row currently returns `still_ambiguous`, not `not_found`.
- Some postcode/geocoder mappings intentionally choose a default official district where the destination matrix is more granular; these defaults need product and clinical review.

## Recommended next steps

1. Add CI for `npm test -- --runInBand` and `npx tsc --noEmit` so the 16-suite/331-test baseline is enforced.
2. Extract and characterize Wells scoring, especially the score-2 difference between two-tier and three-tier classification.
3. Have a designated clinical reviewer approve the medication, paediatric, burns, NEWS2, destination, and blood-gas fixtures and sources.
4. Add schema validation plus last-known-good fallback tests for remotely managed clinical data.
5. Add destination-table integrity tests and decide the intended house-number/range behavior before changing routing.
6. Audit dependencies, prioritize the critical/high findings, and upgrade only with tests and Expo compatibility checks.
7. Add component-level tests around the highest-risk loading, invalid-data, offline, and reset flows.

The preferred working sequence remains: characterize current behavior, extract pure logic without changing it, verify tests and TypeScript, obtain clinical review, and treat clinical-rule changes as separately approved work.
