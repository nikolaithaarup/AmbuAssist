# AmbuAssist visual handoff for FlashMedic

## Purpose and scope

This document describes the visual system in the current AmbuAssist Expo/React Native implementation. It is a design and implementation handoff, not a shared-package proposal. FlashMedic should reproduce the interaction quality and hierarchy while retaining its deep-teal identity, learning-oriented personality, and existing logic.

The current codebase contains both modernized and legacy styling. Use the components identified as modern references; do not infer a system by averaging every screen.

## 1. Current visual architecture

| Area | Current implementation | Notes |
| --- | --- | --- |
| App background | `src/ui/Background.tsx` | Three-stop dark olive gradient; optional decorative home swirls. |
| Safe content frame | `src/ui/Ui.tsx` (`Screen`) | Safe area on left/right/bottom, 18 px inner padding and 14 px gap. |
| Tool navigation bar | `app/tools/_layout.tsx` | Safe-area-aware fixed header, back action, centered route title, optional favourite star. |
| Home and submenu navigation | `src/ui/NavigationCard.tsx`, `app/home.tsx`, `app/tools/assessment-tools/index.tsx` | Primary current navigation-card reference. |
| Tool headers and surfaces | `src/ui/ToolSurface.tsx` | `ToolPageHeader`, `ToolSurface`, `ToolSectionLabel`, `ToolResultRow`, `ToolActionButton`. |
| Base primitives | `src/ui/Ui.tsx` | `Title`, `Subtle`, `Input`, `Row`, `Label`; `Card` and `PrimaryButton` are older baseline primitives. |
| Clinical disclosure sheet | `src/ui/ClinicalDisclosure.tsx` | Compact trigger plus bottom sheet for disclaimer and sources. |
| Assessment interaction | `src/features/assessment-flow/AssessmentFlow.tsx`, `FixedChoiceAssessment.tsx` | Shared state grammar, progress, choices, back, review and restart. |
| Assessment references | `src/features/assessment-flow/AssessmentReferenceCards.tsx` | Adapts assessment reference data to `ClinicalDisclosure`. |
| Destination category picker | `src/features/destination/DestinationCategoryPicker.tsx` | Favourite chips, selected state, search, modal list and per-row favourites. |
| Compact accordion | `src/features/support/AboutSupportScreen.tsx` (`SupportSection`) | Controlled, one-open-at-a-time information rows. |
| Confirmation/action overlay | `src/features/cardiac-resus/ActionOverlay.tsx` | Centered modal-like overlay with iOS keyboard avoidance. |
| Empty/status examples | `src/features/bloodgas/BloodGasPresentation.tsx`, cardiac-resus landing/summary, support numbers and Destination | Dashed waiting surface, muted empty copy, activity indicators, warning/danger surfaces and recovery actions. |

There is no portable design-system package. Reproduce patterns inside FlashMedic rather than importing files across repositories.

## 2. Design tokens

The canonical named tokens are in `src/ui/theme.ts`.

### Color

| Token | Value | Current use |
| --- | --- | --- |
| `text` | `#F0EEE6` | Primary text and high-emphasis values. |
| `mutedText` | `#B8B7AC` | Descriptions, helper copy and metadata. |
| `backgroundBase` | `#10130F` | Root fallback and bottom of the background gradient. |
| `topTone` | `#242A20` | Named top/background tone; `Background` uses the close value `#22281E`. |
| `card` | `rgba(31, 35, 28, 0.84)` | Base legacy cards and disclosure sheet. |
| `cardElevated` | `rgba(38, 43, 34, 0.92)` | Named elevated surface token. |
| `cardBorder` / `border` | `rgba(190, 202, 165, 0.20)` | Low-contrast olive borders. |
| `divider` | `rgba(190, 202, 165, 0.10)` | List and result-row separators. |
| `accent` / `primary` | `#91A96C` | Progress, focus/selection and primary olive accent. |
| `accentMuted` | `#AEBE90` | Chevrons, secondary actions and highlighted labels. |
| `accentSurface` | `rgba(127, 151, 91, 0.16)` | Selected and primary-action fill. |
| `pressed` | `rgba(145, 169, 108, 0.12)` | Shared pressed fill. |
| `ok` | `#99B97A` | Positive/normal status. |
| `warn` | `#DDBD62` | Warnings, development badges and active favourites. |
| `danger` | `#FF7B72` | Errors and destructive actions. |

