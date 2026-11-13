# peakstate-deck

```text
Install the deck skill from https://github.com/peakstate-global/peakstate-deck and set it up for me.
```

Paste that line into Claude Code. "Installing with Claude Code" below is for Claude.

Build a slide deck as one standalone HTML file, review it in a browser, and export it to
PowerPoint with real, editable text.

A deck is a folder with an `index.html` in it. No framework, no bundler, no server. Open the
file and present. With no brand kit a deck uses a clean built-in default look; first-run setup
makes a kit in your own brand.

## Installing with Claude Code

These steps are addressed to Claude. Pick one route, never both: the clone and the plugin
together load the skill twice.

**Route 1, the clone (use this one).**

1. Clone the repository into the skills folder:

        git clone https://github.com/peakstate-global/peakstate-deck ~/.claude/skills/peakstate-deck

2. Tell the user to start a new session (or run `/reload-plugins`), then ask for a deck.
3. The first deck request runs first-run setup (`SKILL.md`, "First-run setup", and
   `reference/setup.md`). Setup offers the default look now or a brand kit first, and never
   blocks the deck.

To update, run `git -C ~/.claude/skills/peakstate-deck pull`.

**Route 2, the plugin.** The repository is also a Claude Code plugin marketplace:

    claude plugin marketplace add peakstate-global/peakstate-deck
    claude plugin install peakstate-deck@peakstate-deck

The plugin folder is replaced on every update, so nothing is written inside it at run time:
decks, their `.pptx` files and the export tools all live elsewhere.

**PowerPoint export prerequisites.** Building and presenting a deck needs only a browser.
Install the export prerequisites when the user first asks for a `.pptx`, not at install time:

| Prerequisite | Used for |
|---|---|
| Python 3.9 or newer with `python-pptx` | Writing the `.pptx`. |
| Node with `playwright` and its Chromium | Measuring the laid-out deck. |
| Google Chrome | Rasterising SVG images. The exporter calls Chrome at its fixed macOS path (`CHROME` in `slides/export-pptx.py`), so SVG rasterising works on macOS only today. |

Install them outside the skill folder:

    DATA="${XDG_DATA_HOME:-$HOME/.local/share}/peakstate-deck"
    python3 -m venv "$DATA/venv" && "$DATA/venv/bin/pip" install python-pptx
    mkdir -p "$DATA/node" && ( cd "$DATA/node" && npm install playwright && npx playwright install chromium )

The exporter finds both folders itself ("Export to PowerPoint", below).

Running the test suite needs Node 20 or newer ("Checks", below).

## Works better with

Each of these is a separate skill. Every one is optional: without it, this skill says it is
missing and carries on. First-run setup offers `gen-image` (step 4 of `reference/setup.md`) and
the first three (step 6).

