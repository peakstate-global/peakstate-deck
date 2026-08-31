# Design tokens, as built

*Extracted from `themes/peak-state` and the runtime's own stylesheet. What is here is what ships.*

## Colour

| Role | Value | Use |
|---|---|---|
| Charcoal | `#14100E` / `#1A1614` | The slide surface, and the chrome that floats on it |
| Ember | `#221D19` | A lifted panel on charcoal |
| Bone | `#F5F0E8` | Text on charcoal, and the light slide surface |
| Sand | `#EFE8D9` | The second light surface |
| Sienna | `#A93D1A` | The one accent. Rules, marks, the active state |
| Gold | `#D0B561` | The one signal. At most twice per surface |
| Eucalypt | `#5C6B5A` | Secondary text on light |
| Sandstone | `#C8B89A` | Hairlines on light |

Never `#000` or `#fff`. Neutrals are warm, tinted toward the brand hue.

## Type

- **Spectral** — display and body. Weights 200 to 600. Slide headings are 200 at large sizes.
- **Inter** — UI chrome, 400 to 600, 11 to 15px in the review layer.
- **JetBrains Mono** — labels, eyebrows, codes, build hashes. Letter-spacing .1 to .3em, uppercase.

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
