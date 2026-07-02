# AmbuAssist Ecosystem Core

## Purpose

This document defines the reusable product and design DNA demonstrated by AmbuAssist. It is intended to guide related clinical applications, including FlashMedic, without turning them into visual clones.

AmbuAssist is the reference implementation for structure, restraint, interaction quality, and clinical communication. Its exact colours, content, routes, and product-specific workflows are not universal requirements.

When Codex applies this document to another application, it should first preserve that application's clinical behavior, navigation, terminology, and brand identity. The ecosystem rules should then be introduced through shared tokens and reusable components rather than broad one-off styling edits.

## 1. Overall product philosophy

The ecosystem should feel calm under pressure. It exists to help users find, enter, verify, and act on information without competing for their attention.

Core principles:

- Clinical clarity comes before novelty.
- Important information should be easy to scan with one hand and under time pressure.
- The interface should support clinical judgement, never imply that it replaces it.
- Results must expose their meaning, limitations, and source context.
- Common actions should be predictable across tools.
- Visual polish should come from proportion, hierarchy, spacing, and feedback—not decoration.
- Product language should be direct, neutral, and operational.
- Clinical rules, presentation, translations, and remote content should remain architecturally separate.
- The offline or fallback experience is part of the product, not an exceptional afterthought.
- Every app in the ecosystem should feel related, while retaining a distinct purpose and identity.

The desired emotional character is composed, trustworthy, premium, and practical. Avoid both sterile enterprise software and dramatic emergency-themed interfaces.

## 2. Visual identity principles

The shared identity is based on atmosphere and behavior rather than a fixed palette.

- Use a dark, low-glare foundation suitable for clinical environments.
- Build hierarchy with controlled contrast rather than many colours.
- Prefer warm or slightly softened neutrals over pure black and pure white.
- Use thin borders and subtle surface changes to separate content.
- Keep elevation soft and restrained.
- Use rounded geometry consistently, but avoid playful or exaggerated shapes.
- Reserve large visual moments for the home or product-entry experience.
- Keep tool pages quieter and more task-focused than the home screen.
- Use icons only where they improve recognition or interaction; do not decorate empty space with icons.
- Decorative backgrounds should remain subtle, slow-looking, and non-interactive.
- Glass-like surfaces are acceptable when text contrast remains strong and the effect does not obscure hierarchy.
- Avoid bright gradients, high saturation, heavy glow, excessive blur, and ornamental animation.

The interface should still feel complete when all decorative layers are removed. Structure must carry the design.

## 3. UI/UX principles

### Scan first, read second

Users should understand page structure before reading every word. Use a stable sequence:

1. Tool identity and status.
2. Required inputs or primary choices.
3. Primary action, if one is required.
4. Result or interpretation.
5. Supporting findings and considerations.
6. Disclaimer and sources.

### Progressive disclosure

- Show the minimum needed to begin.
- Keep secondary explanation available but compact.
- Place long sources, disclaimers, and supporting information in collapsible sections.
- Do not hide urgent warnings, required fields, or clinical limitations behind disclosure controls.

### Stable mental models

- The same action should look and behave similarly across tools.
- A selected state must remain visually distinct from pressed, focused, disabled, and warning states.
- Preserve user-entered values when navigating within a workflow unless reset is explicit.
- Destructive or irreversible actions require clear wording and, where appropriate, confirmation.

### Clinical neutrality

- Do not use celebratory language for a successful calculation.
- Avoid language that overstates certainty.
- Distinguish observations, interpretations, suggestions, and warnings.
- Never use colour as the only carrier of meaning.

## 4. Colour philosophy

Ecosystem applications should share a semantic colour model, not a single brand palette.

Each app should define tokens for:

- Background base.
- Elevated background or top tone.
- Primary text.
- Muted text.
- Card surface.
- Elevated card surface.
- Card border.
- Divider.
- Brand accent.
- Muted accent.
- Accent surface.
- Pressed surface.
- Normal or reassuring state.
- Caution or abnormal state.
- Danger or urgent state.

Rules:

- The brand accent should be muted enough for repeated use.
- Primary text should be softened slightly from pure white.
- Borders should usually be translucent and low contrast.
- Normal results may use a restrained green or brand-neutral positive tone.
- Amber should indicate caution, incomplete information, abnormal findings, or prelaunch status.
- Red should be reserved for urgent, high-risk, invalid, or destructive states.
- Red must not be used merely to make a result prominent.
- Background and card colours should remain close enough to feel cohesive but different enough to preserve grouping.
- Check colour contrast in real rendered states, including glass or translucent surfaces.

AmbuAssist uses warm olive-green accents. Other apps should choose an accent that fits their own identity while preserving the same semantic roles and restraint.

## 5. Typography and hierarchy rules

Use a compact type scale with clear role separation.

