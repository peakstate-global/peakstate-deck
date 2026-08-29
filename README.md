# peakstate-deck

Build a slide deck as one standalone HTML file, review it in a browser, and export it to
PowerPoint with real, editable text.

A deck is a folder with an `index.html` in it. No framework, no bundler, no server. Open the
file and present. The look is a theme you can use, replace or ignore.

## Install

You need three things, and only the first is required to build a deck.

| For | You need |
|---|---|
| Building and presenting a deck | A browser. Nothing else. |
| Exporting to PowerPoint | Python 3.11 or newer with `python-pptx`, and Node with `playwright`. |
| Running the test suite | Node 20 or newer. |

    git clone <this repo>
    cd peakstate-deck

For the PowerPoint exporter:

    python3 -m venv .venv && .venv/bin/pip install python-pptx
    npm install playwright && npx playwright install chromium

The exporter drives a real browser to measure the deck. It looks for `playwright` under
`/tmp` by default. Point `DECK_NODE_ROOT` at the folder where you installed it.

## Build a deck

    python3 bin/deck init ~/my-deck
    cd ~/my-deck
    python3 build.py
    open index.html

`deck init` writes a working deck: a generator (`build.py`), a stylesheet (`deck.css`), one
slide (`slides/01-title.html`), the runtime, and a `BUILD.md` with the commands. The
generator turns every fragment in `slides/` into one `index.html`, in filename order. Add a
slide by adding a file.

To start in the Peak State look instead:

    python3 bin/deck init ~/my-deck --theme peak-state

### Review it

Open `index.html`. Arrow keys move between slides. Two query strings help:

- `index.html?audit` reports which slides overflow the 1920x1080 canvas. "All N slides clean"
  is the pass.
- `index.html?export` dumps the laid-out geometry as JSON. The exporter reads it.

To collect comments from someone else, copy `assets/deck-comments.js` beside the deck and add
`<script src="deck-comments.js"></script>`. `SKILL.md` explains the review loop and the
comment payload it produces.

### Export to PowerPoint

    .venv/bin/python slides/export-pptx.py --deck ~/my-deck/index.html --theme none

The output is a `.pptx` beside the script, with native shapes, editable text, presenter notes
and morph transitions. `--theme <name>` names the PowerPoint layouts and the fonts to embed;
`--theme none` gives neutral names and embeds nothing.

## What is in here

| Path | What it is |
|---|---|
| `bin/deck` | The scaffolder. Standard library only. |
| `slides/deck-stage.js` | The 1920x1080 presentation runtime. Slides are `deck-stage > section`. |
| `slides/deck-tools.js` | `?audit` and `?export`. Nothing runs unless you ask for it. |
| `slides/export-pptx.py` | Turns the `?export` dump into native PowerPoint shapes. |
| `slides/README.md` | The engine's reference: surfaces, treatments, the markup each one wants. |
| `assets/deck-comments.js` | The review layer, for collecting comments on a built deck. |
| `themes/peak-state/` | The Peak State look. Colours, type, treatments, the diamond. |
| `scripts/check-portable.py` | Fails if any file hardcodes an absolute home directory. |
| `tests/` | A Playwright suite for the review layer. `cd tests && npm ci && npm test`. |
| `reference/` | Deeper notes on the payload, the overview screen and the internals. |

Nothing in `slides/` needs a theme. `themes/peak-state/` can be deleted and the engine still
builds, presents and exports.

## Themes

A theme is a folder under `themes/` with a `theme.json` in it:

```json
{
  "name": "peak-state",
  "copy": ["colors_and_type.css", "treatments.css", "assets"],
  "layoutNames": ["PS Dark", "PS Light"],
  "fonts": {
    "faces": ["Spectral", "Inter", "JetBrains Mono"],
    "fallbackFace": "Helvetica Neue",
    "embed": { "Spectral": "Spectral-{}.ttf" }
  }
}
```

`copy` is what `deck init --theme` copies into a new deck. `layoutNames` names the two
PowerPoint layouts the exporter builds. `fonts` tells the exporter which faces to name and
which files to embed.

The scaffolded `deck.css` reads a theme variable first and falls back to a neutral value, so
one stylesheet works with a theme loaded and without one.

## Fonts

**No font files are shipped in this repository.** They are referenced.

The Peak State theme names Spectral, Inter and JetBrains Mono. All three carry the SIL Open
Font License 1.1, confirmed by reading the licence entry in the font binaries themselves, so
redistribution would be permitted. They are referenced rather than shipped to keep the clone
small and to avoid a second, stale copy.

Get them from Google Fonts and put the `.ttf` files where the two readers look:

- The browser reads them through the theme's `colors_and_type.css`, which expects a `fonts/`
  folder beside itself. Without them the deck falls back to a system serif and sans and still
  lays out.
- The PowerPoint exporter reads them from `DECK_FONT_DIR`, then from `fonts/` at the
  repository root. Fonts it cannot find are named in the export summary and skipped.

## Checks

    python3 scripts/check-portable.py     # no absolute home paths anywhere
    cd tests && npm ci && npm test        # the review layer, in a real browser

Both run on every push. See `.github/workflows/check.yml`.

## Where this came from

The engine lived in a Google Drive folder, unversioned, until 29 August 2026. Every fix up to
that date arrived here in the first commit.