| Skill | What it adds | Where it lives |
|---|---|---|
| `narrative-arc` | Designs the deck's arc (audience, shift, each section's move) before any slide is written. | `skills/narrative-arc` in [peakstate-global/peakstate-skills](https://github.com/peakstate-global/peakstate-skills) |
| `sourced` | Audits every claim for its source and writes the provenance block. | `skills/sourced` in [peakstate-global/sourced](https://github.com/peakstate-global/sourced) |
| `draft-eval` | Scores a draft deck against a rubric and rewrites its weakest slides. | `skills/draft-eval` in [irama/irama-skills](https://github.com/irama/irama-skills) |
| `gen-image` | Generates slide images, such as an illustration in the kit's style. | `skills/gen-image` in [irama/irama-skills](https://github.com/irama/irama-skills) |
| `peakstate-brief` | The review partner for documents: selection comments and a responses payload, as the review layer gives a deck. | `skills/peakstate-brief` in [peakstate-global/peakstate-skills](https://github.com/peakstate-global/peakstate-skills) |

## Build a deck

    python3 bin/deck init ~/my-deck
    cd ~/my-deck
    python3 build.py
    open index.html

`deck init` writes a working deck: a generator (`build.py`), a stylesheet (`deck.css`), one
slide (`slides/01-title.html`), the runtime, and a `BUILD.md` with the commands. The
generator turns every fragment in `slides/` into one `index.html`, in filename order. Add a
slide by adding a file.

With no brand kit the deck uses the built-in default look: a white surface, bold system sans
and one blue accent. With an active brand kit (see "Brand kits") the deck starts in that kit's
look. To choose for one deck:

    python3 bin/deck init ~/my-deck --theme <kit>      # a kit by name, or a path to its folder
    python3 bin/deck init ~/my-deck --theme none       # the built-in default, whatever is active

### Review it

Open `index.html`. Arrow keys move between slides. Two query strings help:

- `index.html?audit` reports which slides overflow the 1920x1080 canvas. "All N slides clean"
  is the pass.
- `index.html?export` dumps the laid-out geometry as JSON. The exporter reads it.

To collect comments from someone else, copy `assets/deck-comments.js` beside the deck and add
`<script src="deck-comments.js"></script>`. `SKILL.md` explains the review loop and the
comment payload it produces.

### Export to PowerPoint

    python3 slides/export-pptx.py --deck ~/my-deck/index.html

If `python3` lacks `python-pptx`, the exporter re-runs itself under `$DATA/venv`, and it finds
playwright under `$DATA/node`. Set `DECK_NODE_ROOT` to use a different Node folder.

The output is a `.pptx` beside the deck, with native shapes, editable text, presenter notes
and morph transitions. The exporter reads the `theme.json` the deck carries, which names the
PowerPoint layouts and the fonts to embed. A deck with none, or `--theme none`, gets the
built-in default: Inter named and embedded, layouts named Light and Dark for their surfaces.

## What is in here

| Path | What it is |
|---|---|
| `bin/deck` | The scaffolder. Standard library only. |
| `slides/deck.css` | The engine's stylesheet and the built-in default look. Every deck gets a copy. |
| `slides/example.html` | A nine-slide example of the default look. Serve the folder (`python3 -m http.server`) and open it. |
| `slides/deck-stage.js` | The 1920x1080 presentation runtime. Slides are `deck-stage > section`. |
| `slides/deck-tools.js` | `?audit` and `?export`. Nothing runs unless you ask for it. |
| `slides/export-pptx.py` | Turns the `?export` dump into native PowerPoint shapes. |
| `slides/README.md` | The engine's reference: surfaces, treatments, the brand hooks, the markup each one wants. |
| `assets/deck-comments.js` | The review layer, for collecting comments on a built deck. |
| `scripts/check-no-leaks.py` | Refuses a commit carrying an absolute home path, a credential, a private domain or a dead link. Vendored from the `skilltastic` skill. Edit it there, then copy it back. |
| `tests/` | A Playwright suite for the review layer, and `tests/fixtures/kit/`, an example brand kit. `cd tests && npm ci && npm test`. |
| `reference/` | Deeper notes on the payload, the overview screen and the internals. |
| `reference/setup.md` | First-run setup: make a brand kit. |
| `CONTEXT.md` | The words this project uses, defined. |
| `docs/adr/` | Decisions and the reasons for them. |

The repository ships no brand. A deck looks like the built-in default until a brand kit says
otherwise.

## Brand kits

A brand kit is a theme folder outside the clone, in the config folder
(`$XDG_CONFIG_HOME/peakstate-deck`, else `~/.config/peakstate-deck`):

    <config>/
      config.json                 {"active": "<kit name>"}, or {} for "use the default"
      fonts/                      optional; fonts shared by every kit
      themes/<kit>/
        theme.json                name, copy, layoutNames, fonts
        colors_and_type.css       sets the --brand-* hooks, @font-face rules, selector overrides
        DESIGN.md                 the look, in the Google Stitch DESIGN.md format
        rules.md                  house rules beyond the look; wins over SKILL.md
        title.html                optional; the kit's own title slide
        assets/                   logo, marks
          refs/illustrations/     example images (optional)
          refs/icons/             example icons (optional)
        fonts/                    optional; the kit's own font files

`deck init` with no `--theme` uses the active kit named in `config.json`. With none, or with
`--theme none`, it uses the built-in default. A `--theme` value is read as a path only when it
holds a path separator or starts with `~` or `.`; otherwise it names a kit under
`<config>/themes/`. A missing `config.json`, or `{}`, means the default. A 0-byte or invalid one also means the default, with a one-line warning.

**The hooks.** A kit changes the look in two ways. First, its CSS sets any of the 16
`--brand-*` variables, and `deck.css` reads each one before its own default: surfaces
(`--brand-bg`, `--brand-bg-2`, `--brand-bg-3`, `--brand-bg-dark`), text (`--brand-fg`,
`--brand-fg-2`, `--brand-fg-dark`, `--brand-fg-dark-2`), `--brand-accent`, hairlines
(`--brand-hairline`, `--brand-hairline-dark`), fonts (`--brand-font-display`,
`--brand-font-body`, `--brand-font-mono`) and weights (`--brand-weight-title`,
`--brand-weight-body`). The table with each default is in `slides/README.md`. Second, a kit's
stylesheets load after `deck.css`, so a kit overrides any treatment selector at equal
specificity.

**Making a kit.** The normal way is first-run setup (`reference/setup.md`), which runs on the
first deck request, or when you ask Claude to change your brand.

**An example.** `tests/fixtures/kit/` is a complete kit for an invented brand, Tidewell Rowing
Club. Its `theme.json`, without the description line:

```json
{
  "name": "tidewell",
  "copy": ["colors_and_type.css", "assets"],
  "fontsRedistributable": false
}
```

Its `colors_and_type.css` sets eight hooks (deep green surfaces, a coral accent) and overrides
one selector. To try it:

    mkdir -p ~/.config/peakstate-deck/themes
    cp -R tests/fixtures/kit ~/.config/peakstate-deck/themes/tidewell
    python3 bin/deck init ~/tidewell-deck --theme tidewell

**What a deck carries.** `deck init` copies the kit's `copy` list and its `theme.json` into the
deck, and links the copied stylesheets after `deck.css`. It copies `fonts/` too when
`theme.json` says `"fontsRedistributable": true`. A kit's `title.html` is one `<section>`
fragment that becomes the deck's `slides/01-title.html` as written; keep
`<span data-slide-number></span>` in its footer. Without one, the deck gets the built-in title
slide in the kit's colours.

**What the exporter reads.** `layoutNames` names the PowerPoint layouts. Without it each layout
is named Light or Dark for its surface. `fonts` names the faces and the files to embed. The
exporter looks for each font file in `DECK_FONT_DIR`, `fonts/` beside the deck, the kit's own
`fonts/`, `<config>/fonts/`, then `fonts/` at the repository root.

## Fonts

**No font files are shipped in this repository.** They are referenced.

The built-in default uses the system sans in the browser (`-apple-system`, then Inter, then
Helvetica Neue) and names Inter in PowerPoint. Inter carries the SIL Open Font License 1.1.
For the exporter to embed it, put the Inter `.ttf` files in `<config>/fonts/` or in `fonts/`
at the repository root. A font the exporter cannot find is named in the export summary, with
each folder it tried, and skipped; the text still exports.

A brand kit names its own faces in `theme.json` and declares them in its own CSS. Check each
face's licence before you put its files in a kit, and set `"fontsRedistributable": true` only
when the licence allows a copy in every deck.

## Checks

    python3 scripts/check-no-leaks.py --all   # nothing here is unpublishable anywhere
    cd tests && npm ci && npm test        # the review layer, in a real browser

Both run on every push. See `.github/workflows/check.yml`.

## Licence

The code is licensed under the Apache License, Version 2.0. See `LICENSE` and `NOTICE`.
You may use it, change it, and build commercial work on it, including work you sell.

The repository ships no brand assets: no logo, no brand palette, no brand type. The built-in
default look is part of the code. A brand kit you make lives in your own config folder, outside
the clone, and is yours. Section 6 of the licence grants no trademark rights.

Nothing in this file is legal advice.

## Where this came from

The engine lived in a Google Drive folder, unversioned, until 29 August 2026. Every fix up to
that date arrived here in the first commit.

## Publishing

This tool builds, reviews and exports a deck. It does **not** publish one: there is no
service here and nothing to sign up for. Putting a deck online is a private companion skill
of the author's, not part of `peakstate-deck`.