Recommended roles:

- Product or hero title: used sparingly on home or onboarding.
- Page title: the primary tool name.
- Section title: separates major task areas.
- Card title: identifies a contained function or result.
- Body: operational instructions and explanations.
- Label: input names and compact row headings.
- Caption/helper: units, secondary context, metadata, and source summaries.
- Semantic label: short uppercase or strongly weighted labels such as `WARNING` or `PRIMARY INTERPRETATION`.

Rules:

- Use weight and spacing before increasing font size.
- Page titles should be prominent but not consume excessive vertical space.
- Body copy should have comfortable line height.
- Keep long clinical text left-aligned.
- Avoid centred text except for brief hero, empty, or modal states.
- Use tabular or stable-width number rendering where changing values must align, when supported.
- Do not reduce source, disclaimer, or validation text below a comfortably readable size.
- Support dynamic type without clipping critical controls.
- Limit uppercase to short semantic labels.
- Avoid using font weight alone to communicate warning severity.

## 6. Spacing, card, border, and surface rules

Use a small shared spacing scale. AmbuAssist demonstrates the approximate rhythm:

- Extra small: 6 px.
- Small: 10 px.
- Medium: 14 px.
- Large: 20 px.
- Extra large: 28 px.

These values may be adjusted per app, but components should use tokens rather than arbitrary spacing.

### Cards

- Cards represent meaningful groups, not every individual row.
- Use consistent corner radii, generally in the 12–16 px range.
- Default card padding should usually be 14–18 px.
- Use stronger separation between cards than between rows inside a card.
- Nested cards should be rare; prefer dividers or semantic result sections.
- A card should not wrap another pressable card when separate press targets are required.

### Borders and dividers

- Use thin one-pixel borders.
- Borders should be visible without becoming a grid.
- Dividers should be quieter than card borders.
- Focused, selected, invalid, caution, and urgent borders should use semantic tokens.
- Do not combine heavy border, strong fill, and shadow unless the state genuinely requires exceptional emphasis.

### Surfaces and elevation

- Use surface colour changes as the primary elevation cue.
- Shadows should be soft, dark, and subtle.
- Elevation should communicate grouping and interaction, not simulate physical depth.
- Glass or translucent surfaces must have a reliable fallback and sufficient text contrast.

## 7. Interaction feedback rules

Every interactive element should have a visible response.

- Pressed states should appear immediately.
- Prefer a slight opacity, surface, or scale change; keep movement subtle.
- Selected state must persist after the press ends.
- Focused input state should use an accent border and a calm surface change.
- Disabled controls should remain readable but clearly unavailable.
- Loading controls should disable duplicate submission.
- Successful actions may use light haptics, but should not trigger celebratory visual effects.
- Errors should identify what failed and, when possible, what the user can do next.
- Do not use flashing, pulsing, or attention-seeking animation.
- Avoid animation that delays access to clinical information.

Recommended scale feedback is approximately 0.98–0.995 for cards and 0.92–0.98 for compact controls. These are guidelines, not fixed requirements.

## 8. Touch target and accessibility rules

- Interactive targets must be at least 48 × 48 px where practical.
- A visually small control may use hit slop, but adjacent hit areas must not overlap ambiguously.
- Keep independent actions as independent sibling press targets. For example, a favourite star inside a tool row must not trigger the row navigation action.
- Add accessibility roles and labels to custom pressables.
- Expose selected, disabled, expanded, checked, and busy states where applicable.
- Do not rely on colour alone; pair colour with text, symbols, borders, or state labels.
- Preserve logical screen-reader and keyboard focus order.
- Ensure modal gates trap attention appropriately and provide a clear primary and secondary action.
- Support dynamic text and avoid fixed-height containers around clinical copy.
- Test contrast for default, pressed, focused, disabled, selected, and validation states.
- Decorative backgrounds should be ignored by accessibility services.
- Repeated controls should use consistent accessible names.

An ecosystem app is not ready for release until its critical workflows are usable with a screen reader and enlarged text.

## 9. Navigation patterns

### Home

- Establish product identity and immediate access to tools.
- Show favourites only when at least one exists.
- Keep the canonical tool list available regardless of favourite state.
- Preserve stable tool ordering.
- Use cards that clearly distinguish navigation from embedded actions.

### Tool pages

- Use a consistent top bar with back navigation, concise route title, and favourite control where supported.
- The page body may repeat a larger title and subtitle when this improves orientation.
- Keep the favourite control in a stable upper-right location.
- Back should return to the previous context and provide a safe fallback when navigation history is unavailable.
- Avoid deeply nested modal navigation for core workflows.
- Use tabs or segmented controls only for closely related tools sharing one context.
- When a section deserves independent deep linking, sources, or favourite state, prefer a route over a local tab.

### Gates and notices