`Background` uses `LinearGradient` with `#22281E → #171B15 → #10130F`. Home-only swirls are large transparent bordered ellipses using `rgba(145,169,108,0.13)` and `rgba(174,190,144,0.08)`.

`ToolSurface` adds implementation-specific tone fills:

- Default: `rgba(38,43,34,0.72)` with `rgba(190,202,165,0.16)` border.
- Accent/result: `rgba(47,56,39,0.88)` with `rgba(174,190,144,0.26)` border.
- Warning: `rgba(65,57,31,0.48)` with `rgba(221,189,98,0.30)` border.
- Danger: `rgba(66,35,32,0.42)` with `rgba(255,123,114,0.34)` border.

These are real recurring values, not a complete formal semantic-token layer.

### Radius

- Theme default: 14.
- Navigation card: 16.
- Tool surface: 17.
- Tool action button: 15.
- Inputs and older chips: 12.
- Assessment choices and most secondary controls: 14.
- Modal/sheet top corners: 24.
- Badges, progress tracks and decorative rings: 999.

### Spacing

The named scale is `xs 6`, `sm 10`, `md 14`, `lg 20`, `xl 28`. Current modern screens most often use:

- 18 px screen inset (`Screen`).
- 12–14 px between major surfaces.
- 15–16 px surface/card padding.
- 10–12 px internal row/control gaps.
- 6–8 px compact label/helper gaps.
- 24–28 px scroll-content bottom padding.

### Touch targets

- Global practical minimum: 44–48 px.
- Tool header action: 44 × 44 minimum.
- Input: 46 px minimum; modern numeric inputs often use 48 px.
- Navigation-card row: 56 px minimum; 68 px minimum when it has a description.
- Navigation favourite star: 54 × 56; tool-header star: 48 × 48.
- Assessment choice: 54 px minimum.
- Shared action button: 50 px minimum.
- Modal close/source rows: 48 px minimum.
- Destination category rows: 52–54 px.

### Depth and elevation

`NavigationCard`:

- iOS: black shadow, opacity `0.20`, radius `14`, offset `0 × 6`.
- Android: elevation `3`.
- Web: `0 6px 18px rgba(0,0,0,0.22)`.

`ToolSurface`:

- iOS: black shadow, opacity `0.16`, radius `12`, offset `0 × 5`.
- Android: elevation `2`.
- Web: `0 5px 16px rgba(0,0,0,0.18)`.

The older `Card` primitive is heavier: opacity `0.24`, radius `12`, offset `0 × 5`, elevation `3`.

### Transparency and “glass”

AmbuAssist uses translucent RGBA fills over a dark gradient, restrained borders and shallow shadows. It does **not** use `BlurView`, backdrop filters or actual background blur. The appearance is glass-adjacent, not glassmorphism: content behind a surface can influence its color, but it is not optically blurred.

## 3. Typography hierarchy

AmbuAssist uses the platform font; there is no custom font family.

| Role | Approximate implementation |
| --- | --- |
| Home hero | Logo images plus 14 px muted tagline; not a reusable type style. |
| Base page title | `Title`: 30 px, weight 800, letter spacing `-0.4`. |
| Modern tool title | `ToolPageHeader`: 27/32 px, weight inherited from `Title`. |
| Assessment submenu title | 22/27 in Danish, 28/34 in English to accommodate length. |
| Question heading | 22/29 px, weight 800. |
| Card/section title | Commonly 17–19 px, weight 800–900. |
| Body | Theme body is 15 px; operational body copy generally 14–15 px with 20–22 px line height. |
| Helper/secondary | `Subtle`: 13/19 px; modern header subtitle overrides to 14/20. |
| Uppercase section label | 12/16 px, weight 900, letter spacing `0.55`. |
| Result value | 28/34 in assessment results; 34–36 px for NEWS2/Joule; 46 px tabular timer for cardiac arrest. |
| Small metadata | 11–13 px, usually muted and weight 700–900. |

