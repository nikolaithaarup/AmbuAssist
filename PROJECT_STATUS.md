# AmbuAssist Project Status

Last updated: 2026-07-01

## Current baseline

AmbuAssist is an Expo 54 / React Native application using Expo Router, TypeScript in strict mode, Firebase/Firestore, AsyncStorage, and Danish/English translations.

The current verification baseline is:

- `npm test -- --runInBand`: 8 suites and 138 tests passing
- `npx tsc --noEmit`: passing
- Jest 29 configured through the `jest-expo` preset
- Test, watch, and coverage scripts available in `package.json`

## Extracted domain modules

### Medication

- `src/domain/medication/units.ts`
  - Dose-unit definitions
  - Conversion to milligrams
  - Conversion between compatible mass units
  - Explicitly prevents conversion of IE as a mass unit
- `src/domain/medication/calculations.ts`
  - Weight-based dose calculation
  - Maximum-dose capping
  - Concentration and volume calculation
  - Separate IE calculation path

The weight/joule/dose screen consumes these modules while retaining UI parsing and formatting responsibilities.

### Paediatric calculations

- `src/domain/paediatric/weight.ts`
  - Existing APLS 1–5 formula
  - Existing APLS 6–12 formula
  - Existing configurable linear formula
- `src/domain/paediatric/joules.ts`
  - Weight-based joule calculation
  - Existing 120 J cap and cap indicator

### Burns

- `src/domain/burns/constants.ts`
  - Adult and child body-zone percentages
  - Adult and child fluid thresholds
  - Modified Parkland multiplier
- `src/domain/burns/calculations.ts`
  - Selected-zone TBSA summation
  - Adult/child fluid-threshold evaluation
  - Modified Parkland total
  - First 8-hour and next 16-hour split
  - Derived hourly rates used by the existing UI

### Existing pure logic under test

- `src/features/destination/helpers.ts`
  - Postcode, municipality, district alias, and street routing helpers
- `src/logic/bloodgasEngine.ts`
  - Current basic acid/base, DKA, lactate, UTI, and CRP findings
- `src/features/bloodgas/helpers.ts`
  - Blood-gas form parsing

## Test coverage progress

Current tests cover:

- Medication mass-unit conversions and invalid inputs
- IE non-conversion behavior
- Weight-based medication dosing
- Maximum-dose capping, including exact-boundary behavior
- Medication volume across compatible concentration units
- IE dosing, capping, concentration validation, and volume
- APLS and configurable weight formulas
- Joule calculations, invalid inputs, and the existing 120 J cap
- Adult and child burn-zone TBSA summation
- Adult 20% and child 10% burn-fluid thresholds
- Modified Parkland total, time split, hourly rates, boundaries, and invalid inputs
- Destination postcode and alias mapping
- Street routing, odd/even selection, unknown streets, and current ambiguity behavior
- Blood-gas pH boundaries, DKA pattern, lactate findings, UTI pattern, and CRP threshold
- Blood-gas numeric form parsing

Tests are currently characterization and regression tests. They preserve the application’s existing behavior; they are not a substitute for independent clinical validation of formulas, thresholds, source material, or expected outcomes.

### Documented ambiguities

- Destination street rows support `from` and `to` fields, but street routing does not currently evaluate house numbers.
- Requesting a street side for which no matching row exists returns `still_ambiguous`, not `not_found`.
- Blood-gas logic exists both in `src/logic/bloodgasEngine.ts` and in richer screen-local implementations. These paths are not yet unified.

## Remaining technical debt roadmap

### Critical

1. Add independently reviewed clinical fixtures for every scoring and calculation engine.
2. Make typechecking and tests mandatory in continuous integration.
3. Add runtime schema validation for Firestore clinical references, visitation data, and cached data.
4. Define ownership, review dates, versioning, approval, and rollback procedures for clinical content.
5. Verify cold-start, offline, stale-cache, malformed-data, and denied-location behavior.

### High value

1. Extract NEWS2 scoring and guidance classification into a pure domain module.
2. Extract Wells criteria summation and two-/three-tier classification.
3. Extract the richer acid-base, blood-gas pattern, and infection logic currently embedded in screens.
4. Extract final hospital resolution from the destination screen while retaining the tested mapping helpers.
5. Add data-integrity tests for every bundled destination table and hospital code.
6. Incrementally reduce the size of `destination.tsx`, `weight-joule-dose.tsx`, and other large route components after their logic is characterized.
7. Add privacy-conscious diagnostics for backend validation failures and fallback activation.

### Nice to have

1. Add ESLint and formatting checks.
2. Add React Native component tests for loading, error, offline, and reset states.
3. Split translations by feature while retaining one strict key type and adding language-parity tests.
4. Consolidate duplicate destination data and remove confirmed legacy entry files.
5. Add import aliases and contributor documentation.
6. Audit accessibility, dynamic text sizing, touch targets, contrast, and screen-reader behavior.

### Future ideas

1. Signed and versioned clinical-content bundles.
2. A clinical content freshness and review dashboard.
3. Clinician-approved end-to-end regression scenarios.
4. Feature flags, staged rollout, and remote content rollback.
5. Automated device-level release smoke tests for iOS and Android.

## Recommended next steps

1. Extract and characterize NEWS2 scoring, including every threshold boundary and SpO2 scale.
2. Extract and characterize Wells scoring, particularly the score-2 difference between two-tier and three-tier classifications.
3. Add CI that runs `npm test -- --runInBand` and `npx tsc --noEmit` on every pull request.
4. Have a designated clinical reviewer approve the medication, paediatric, burns, destination, and blood-gas fixtures now under test.
5. Extract the three screen-local blood-gas engines into stable code-based results, leaving translation in the UI.
6. Add runtime validation and last-known-good fallback tests for remotely managed clinical data.

The safest working pattern remains: characterize current behavior, extract pure logic without changing it, verify tests and TypeScript, and only then consider clinical-rule changes as separately reviewed work.