- Safety, prelaunch, or consent gates should occur at the feature boundary so deep links cannot bypass them.
- Persist acceptance only when appropriate.
- Provide a clear way to go back without accepting.
- Continue to show a compact status chip after acceptance when the status remains relevant.

## 10. Input and form patterns

The shared `NumberInput` pattern in AmbuAssist is the reference for numeric entry.

Numeric inputs should support:

- Visible label.
- Optional unit inside or adjacent to the field.
- Decimal keyboard.
- Local comma and dot entry without rewriting the raw value while typing.
- Clear focus treatment.
- Helper text.
- Validation message.
- Optional clear action.
- Disabled and read-only states.
- Minimum 48 px height.

Rules:

- Keep raw input strings separate from parsed clinical values.
- Parse through shared, tested helpers.
- Do not silently convert malformed input into zero.
- Treat empty, incomplete, and invalid as distinct states where the workflow benefits.
- Show validation close to the relevant field.
- Keep units visible when unit confusion could alter meaning.
- Use `selectTextOnFocus` where rapid replacement is common.
- Do not calculate from an invalid value.
- Preserve existing parsing behavior when migrating mature clinical tools; parsing changes require characterization tests.

General forms should group related fields, keep optional fields visibly optional, and place the primary action after the required inputs.

## 11. Result-card and decision-support patterns

Results should separate different levels of meaning.

Recommended structure:

1. Primary interpretation or calculated value.
2. Supporting findings.
3. Suggested considerations.
4. Warnings or urgent findings.
5. Method, source, or limitation information.

Rules:

- The primary result should be the strongest typographic element in the card.
- Include units alongside calculated values.
- State when a value has been capped, rounded, estimated, or derived from defaults.
- Keep supporting findings in their original deterministic order.
- Use restrained semantic borders or labels rather than filling the entire card with warning colour.
- Green or neutral can represent normal findings.
- Amber represents abnormal, incomplete, uncertain, or cautionary findings.
- Red is reserved for existing urgent/high-risk classifications and invalid states.
- Never infer a new severity category solely for presentation.
- Empty states should explain which values are needed.
- A result card must not imply diagnostic certainty when the underlying logic is decision support.
- Results should remain understandable without colour.

## 12. Warning and disclaimer patterns

Warnings have different purposes and should not be visually conflated.

### Inline validation

Used for malformed or missing input. Place directly below the field and use concise corrective language.

### Clinical caution

Used for limitations, abnormal findings, or verification reminders. Use amber or a neutral caution surface.

### Urgent warning

Used only when the existing clinical rules explicitly identify urgent or high-risk findings. Use red sparingly and include explicit text.

### Product-status warning

Used for prelaunch, incomplete, or under-development tools. Gate entry when required, persist acceptance when appropriate, and retain a compact status chip.

### General disclaimer

- Keep a concise summary visible.
- Place full wording in a collapsible, accessible section.
- Position it after the core workflow unless acknowledgement is required before use.
- Explain what the tool does not replace.
- Reference local guidance, clinical judgement, and escalation appropriately.
- Do not use disclaimers to compensate for unclear or unsafe interaction design.

## 13. Favourites and personalisation patterns

- Favourites must use one shared persisted state across home and tool pages.
- Normalize route identifiers before storage and comparison.
- Treat trailing slashes and equivalent paths consistently.
- Show an empty star for not favourite and a filled star for favourite.
- Toggling a star inside a navigation card must not open the card.
- Favourite cards may use a more compact presentation, such as title only.
- Hide the favourites section when empty.
- Preserve canonical product ordering unless the product explicitly supports user reordering.
- Apply optimistic updates while protecting user actions during persistence hydration.
- Personalisation should reduce friction, not hide tools or alter clinical behavior.
- Keep stored personalisation non-clinical unless a separately reviewed requirement permits otherwise.

## 14. Haptics and feedback principles

Haptics should reinforce completed intent, not demand attention.

Appropriate uses:

- Opening a tool.
- Favouriting or unfavouriting.
- Successful calculation or completed assessment.
- Reset action.
- Confirmed primary action.

Rules:

- Prefer light or selection-level feedback.
- Do not fire repeatedly during text entry or every rerender.
- Trigger success feedback only when a result transitions from unavailable to valid, not continuously while valid.
- Do not use strong haptics for routine navigation.
- Haptics should complement visible feedback and never be the only confirmation.
- Fail gracefully on platforms without haptic support.
- Avoid stacking multiple haptic events for one user action.

## 15. What other apps should copy

Other ecosystem apps should copy:

