# Design QA — Hell Listening Bar

- source visual truth path: `/Users/zhiyetang/.codex/generated_images/019f83d4-62d7-7ff3-9b29-73765769d4f7/exec-0eb037dc-977c-49d3-bb6e-cb77240b6e22.png`
- user-directed scene asset: `/Users/zhiyetang/Workspace/zhiyetang.github.io/public/images/hell-listening-bar-v1.webp`
- default implementation screenshot: `/Users/zhiyetang/.codex/visualizations/2026/07/21/019f83d4-62d7-7ff3-9b29-73765769d4f7/hell-implemented-default.png`
- record panel screenshot: `/Users/zhiyetang/.codex/visualizations/2026/07/21/019f83d4-62d7-7ff3-9b29-73765769d4f7/hell-implemented-records.png`
- cocktail panel screenshot: `/Users/zhiyetang/.codex/visualizations/2026/07/21/019f83d4-62d7-7ff3-9b29-73765769d4f7/hell-implemented-menu.png`
- mobile screenshots: `/Users/zhiyetang/.codex/visualizations/2026/07/21/019f83d4-62d7-7ff3-9b29-73765769d4f7/hell-implemented-mobile-default.png`, `/Users/zhiyetang/.codex/visualizations/2026/07/21/019f83d4-62d7-7ff3-9b29-73765769d4f7/hell-implemented-mobile-records.png`, `/Users/zhiyetang/.codex/visualizations/2026/07/21/019f83d4-62d7-7ff3-9b29-73765769d4f7/hell-implemented-mobile-menu.png`
- viewport: 1280 × 720 desktop; 390 × 844 mobile
- state: Hell realm, English, default / record wall open / cocktail menu open / Really Love playing

## Full-view comparison evidence

The source concept and the 1280 × 720 implementation were normalized and inspected together in `/Users/zhiyetang/.codex/visualizations/2026/07/21/019f83d4-62d7-7ff3-9b29-73765769d4f7/hell-qa-full-comparison.png`. The implementation preserves the selected dark listening-bar composition, copper lamp light, left turntable, right leather menu, top realm navigation, right rail, restrained record status, and faint footer. The record wall is intentionally empty in the closed scene per the selected follow-up direction.

## Focused-region comparison evidence

The turntable and record-status region was compared in `/Users/zhiyetang/.codex/visualizations/2026/07/21/019f83d4-62d7-7ff3-9b29-73765769d4f7/hell-qa-focused-comparison.png`. The physical turntable remains the visual anchor, while the HTML status sits below it with the same small-caps/serif hierarchy as Heaven and Earth. Separate browser captures verified the cabinet-backed album view and the two-spread physical cocktail book because those states were added after the selected closed-scene concept.

## Required fidelity surfaces

- Fonts and typography: Geist small caps and Cormorant Garamond display text match the established site system; metadata remains optically light and does not compete with the scene.
- Spacing and layout rhythm: the three interactions are mapped to the actual cabinet, menu, and turntable coordinates. Desktop panels remain inside 1280 × 720; mobile views have no horizontal overflow at 390 × 844.
- Colors and visual tokens: the existing ivory, amber, wine, and near-black tokens are preserved. Panel borders and selection states use restrained copper rather than introducing a new palette.
- Image quality and asset fidelity: the full scene, empty cabinet crop, open leather book, and six album covers are raster source assets. There are no placeholder boxes, custom SVG illustrations, or CSS-drawn product imagery.
- Copy and content: the player uses the supplied `Really Love` audio. Album and drink entries are explicitly labeled temporary until the personal collection is supplied.
- Icons: all controls use the existing Phosphor icon family and the same light/thin weights as the realm navigation.
- States and interactions: record selection, cocktail page forward/back, disabled navigation, close buttons, backdrop close, Escape close, repeat opening, playback/pause, selected states, hover/focus, and reduced-motion fallbacks are implemented.
- Accessibility: dialogs are labeled, focus moves to the dialog surface without leaving a false mouse-focus ring, Escape closes, controls are semantic buttons, images have useful alt text, and mobile targets remain usable.

## Comparison history

1. P2 focus artifact: the first record and menu captures showed a cyan programmatic focus ring on the close button, which was visually louder than the selected copper/ivory system. Fix: focus now moves to the dialog surface while keyboard-visible focus remains available on actual controls. Post-fix evidence: `hell-implemented-records.png` and `hell-implemented-menu.png`.
2. P2 responsive discoverability: the wide scene cannot expose the far-left turntable, center cabinet, and far-right menu as mapped objects in a single portrait crop. Fix: the mobile crop prioritizes the cabinet and turntable and keeps a compact Phosphor martini control for the menu. Post-fix evidence: `hell-implemented-mobile-default.png`; document width equals the 390 px viewport.

## Primary interactions tested

- Record cabinet opened, a different album selected, closed, and opened a second time.
- Cocktail book opened, advanced to spread 02 / 02, and closed with Escape.
- Turntable started the supplied file; the audio element reported `paused: false` and advancing current time, while the UI changed to “Now playing” / “Pause Really Love.”
- Desktop and mobile browser consoles reported no errors.
- Production TypeScript/Vite build passed.

## Findings

No actionable P0, P1, or P2 findings remain.

## Follow-up polish

- P3: replace the temporary six-record and eight-drink sample data after the personal collection lists are provided.

final result: passed
