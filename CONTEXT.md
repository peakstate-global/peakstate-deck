# Domain language

One word, one meaning. Use these terms exactly in code comments, docs and tickets.

| Term | Meaning |
|---|---|
| **Deck** | A folder with an `index.html`, built from `slides/*.html` fragments by its `build.py`. |
| **Built-in default** | The look a deck gets with no kit: the Keynote Basic White style held as fallback values in `slides/deck.css`. Not a theme folder. |
| **Brand kit** (kit) | A theme folder outside the clone, under `~/.config/peakstate-deck/themes/<kit>/`: `theme.json`, `colors_and_type.css`, `DESIGN.md`, `rules.md`, `assets/`. Made by first-run setup. |
| **Theme** | The engine's word for the files in a kit that `bin/deck` copies and the exporter reads (`theme.json`, stylesheets, assets). Every kit is a theme; `DESIGN.md` and `rules.md` are what make it a kit. |
| **Active kit** | The kit named in `~/.config/peakstate-deck/config.json`. A new deck uses it unless `--theme` says otherwise. |
| **Brand hooks** | The `--brand-*` CSS variables a kit sets. `deck.css` reads each one and falls back to the built-in default. |
| **First-run setup** | The flow in `reference/setup.md` that runs on the first deck request when the config folder does not exist, or when the user asks to change their brand. It never blocks the deck. |
| **Companion skill** | A separate skill this one uses when it is installed (`narrative-arc`, `sourced`, `draft-eval`, `gen-image`, `peakstate-brief`). If one is missing, say so and continue. |
| **Treatment** | A recurring slide shape (pull quote, stat wall, board, agenda, references, provenance, and so on), styled in `slides/deck.css`. A shape, never a brand mark. |
| **Review layer** | `assets/deck-comments.js`: comments, stars, hides and notes on a built deck, returned as one JSON payload. |
