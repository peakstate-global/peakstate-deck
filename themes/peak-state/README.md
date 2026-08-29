# Peak State theme

The Peak State Global look for the deck engine. Nothing in `slides/` needs it.

| File | What it is |
|---|---|
| `colors_and_type.css` | Every `--ps-*` colour, the type scale, and the `@font-face` rules. |
| `treatments.css` | Five recurring slide shapes. Needs `colors_and_type.css` loaded first. |
| `deck.html` | A seven-slide example deck in the theme. Open it, or copy slides out of it. |
| `assets/` | The diamond and the logo mark. |
| `theme.json` | The PowerPoint layout names and the font families the exporter uses. |

## Fonts

The theme names three families. **None of them is shipped in this repository.**
All three are licensed under the SIL Open Font License 1.1, so redistribution
would be allowed, but referencing them keeps the clone small.

| Family | Where to get it |
|---|---|
| Spectral | [Google Fonts](https://fonts.google.com/specimen/Spectral) |
| Inter | [Google Fonts](https://fonts.google.com/specimen/Inter) |
| JetBrains Mono | loaded over the network by `colors_and_type.css` |

`colors_and_type.css` looks for the `.ttf` files in a `fonts/` folder beside
itself. Put them there, or symlink the folder. Without them the browser falls
back to a system serif and sans, and the deck still lays out.

The PowerPoint exporter embeds the same faces. It reads them from `DECK_FONT_DIR`
if that is set. See the repository README.
