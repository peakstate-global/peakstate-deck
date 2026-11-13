# Design tokens, as built

*The review chrome's own tokens, extracted from `slides/deck-stage.js` and `assets/deck-comments.js`.
What is here is what ships. A deck's look is separate: the built-in default in `slides/deck.css`,
or the user's brand kit.*

## Colour

| Role | Value | Use |
|---|---|---|
| Panel | `#0E0A08` / `#1A1614` | The bar, the overview and the panels that float over a slide |
| Bone | `#F5F0E8` | Text on a panel |
| Muted | `#B5A899` / `#8B8079` | Secondary text and hints on a panel |
| Rust | `#A93D1A` | The one accent. The active state |
| Gold | `#D0B561` | The one signal. Highlights and the toast, used sparingly |

Neutrals are warm. Hairlines and hover fills are bone at 6% to 20%.

## Type

- **Inter**: UI text, 400 to 600, 11 to 15px in the review layer.
- **JetBrains Mono**: counts, slide numbers, quoted text, codes. Letter-spacing .1em where it labels.

## Existing chrome

- The bar: one pill, `rgba(14,10,8,.92)`, 1px border `rgba(245,240,232,.16)`, radius 999px, drop
  shadow. Buttons are 13px Inter 500, radius 999px, hover fills at 12% bone.
- Highlights: painted with the CSS Custom Highlight API, gold at 30% with a gold underline.
- Toast: gold pill, charcoal text, bottom centre.
- Overview: 4-up grid of tiles, each a live scaled slide, with a per-tile button row.

## Motion

Calm only. 180 to 220ms, ease-out. No bounce, no parallax, no scale-press.

## Accessibility

- Every state has a non-colour carrier: a glyph shape, a leading dot, a word, or position.
- Tooltip and `aria-label` spell the state in words on every stateful control.
- Focus stays inside the overview while it is open. Esc returns to the slide you came from.