Narrow-screen handling is structural rather than typographic shrinking: `flex: 1`, `flexShrink: 1`, `minWidth: 0`, wrapped rows/chips, `flexBasis: "46%"`, and multi-line centered button labels. Danish labels are allowed to wrap; they are not ellipsized in primary clinical actions. The fixed top-bar title is the exception (`numberOfLines={1}`) because it is navigation chrome.

## 4. Navigation-card system

Reference: `src/ui/NavigationCard.tsx`.

- Container: row, overflow hidden, 16 px radius, 1 px olive border.
- Fill: primary `rgba(38,43,34,0.78)`; secondary `rgba(31,35,28,0.58)`.
- Height: 56 px minimum without description; 68 px with description.
- Content: 17/21 title at weight 800; optional 13/18 muted description at weight 500.
- Geometry: 17 px left padding, 12 px gap, right chevron `›` in muted accent.
- Favourite: a separate 54 px-wide action with `☆/★`; selected star uses warning yellow and accessibility selected state.
- Pressed: subtle olive fill, opacity `0.88`, scale `0.995`.
- Web hover: faint white fill `rgba(255,255,255,0.045)`.
- Focus: border strengthens to `rgba(174,190,144,0.52)` and shares the hover fill.
- Depth: platform-specific shallow shadow/elevation described above.

It feels tappable because the entire card has depth, a directional chevron, responsive fill and a small scale response. It avoids glossy-button styling: there is no bevel, bright gradient, hard highlight or saturated fill.

Conceptual pattern:

```text
┌  NEWS2                                      ›  ☆ ┐
│  Vital parameters → score and escalation       │
└─────────────────────────────────────────────────┘
```

FlashMedic should reproduce the hierarchy and state behavior, not the olive values or AmbuAssist star persistence.

## 5. Tool surface and action system

Reference: `src/ui/ToolSurface.tsx`.

- `ToolPageHeader`: optional warning badge, 27 px title, 14 px subtitle and optional 44 px trailing action.
- `ToolSurface`: 17 px rounded translucent surface with `default`, `accent`, `warning` and `danger` tones.
- `ToolSectionLabel`: small uppercase context label.
- `ToolResultRow`: muted label left, strong right-aligned value, divider and optional 18 px prominent value.
- `ToolActionButton`: 50 px minimum, 15 px radius and `primary`, `secondary`, `call` or `danger` tone; compact mode reduces label size/padding without shrinking the target.

Current usage:

- Hjertestop: action hierarchy, workflow/safety surfaces, timers, event grids, destructive completion and overlay confirmations.
- Destination: modern category picker and strong primary GPS action, but much of the screen still uses bespoke local controls rather than `ToolSurface`.
- Vægt → Joule + Doser: shared header, patient input surface, centered 36 px Joule result, result rows and compact medication sections.
- Trombolyse: accent primary result, prominent hospital/phone, call action and secondary timing surface.
- Support numre: compact contact rows with a fixed 116 px call-action column.
- NEWS2: live accent/warning/danger result first, grouped segments and two-column numeric grid.
- Brandsår: compact RH call surface, preserved two-column TBSA zone selector and collapsed secondary information.
- Spinal trauma: shared page/supplementary surfaces plus shared assessment question/result cards.

Primary information is usually one accent surface, not every card. Supporting data uses default surfaces or divider rows. Warnings and destructive actions reserve their semantic colors for actual risk/action states.

## 6. Inputs and selection controls

### Inputs

`Input` in `src/ui/Ui.tsx` is a dark inset field: `rgba(0,0,0,0.18)`, 12 px radius, 1 px low-contrast border, 12 px horizontal/vertical padding and 46 px minimum height. Numeric tools specify `number-pad` or `decimal-pad`; NEWS2 uses centered 18 px values and 48 px height.

### Segments and chips

- NEWS2 segments: at least 44 × 44, equal growth, 12 px radius. Selected state changes border and fill and exposes `accessibilityState.selected`.
- Destination favourite chips: 46 px minimum, 15 px radius, stronger 1.5 px selected border, selected fill, bold text and a visible `✓`—selection is not color-only.
- Assessment choices: 54 px minimum, 14 px radius, selected accent border/fill, stronger type, optional badge and accessibility selected state.
- Brandsår zones: two-column wrapped controls with label plus explicit percentage and accessibility selected state.
- Favourite stars: glyph changes from outline to filled in addition to color and accessibility state.

