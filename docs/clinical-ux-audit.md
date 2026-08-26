# Clinical UX architecture audit

This audit describes the current AmbuAssist working tree before the clinical UX consolidation. The verified Copenhagen routing data and clinical calculation semantics are treated as fixed inputs.

## Destination / visitation

- Primary route: `app/tools/destination.tsx`.
- Supporting UI/data: `src/features/destination/ui.ts`, typed Copenhagen street/range/parity routing in `src/domain/destination`, bundled visitation data in `src/data`, hospital phone lookup in `src/dev/hospitalNumbers.ts`, Firestore-backed reference/contact services, and `src/ui/CollapsibleCard.tsx`.
- State currently combines area/category selection, GPS/reverse-geocode lifecycle, manual street search, house number, postcode, ambiguous-side recovery, manual hospital override, selected contact, and development diagnostics in one screen.
- The routing engine is already shared by GPS and manual search. GPS uses accuracy-derived confidence and absolute request IDs/timeouts. Manual street matching preserves safe failure for unresolved parity/range/postcode cases.
- Main UX issue: area/category, GPS state, address correction, manual hospital selection, result, contacts, and explanatory detail are all peers in one long scroll. A valid result appears after manual alternatives instead of becoming the dominant action. GPS precision and routing detail are shown before the destination.
- Safe consolidation: preserve all state and routing calls; progressively disclose address correction/manual override; move the destination/contact result ahead of alternatives; keep confidence/routing diagnostics secondary; accept alphanumeric house-number display while passing only its numeric component to the existing resolver.

## Cardiac arrest

- Routes: `app/tools/assessment-tools/cardiac-resus/index.tsx`, `session.tsx`, and `summary.tsx`.
- Domain: `src/domain/cardiac-resus/session.ts`; presentation labels/visible actions: `src/features/cardiac-resus/presentation.ts`; modal surface: `ActionOverlay.tsx`; local persistence: `src/services/cardiacResusStorage.ts`.
- State is a versioned local `ArrestSession` with immutable timestamped events. Elapsed time, CPR-cycle phase/number, pre-charge cue, and adrenaline elapsed/reminder are derived from absolute timestamps, so interval suspension does not create clinical-time drift.
- Events cover start/end, rhythm checks, shock with VF/pVT metadata, CPR/cycle markers and resets, adrenaline and timer reset, amiodarone, airway, ROSC, MORS, transport/physician events, and notes. The active screen exposes shock, adrenaline, amiodarone, ROSC, MORS, and note.
- Active drafts and latest ended session are stored only in AsyncStorage. Navigation back/return reloads the active draft; summary can resume an ended session. No remote or location logging is involved.
- Existing protections: outcome/end/cycle/adrenaline-reset confirmation and explicit active-session clearing confirmation. Existing weaknesses: rapid taps can append duplicates; independent asynchronous saves can finish out of order; `correctedEventId` is parsed but no correction operation exists; corrected events would still be counted; foreground return relies on the next interval tick; event history has no safe correction action.
- Safe hardening: domain-level duplicate suppression for identical rapid manual events; append-only correction events that mark the latest eligible event corrected; summaries/timers ignore corrected events; serialized persistence writes; foreground refresh; an explicit confirmed “correct latest event” action. No clinical recommendation or medication rule changes.

## Assessment inventory

| Tool | Current component | Inputs / steps | Logic and branching | Existing edit UX | Migration decision |
|---|---|---|---|---|---|
| NIHSS | `src/features/assessment-tools/NihssContent.tsx` | 15 single-choice scored items | Sum; existing severity bands | Any card can be changed in a long list | Migrate to shared fixed flow |
| PreSS | `src/features/assessment-tools/PressContent.tsx` | 7 yes/no items (4 + 3) | Separate part scores; part 1 positive at >=1 | Any card can be changed in a long list | First representative migration |
| HINTS | `src/features/assessment-tools/HintsContent.tsx` | Up to 3 decisions on an applicable path (4 possible question nodes) | Rule-based graph with six results | Bespoke next/back/history | Migrate to shared branching state and shell; preserve graph/results |
| CFS | `src/features/assessment-tools/CfsContent.tsx` | 9 described frailty levels | Selected level is result | Direct level selection | Keep level browser; adopt shared result/review language only where useful |
| BVC | `src/features/assessment-tools/BvcContent.tsx` | 6 boolean findings | Count; 0 low, 1–2 moderate, >=3 high | Toggle checklist in one card | Migrate to six yes/no steps |
| ABC-STAMP | `src/features/assessment-tools/AbcStampContent.tsx` | 7 domains, 3 choices each | Completion/documentation, no synthetic score | All domain cards editable | Migrate to seven single-choice steps |
| APGAR | `src/features/assessment-tools/ApgarContent.tsx` | 5 items, 0–2 each | Sum 0–10; existing interpretation | Long list, live result | Migrate to shared fixed flow |
| FLACC | `src/features/assessment-tools/FlaccContent.tsx` | 5 items, 0–2 each | Sum 0–10; existing severity bands | Long list, live result | Migrate to shared fixed flow |
| Wells DVT | `app/tools/assessment-tools/wells-dvt.tsx` | 10 boolean criteria | Existing extracted scoring/classification domain | Toggle checklist | Migrate to ten yes/no steps while retaining domain calculator |
| Spinal trauma | `app/tools/assessment-tools/spinal-trauma.tsx` | Up to 3 yes/no decisions | Bespoke conditional graph with three outcomes | Bespoke next/back/history | Migrate state/navigation to shared branching foundation; retain result content |
| NEWS2 | `app/tools/assessment-tools/news2.tsx` | 5 numeric vitals + oxygen, SpO2 scale, AVPU | Extracted multi-parameter scoring and escalation | Simultaneous form with live result | Do not migrate: cross-checking vitals together is operationally useful |
| Blood-gas acid/base, infection, patterns | `app/tools/assessment-tools/bloodgas/*` | Numeric blood-gas form plus infection flags | Calculators/pattern matching | Simultaneous form | Do not migrate: numeric form/calculator rather than serial questionnaire |
| Burns | `app/tools/brandsaar.tsx` | Age group, multi-select body zones or manual TBSA, weight | TBSA/fluid calculation | Diagrammatic multi-select + numeric form | Do not migrate: tool-specific spatial/multi-input UX |
| Thrombolysis responsibility | `app/tools/trombolysis.tsx` | Current operational date/time | Date-parity hospital lookup and phone action | Automatic lookup | Do not migrate: not an assessment questionnaire |
| Cardiac arrest | `app/tools/assessment-tools/cardiac-resus/*` | Timestamped events | Event/timer workflow | Purpose-built active-session UI | Do not migrate: high-frequency event logger, addressed separately |

## Reusable foundation

The repository already provides `Card`, `Title`, `Subtle`, `PrimaryButton`, `Input`, `Screen`, `CollapsibleCard`, theme tokens, haptics, and reference/source loading. The new layer should be limited to:

1. A pure typed flow state reducer for fixed and conditional paths.
2. A hook wrapping those pure transitions.
3. Shared question/progress/answer/result/review controls using existing theme primitives.
4. Tool definitions and clinical evaluators kept outside generic buttons.

The flow state must key every transition to the currently displayed step, which makes stale rapid taps no-ops. Back navigation retains the current answer. Changing an earlier answer truncates downstream history and removes answers that are no longer reachable. Restart returns to the definition's first step.