- The calm, low-glare visual posture.
- The semantic token model.
- The separation between domain logic and presentation.
- Thin borders, restrained surfaces, and consistent spacing.
- Stable tool-page headers and large touch targets.
- Independent favourite and navigation controls.
- Shared persistence with normalized identifiers.
- Raw-string numeric entry with tested parsing.
- Structured result hierarchy.
- Compact, accessible source and disclaimer sections.
- Explicit offline, fallback, invalid, and empty states.
- Light, intentional haptic feedback.
- Characterization tests before changing mature behavior.
- The principle that clinical thresholds and UI semantics are changed separately.

Copy the discipline and system, not the screenshots.

## 16. What other apps should not copy

Other apps should not automatically copy:

- AmbuAssist's olive-green palette.
- Its logo, imagery, or exact background treatment.
- Its route names or tool taxonomy.
- Its clinical formulas, thresholds, hospital mappings, or source wording.
- Its Danish/English terminology without domain review.
- Product-specific medication defaults or persistence keys.
- The exact home layout when another app has a different primary task.
- Prelaunch gates for fully validated features.
- Existing implementation debt, including oversized route files, duplicated source components, and monolithic translations.
- Any `UNKNOWN`, placeholder, partial-region, or under-review clinical content.
- Exact pixel dimensions without testing the target platform and content.

Do not reproduce accidental implementation details as ecosystem standards.

## 17. FlashMedic adaptation guide

FlashMedic should feel like a sibling product: recognizably built from the same design discipline, but clearly its own application.

### Preserve FlashMedic identity

- Keep the FlashMedic name, logo, primary brand colour, and product voice.
- Derive a muted clinical accent from its existing palette rather than importing AmbuAssist olive.
- Build FlashMedic-specific background, card, border, accent-surface, pressed, normal, caution, and danger tokens.
- Keep semantic green, amber, and red roles consistent, but tune them for contrast against the FlashMedic background.
- Use a distinctive but restrained home background treatment related to FlashMedic's identity.

### Reuse ecosystem structure

FlashMedic should adopt:

- Shared `Screen`, `Card`, `ToolPageHeader`, `NumberInput`, `ResultCard`, `SourceLink`, `ReferenceSections`, and segmented-control patterns.
- A centralized typed tool catalog for home, navigation titles, and favourites.
- One normalized, persisted favourites provider.
- A consistent page sequence of header, inputs, results, and sources.
- Structured result categories and semantic tones.
- The 48 px touch-target minimum.
- Light haptic rules.
- Compact accessible disclaimers.
- Clear offline and fallback states.

### Redesign sequence for Codex

When redesigning FlashMedic, Codex should follow this order:

1. Inventory existing routes, calculations, persistence, translations, and tests.
2. Identify behavior that must remain unchanged.
3. Capture screenshots or inspect the current primary workflows.
4. Define FlashMedic semantic theme tokens without changing screen behavior.
5. Introduce or align shared primitives one at a time.
6. Standardize the global background, screen container, cards, typography, and buttons.
7. Implement a consistent tool header and navigation pattern.
8. Migrate one representative numeric workflow to the shared `NumberInput`.
9. Standardize result, warning, disclaimer, and source presentation.
10. Add favourites only if they fit FlashMedic's product model.
11. Apply restrained interaction and haptic feedback.
12. Verify accessibility, visual hierarchy, tests, and TypeScript after each stage.

### FlashMedic-specific decisions to make first

Before implementation, determine:

- Its primary accent family and dark-background temperature.
- Whether its home screen prioritizes tools, protocols, recent work, or search.
- Whether favourites are appropriate and what constitutes a favouritable destination.
- Which result types are normal, cautionary, urgent, or purely informational.
- Whether any workflow requires acknowledgement gates.
- Which content is remote, cached, bundled, or unavailable offline.
- Whether the brand voice should be more operational, educational, or protocol-focused than AmbuAssist.

The end result should make users think “these products belong to the same trusted ecosystem,” not “FlashMedic has been reskinned to look like AmbuAssist.”

## Implementation checklist

Codex can use this checklist during future redesign work:

- [ ] Existing behavior and clinical logic are characterized before UI changes.
- [ ] App-specific semantic colour tokens are defined.
- [ ] Typography and spacing roles are centralized.
- [ ] Cards, borders, surfaces, and pressed states use shared tokens.
- [ ] Touch targets meet the 48 px target.
- [ ] Navigation and favourite actions have separate press targets.
- [ ] Numeric inputs preserve raw strings and use tested parsing.
- [ ] Empty, invalid, disabled, read-only, loading, offline, and fallback states are explicit.
- [ ] Results separate interpretation, findings, considerations, and warnings.
- [ ] Red is reserved for urgent, destructive, or invalid states.
- [ ] Disclaimers and sources are compact and accessible.
- [ ] Haptics are light, intentional, and non-repeating.
- [ ] Screen-reader labels and states are present.
- [ ] Dynamic text and contrast are checked.
- [ ] Product-specific branding remains distinct.
- [ ] Tests and strict TypeScript pass after the redesign.