### Search and pickers

`DestinationCategoryPicker` combines favourite chips with a bottom sheet. The sheet has a search `Input`, 54 px list rows, a leading `✓` for the selected row, and a separate 52 px favourite star. Search empty state is centered muted copy. The typed clinical categories and persistence are AmbuAssist-specific; the search/list/favourite interaction is adaptable.

Avoid copying `src/features/destination/ui.ts` as a modern reference: its older `chip()` helper has a 40 px minimum and lacks the newer accessibility/selected-state treatment.

## 7. Assessment-flow language

The state engine is in `src/domain/assessment-flow/flow.ts`; React bindings and surfaces are in `src/features/assessment-flow/AssessmentFlow.tsx`.

- One applicable question is shown at a time.
- Step count and percentage are visible above a 6 px progress bar.
- Selecting an answer auto-advances and triggers light haptic feedback.
- Back returns to the prior applicable step.
- A previously selected answer is restored through `selected` state when revisiting.
- Changing an earlier answer truncates the obsolete path and recalculates conditional navigation.
- The result presents a strong score/outcome, interpretation and optional supporting text.
- `Review answers` returns into the flow; `Restart` clears it.
- `FixedChoiceAssessment` supplies the same pattern for linear questionnaires.

Generalize the grammar, not the rule that every experience must be a wizard. It suits sequential decisions and learning questions. Simultaneous numeric entry (NEWS2), spatial selection (TBSA) and dashboards may be faster as compact grouped controls.

## 8. Mobile-first rules

- Design for 44–48 px minimum targets; use 50–56 px for primary and high-pressure actions.
- Keep one strong result/action near the top; do not place long explanatory copy before it.
- Use 12–14 px gaps between major blocks and 6–10 px inside compact groups.
- Wrap chips/actions with `flexWrap`; use `flexBasis` and `minWidth` rather than fixed desktop columns.
- Give long labels `flex: 1`, `minWidth: 0` or `flexShrink: 1`; permit multi-line button text.
- Constrain wide content with `maxWidth` on home/submenus while keeping `width: "100%"`.
- Bottom sheets use `maxHeight: "88%"`, internal scrolling and a 48 px close action.
- `Screen` handles left/right/bottom safe areas. `app/tools/_layout.tsx` calculates top inset plus a 58 px header and pads the route stack accordingly.
- Use `keyboardShouldPersistTaps="handled"` in interactive scroll/sheet content. `ActionOverlay` uses `KeyboardAvoidingView` with iOS padding. Numeric inputs specify appropriate mobile keyboards.
- Prefer divider rows and compact surfaces over a separate large card for every value.
- Check both initial and expanded/completed states for horizontal overflow.

The recent operational browser-review matrix is 320×568, 375×667, 390×844 and 430×932. These viewport values are a review convention, not constants encoded in the app.

## 9. Interaction states

| State | Actual current treatment |
| --- | --- |
| Rest | Translucent dark/olive surface, low-contrast border, white primary type. |
| Hover | Explicit only in `NavigationCard`: faint white fill. Most React Native controls have no custom web hover. |
| Focus | Explicit only in `NavigationCard`: stronger border plus hover-like fill. Do not claim a complete focus system. |
| Pressed | Opacity reduction, subtle fill change and occasionally scale `0.992–0.995`; favourite controls scale more visibly. |
| Selected | Accent border/fill plus checkmark, filled star, stronger type or accessibility selected state. |
| Disabled | Usually opacity `0.5–0.55`; action text may change to an in-progress verb. |
| Loading | `ActivityIndicator`, muted status copy, disabled action and/or retained fallback data. |
| Empty | Muted explanatory copy; blood gas uses a dashed “Awaiting values” surface; cardiac summary gives a recovery action. |
| Error | Danger text or danger surface; some external-operation errors use `Alert.alert`. Cardiac recovery preserves local state and offers explicit retry/clear paths. |
| Warning | Warning surface/border or left rule using `warn`; badges are small and restrained. |
| Success/normal | Accent/`ok` tone, strong result typography and optional haptic success; green is not used decoratively everywhere. |

FlashMedic should add an explicit cross-platform focus-visible treatment if its web experience is important; AmbuAssist currently implements that most completely only for navigation cards.

## 10. Current AmbuAssist visual character

AmbuAssist is a dark, compact clinical interface built from a deep olive gradient, translucent olive surfaces, soft botanical borders, shallow elevation, warm white typography and restrained semantic accents. Rounded 14–17 px geometry gives an iOS-adjacent control feel without heavy glassmorphism. The modernized screens use fewer large containers, one clear primary result/action, compact divider rows and progressive disclosure. Visual emphasis comes from hierarchy, weight and spacing more than saturation.

## 11. Translating the system to FlashMedic

### Preserve from FlashMedic

- Deep teal/dark-gradient product identity.
- Learning and game-oriented personality.
- Existing educational/clinical logic and content model.
- Existing navigation and data ownership unless a UX problem requires change.

### Transfer from AmbuAssist

- Full-row navigation affordance with title, supporting text and chevron.
- Shallow translucent surface hierarchy.
- 14–17 px rounded geometry and soft 1 px borders.
- One visually dominant result/action per screen.
- Primary/secondary/danger action differentiation.
- 44–56 px touch targets and compact mobile spacing.
- Press, hover, focus, selected and disabled feedback.
- Progressive sheets, accordions and result/review patterns.
- Typography hierarchy and long-label wrapping behavior.
- Dense information through rows and dividers rather than nested cards.

### Adapt rather than copy

- Replace olive-tinted surfaces/borders with translucent surfaces derived from FlashMedic’s existing teal family.
- Retain warm or neutral high-contrast text only if it complements FlashMedic’s existing palette.
- Translate AmbuAssist’s clinical restraint into a slightly more encouraging learning tone without adding visual noise.
- Use warning/danger/success colors semantically and verify contrast against the teal background.
- Recreate components locally using FlashMedic tokens; do not hard-code AmbuAssist RGBA values into FlashMedic.

No exact FlashMedic color values are proposed here because they are not present in this repository.

## 12. Anti-patterns to avoid

- Giving every subsection an equally heavy bordered card.
- Using the older `Card` depth everywhere when a divider row or default `ToolSurface` is enough.
- Equal visual weight for primary, secondary, call and destructive actions.
- Large empty result cards before meaningful output.
- Giant vertical forms when a sequential question flow is faster.
- Converting simultaneous numeric/spatial work into a wizard merely for consistency.
- Touch targets below 44 px; specifically, do not port the legacy 40 px `chip()` helper.
- Color-only selection without a checkmark/glyph, type change or accessibility state.
- Heavy blur, bright glass highlights, bevels or office-style glossy buttons.
- Excessive gradients inside controls; the main background gradient is sufficient.
- Long instructional paragraphs above the primary action.
- Multiple independently styled versions of the same button, result or accordion.
- Treating AmbuAssist clinical copy, routing, telephone actions, favourites or haptics as a generic FlashMedic requirement.

## 13. Component portability table

| AmbuAssist component/pattern | File | Purpose | FlashMedic reuse recommendation |
| --- | --- | --- | --- |
| Theme token shape | `src/ui/theme.ts` | Central colors, radius, spacing and type sizes | Adapt concept |
| Dark gradient background | `src/ui/Background.tsx` | Product backdrop and home decoration | Adapt concept to teal |
| Safe screen frame | `src/ui/Ui.tsx` (`Screen`) | Safe-area and consistent content inset | Directly reproduce pattern |
| Navigation card | `src/ui/NavigationCard.tsx` | Tappable menu/submenu row | Directly reproduce pattern, retheme |
| Tools top bar | `app/tools/_layout.tsx` | Safe header, back, title, favourite | Adapt concept |
| Tool header | `src/ui/ToolSurface.tsx` (`ToolPageHeader`) | Compact title, subtitle, badge/action | Directly reproduce pattern |
| Tool surface tones | `src/ui/ToolSurface.tsx` (`ToolSurface`) | Default/result/warning/danger hierarchy | Directly reproduce pattern, retheme |
| Action hierarchy | `src/ui/ToolSurface.tsx` (`ToolActionButton`) | Primary, secondary, call and danger actions | Directly reproduce pattern; omit call if irrelevant |
| Result rows | `src/ui/ToolSurface.tsx` (`ToolResultRow`) | Dense label/value presentation | Directly reproduce pattern |
| Base input | `src/ui/Ui.tsx` (`Input`) | Dark text/numeric field | Adapt concept and focus behavior |
| Assessment state engine | `src/domain/assessment-flow/flow.ts` | Path, back, branching and progress | Adapt concept; do not couple repositories |
| Assessment question/result cards | `src/features/assessment-flow/AssessmentFlow.tsx` | One-question flow and review/restart result | Adapt concept |
| Fixed-choice wrapper | `src/features/assessment-flow/FixedChoiceAssessment.tsx` | Linear score/questionnaire composition | Adapt concept where FlashMedic has quiz flows |
| Clinical disclosure sheet | `src/ui/ClinicalDisclosure.tsx` | Disclaimer/source progressive disclosure | Adapt concept; AmbuAssist content is specific |
| Destination category picker | `src/features/destination/DestinationCategoryPicker.tsx` | Favourite chips plus searchable sheet | Adapt interaction concept only |
| About/support accordion | `src/features/support/AboutSupportScreen.tsx` | One-open-at-a-time compact disclosure | Directly reproduce pattern |
| Action overlay | `src/features/cardiac-resus/ActionOverlay.tsx` | Confirmation/form overlay with keyboard handling | Adapt concept |
| NEWS2 numeric grid | `app/tools/assessment-tools/news2.tsx` | Simultaneous mobile numeric entry with live result | Adapt concept for dense study stats/forms |
| Brandsår zone grid | `app/tools/brandsaar.tsx` | Specialized spatial/multi-select workflow | AmbuAssist-specific |
| Destination routing/results | `app/tools/destination.tsx` | GPS/address clinical destination workflow | Do not port |
| Cardiac session UI | `app/tools/assessment-tools/cardiac-resus/*` | Time-critical clinical workflow | AmbuAssist-specific; borrow hierarchy only |
| Legacy `Card`/`PrimaryButton` | `src/ui/Ui.tsx` | Older generic primitives | Do not use as the leading visual reference |
| Legacy `CollapsibleCard` | `src/ui/CollapsibleCard.tsx` | Older uncontrolled accordion | Do not port; use the support accordion pattern |
| Legacy `chip()` | `src/features/destination/ui.ts` | Older 40 px selected chip | Do not port |

## 14. Conceptual FlashMedic target

```text
FlashMedic

Daily 10
Your daily review

[ Start today's session                         → ]

PROGRESS
24 / 30 cards
████████████████░░░░

Weak topics
[ Pharmacology ] [ ECG ]

Recent activity
Session result                         8 / 10
Card reviewed                          Yesterday
```

Apply the AmbuAssist hierarchy as follows: keep FlashMedic’s dark teal gradient; use one elevated translucent teal surface for the daily-session action; present progress as a compact accent surface or row; render weak topics as wrapped selected-state chips; use divider rows for recent activity; keep the primary action at least 50 px high with clear pressed/focus states. The result should feel related to AmbuAssist through geometry, density and interaction—not through olive branding or clinical-tool imitation.

## Implementation handoff summary

- Reusable system: navigation affordance, surface hierarchy, action tones, touch targets, compact spacing, typography hierarchy, sheets, accordions, selection feedback and assessment grammar.
- AmbuAssist-specific system: olive palette, clinical disclosures/content, Destination routing, telephone actions, favourites storage, cardiac workflows and clinical haptics.
- Leading implementation references: `NavigationCard`, `ToolSurface`, `ToolPageHeader`, `ToolActionButton`, `ToolResultRow`, `ClinicalDisclosure`, the controlled support accordion and the assessment-flow state grammar.
- Legacy references to avoid: ubiquitous `Ui.Card`, `Ui.PrimaryButton` as a final action system, `CollapsibleCard`, `features/destination/ui.ts` chips, and bespoke inline controls that predate the shared surface/action layer.
