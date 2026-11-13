# First-run setup: make a brand kit

**Setup turns the user's brand into a brand kit, sets it active and opens a five-slide sample
deck. It never blocks the deck the user asked for.** Read this file when a deck request arrives
and the config folder does not exist, or when the user asks to change their brand.

Two names used throughout:

- **`<config>`** is the config folder: `$XDG_CONFIG_HOME/peakstate-deck`, else
  `~/.config/peakstate-deck`. An empty `XDG_CONFIG_HOME` counts as unset.
- **`<skill>`** is the folder that holds this skill's `SKILL.md`. Resolve it from where the skill
  loaded; never write a fixed path.

## When it runs

- **First run.** A deck request arrives and `<config>/` does not exist.
- **Re-run, at any time.** The user says "change my brand", "set up my brand" or "add a brand
  kit". A re-run makes a new kit beside the old ones; it never edits an existing kit unless the
  user asks.

Deleting `<config>/` resets setup: the next deck request offers it again.

## The offer: three choices in one line

On first run, offer this in one line, then wait for the digit:

> No brand kit yet. 1. Build it now in the clean default. 2. Build it now, and set up the brand
> afterwards. 3. Set up the brand first (about ten minutes).

- **1.** Build the deck in the built-in default. Then write `{}` to `<config>/config.json`
  (`mkdir -p` the folder first), so the offer is not repeated.
- **2.** Build the deck in the built-in default and write `{}` the same way. Then run the steps
  below. The deck already built keeps the default look. To move it onto the new kit, scaffold a
  fresh folder with `bin/deck init`, copy the old deck's `slides/` fragments into it (keep the
  kit's `01-title.html` or the old one, as the user prefers), then build.
- **3.** Run the steps below, then build the deck the user asked for in the new kit.

A setup the user stops part-way leaves the deck and `{}` in place. Nothing else is written until
the last step.

## What setup states, and never asks

Setup never asks where files go, what a kit holds or which image provider is tested. It says so:

- The kit goes in `<config>/themes/<name>/`. `<name>` is the brand name in lowercase, with
  hyphens for spaces. If that folder exists, ask whether to replace it or keep both (the new one
  gets `-2`). The kit's `theme.json` `name` must then also be `<name>-2`, because
  the exporter and SKILL.md find a kit by that name.
- A kit holds `theme.json`, `colors_and_type.css`, `DESIGN.md`, `rules.md` and `assets/`, and
  optionally `title.html`, `fonts/` and `refs/`. `refs/` holds the user's style references and the test render. It is not in `theme.json`'s `copy` list, so `bin/deck init` never copies it into a deck. The layout and every field are in the README's "Brand
  kits" section; `tests/fixtures/kit/` is a complete small kit to copy the shape from.
- The one tested image provider is EvoLink, through the `gen-image` skill.

Setup asks only what only the user knows: their brand source, their pick of the three looks, and
yes or no to images and to each companion skill.

## Step 1. Brand source (the user may skip)

Ask the user to point at one source. Read it and note four things: the brand name, its colours
(a light surface, a dark surface, text, one accent), its fonts, and a logo file.

- **A website.** Fetch the page and every stylesheet it links. Take colours from the CSS custom
  properties and the most used non-grey values, fonts from `font-family` and any Google Fonts
  link, and the logo from the header's `<svg>` or `<img>`, else `og:image`, else the favicon.
- **A brand guide PDF.** Read the colour and type pages. Take the hex values as written.
- **A `.pptx`.** Read the theme with the snippet below. It uses Python's `zipfile` alone and needs
  no `python-pptx`. `dk1`/`lt1` are text and surface, `dk2`/`lt2` the second pair, `accent1` the
  usual accent; `major` is the heading font and `minor` the body font.
- **A `DESIGN.md`** from the [awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
  collection, or one the user wrote. Take its colour and type tokens.
- **No source, or the user skips.** Ask five questions, one at a time: the brand name; two
  colours; a font, or a feel ("warm and editorial", "plain and technical"); a logo file, if any;
  the tone in three words.

<!-- pptx-reader -->
```python
import sys, zipfile, xml.etree.ElementTree as ET
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
root = ET.fromstring(zipfile.ZipFile(sys.argv[1]).read("ppt/theme/theme1.xml"))
for slot in root.find(f".//{A}clrScheme"):
    c = slot[0]   # srgbClr val="RRGGBB", or sysClr with lastClr="RRGGBB"
    print(slot.tag[len(A):], "#" + (c.get("lastClr") or c.get("val")).upper())
for kind in ("major", "minor"):
    print(kind, root.find(f".//{A}{kind}Font/{A}latin").get("typeface"))
```

Run it as `python3 - <file.pptx>` with the snippet on standard input, or save it to a temporary
file. `tests/test_setup_pptx.py` runs this exact block.

## Step 2. Three looks, side by side (required)

Write two throwaway kits in a temporary folder (`mktemp -d`, called `<tmp>` here), scaffold one
deck per look, and show the three title slides on one page. The clean default needs no kit.

i) **The brand as extracted.** `<tmp>/kits/brand/` with:
   - `theme.json`: `{"name": "<name>", "copy": ["colors_and_type.css", "assets"], "fontsRedistributable": false}` (Step 3 settles the fonts).
   - `colors_and_type.css`: a `:root` block that sets the `--brand-*` hooks from Step 1 (the
     README lists all 16; set the ones the source gives, and let the rest fall back), plus a
     web-font link or `@font-face` rule for each brand font.
   - `assets/`: the logo.
   - `title.html`, only when there is a logo: the built-in title slide with the logo above the
     title block.

     ```html
     <section data-screen-label="01 Title">
       <img src="assets/logo.svg" alt="" style="height:72px; align-self:flex-start;">
       <div class="title-block">
         <h1 class="title">The one sentence this deck is for.</h1>
         <p class="subtitle">Say who it is for and what they should decide by the end of it.</p>
       </div>
       <div class="slide-foot"><span data-slide-number></span></div>
     </section>
     ```

ii) **A bolder variant.** Copy `brand/` to `<tmp>/kits/bold/`. Add `class="dark"` to the title
    section (write a `title.html` from the block above if there is none), set
    `--brand-weight-title: 800`, and set `--brand-hairline` to the accent.

Then, for each look:

```sh
python3 <skill>/bin/deck init <tmp>/looks/1-default --theme none
python3 <skill>/bin/deck init <tmp>/looks/2-brand --theme <tmp>/kits/brand
python3 <skill>/bin/deck init <tmp>/looks/3-bold --theme <tmp>/kits/bold
for d in <tmp>/looks/*/; do (cd "$d" && python3 build.py); done
```

Write `<tmp>/looks/compare.html` and open it:

```html
<!doctype html><meta charset="utf-8"><title>Three looks</title>
<style>
  body { margin: 0; padding: 24px; font: 18px system-ui, sans-serif;
         display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  figure { margin: 0; }
  iframe { width: 100%; aspect-ratio: 16 / 9; border: 1px solid #ccc; }
</style>
<figure><iframe src="1-default/index.html"></iframe><figcaption>1. The clean default</figcaption></figure>
<figure><iframe src="2-brand/index.html"></iframe><figcaption>2. Your brand</figcaption></figure>
<figure><iframe src="3-bold/index.html"></iframe><figcaption>3. Your brand, bolder</figcaption></figure>
```

Ask the user to pick one and comment. Apply the comments to that kit. If they pick the clean
default, the kit keeps only the logo, the fonts and the house rules, and sets no colour hooks.

## Step 3. Fonts (required)

Check each brand font's licence for two uses: embedding in PowerPoint, and a copy in every deck.

- **SIL Open Font License or Apache 2.0** (most of [Google Fonts](https://fonts.google.com)):
  both are allowed. Put the `.ttf` files in the kit's `fonts/`, named `<Family>-Regular.ttf`,
  `-Bold`, `-Italic`, `-BoldItalic`, and set `"fontsRedistributable": true`.
- **A commercial font, or a licence you cannot find:** treat both as not allowed. Leave
  `"fontsRedistributable": false`, keep a web-font link in the CSS if the brand hosts one, and
  say plainly: "PowerPoint cannot embed `<font>`, so a reader without it sees `<fallback>`."
  Name the fallback (Inter for a sans, the built-in default's face) and say a licence that
  allows embedding would fix it.

Record the faces in `theme.json` so the exporter names and embeds them:

```json
"fonts": {
  "faces": ["<Heading font>", "<Body font>"],
  "fallbackFace": "Inter",
  "embed": {"<Heading font>": "<HeadingFile>-{}.ttf"}
}
```

List in `embed` only the faces whose files the kit holds. If the brand has no font of its own,
write the built-in default's block, `{"faces": ["Inter"], "fallbackFace": "Inter", "embed":
{"Inter": "Inter-{}.ttf"}}`: a `theme.json` with no `fonts` key embeds nothing. The exporter
finds Inter in `<config>/fonts/`, so download the four Inter `.ttf` files there (OFL) when they
are missing. The user does nothing here unless a font needs buying.

## Step 4. Images (the user may skip)

Say what the step adds and what it costs, then ask yes or no:

> Decks can carry generated illustrations in your style. This uses Nano Banana 2 through
> EvoLink, paid per image on your own EvoLink account: `<price>` per image today.

Check the price on [EvoLink's pricing page](https://evolink.ai/pricing) at setup time and quote
that figure; never quote one from memory.

If the user says yes:

i) **Install `gen-image`**, as in the next section.
ii) **The key.** Tell the user to create an API key at [EvoLink](https://evolink.ai) and add
    `export EVOLINK_API_KEY=...` to their shell profile (`~/.zshrc` or `~/.bashrc`). Never put the
    key in the clone, the kit or any file setup writes.
iii) **Another provider.** Offer it in one line: "Your own Claude or Codex can write an
     integration for another provider. It is untested and unsupported here."

Every call from this skill names the model: `--model nb2`. Without it, `gen-image` uses its
default, GPT Image 2.5, which costs a different amount from the price quoted above.

### Installing `gen-image`

Skip this when a `gen-image` skill is already installed: it is in the skill list, or
`~/.claude/skills/gen-image/SKILL.md` exists.

Clone only `skills/gen-image` from the public `irama/irama-skills` repository, shallow and
sparse, at the pinned commit, into the data folder. Never inside `<config>/`: deleting the config
folder resets setup, and must not leave a broken skill link.

```sh
PIN=540eaf4ac2cb46c2b933705f693ebbb91ec61627
VENDOR="${XDG_DATA_HOME:-$HOME/.local/share}/peakstate-deck/vendor/irama-skills"
[ -d "$VENDOR/.git" ] || git clone --depth 1 --filter=blob:none --sparse --no-checkout https://github.com/irama/irama-skills.git "$VENDOR"
git -C "$VENDOR" sparse-checkout set skills/gen-image
git -C "$VENDOR" fetch --depth 1 origin "$PIN"
git -C "$VENDOR" checkout --detach "$PIN"
mkdir -p ~/.claude/skills && ln -sfn "$VENDOR/skills/gen-image" ~/.claude/skills/gen-image
```

- **Never install the whole `irama-skills` plugin for this.** That plugin carries shipping
  commands that can push to production.
- No image code is copied into this repository.
- The test render in Step 5 is one illustration through `generate.py`, which needs only the
  Python standard library. Slicing an icon sheet (`slice_sheet.py`, `shape_wash.py`) needs
  `numpy` and `Pillow` as well.

## Step 5. Style references (the user may skip)

Create the staging kit's reference folder first: `mkdir -p <tmp>/kits/<pick>/refs/illustrations`
(`<pick>` is the kit the user picked in Step 2). Ask the user to drop three to eight example
images into `<tmp>/kits/<pick>/refs/illustrations/` (and icons into `<tmp>/kits/<pick>/refs/icons/`). Look at each one and write the shared style into
`DESIGN.md` as a prompt every render carries: medium, line, colour, light, composition, what to
leave out. Write it as one paragraph under an `## Illustrations` heading.

If images are on, render one test illustration with that prompt and show it:

```sh
python3 ~/.claude/skills/gen-image/generate.py --model nb2 --size 16:9 \
  --prompt "<the style paragraph>. <one subject from the brand's world>" \
  --out <tmp>/kits/<pick>/refs/test-render.png
```

Nothing is written to `<config>` here: Step 7 copies the staging kit, `refs/` included.

Say plainly: the render follows the written style, not the images themselves. EvoLink takes
reference images only as public URLs, so exact style transfer needs the images at a public URL
the user controls, passed with `--ref <url>`.

## Step 6. Companion skills (the user may skip)

Offer each one with its line, and take yes or no for each. Each is a separate skill; this one
works without it and says so when it is missing.

| Skill | What it adds | Where to get it |
|---|---|---|
| `/narrative-arc` | Designs the deck's arc (audience, shift, each section's move) before any slide is written. | `skills/narrative-arc` in the public `peakstate-global/peakstate-skills` repository |
| `/sourced` | Audits every claim for its source and writes the provenance block. | `skills/sourced` in the public `peakstate-global/sourced` repository |
| `/draft-eval` | Scores a draft deck against a rubric and rewrites its weakest slides. | `skills/draft-eval` in the public `irama/irama-skills` repository |

For a yes, install that one skill folder at the pinned commit below. Each install is a shallow
sparse clone of one folder under `${XDG_DATA_HOME:-$HOME/.local/share}/peakstate-deck/vendor/`,
linked from `~/.claude/skills/<name>`. Never install a whole plugin for it. Skip a skill that is
already installed.

`/narrative-arc`:

```sh
PIN=1d19af77d6f0518364f3318c0ffddb0243ae0545
VENDOR="${XDG_DATA_HOME:-$HOME/.local/share}/peakstate-deck/vendor/peakstate-skills"
[ -d "$VENDOR/.git" ] || git clone --depth 1 --filter=blob:none --sparse --no-checkout https://github.com/peakstate-global/peakstate-skills.git "$VENDOR"
git -C "$VENDOR" sparse-checkout set skills/narrative-arc
git -C "$VENDOR" fetch --depth 1 origin "$PIN"
git -C "$VENDOR" checkout --detach "$PIN"
mkdir -p ~/.claude/skills && ln -sfn "$VENDOR/skills/narrative-arc" ~/.claude/skills/narrative-arc
```

`/sourced`:

```sh
PIN=602749b57232971be115ef06e7855bc32cba5f79
VENDOR="${XDG_DATA_HOME:-$HOME/.local/share}/peakstate-deck/vendor/sourced"
[ -d "$VENDOR/.git" ] || git clone --depth 1 --filter=blob:none --sparse --no-checkout https://github.com/peakstate-global/sourced.git "$VENDOR"
git -C "$VENDOR" sparse-checkout set skills/sourced
git -C "$VENDOR" fetch --depth 1 origin "$PIN"
git -C "$VENDOR" checkout --detach "$PIN"
mkdir -p ~/.claude/skills && ln -sfn "$VENDOR/skills/sourced" ~/.claude/skills/sourced
```

`/draft-eval` (its own clone folder, so it never disturbs the `gen-image` checkout above):

```sh
PIN=be7fd2b8916e02028d42f7cf92ae80837a1d1f03
VENDOR="${XDG_DATA_HOME:-$HOME/.local/share}/peakstate-deck/vendor/irama-skills-draft-eval"
[ -d "$VENDOR/.git" ] || git clone --depth 1 --filter=blob:none --sparse --no-checkout https://github.com/irama/irama-skills.git "$VENDOR"
git -C "$VENDOR" sparse-checkout set skills/draft-eval
git -C "$VENDOR" fetch --depth 1 origin "$PIN"
git -C "$VENDOR" checkout --detach "$PIN"
mkdir -p ~/.claude/skills && ln -sfn "$VENDOR/skills/draft-eval" ~/.claude/skills/draft-eval
```

## Step 7. Write the kit and show it (required)

i) Copy the picked kit to `<config>/themes/<name>/`. If that name was taken and the folder is
   `<name>-2`, set `name` in the kit's `theme.json` to `<name>-2` too. Add `DESIGN.md` and `rules.md`:
   - `DESIGN.md` follows the Google Stitch shape: YAML front matter (`name`, `colors`,
     `typography`, `rounded`, `spacing`), then `## Overview`, `## Colors`, `## Typography`,
     `## Layout`, `## Elevation & Depth`, `## Shapes`, `## Components`, `## Do's and Don'ts`,
     and `## Illustrations` from Step 5. Keep a section short when the source said little.
   - `rules.md` holds the house rules beyond the look: the tone in three words, any words to use
     or avoid. One line is enough to start.
ii) Set it active. Write `<config>/config.json` as `{"active": "<name>"}`, keeping any other keys.
iii) Scaffold the sample deck, `<config>/sample-<name>/` (delete an older one first):

```sh
python3 <skill>/bin/deck init <config>/sample-<name>
```

iv) Add four fragments to its `slides/`: `02-agenda.html` and `05-end.html` are the
    `02 Agenda` and `08 End` sections of `<skill>/slides/example.html`, copied as written. The
    other two are below. Then build it and open `index.html`.

`03-visual.html`, content with a visual:

```html
<section data-screen-label="03 Visual">
  <h2 class="slide-title">One idea, one picture.</h2>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:96px; align-items:center; flex:1;">
    <p class="lead">The words make the claim; the picture makes it stick.</p>
    <svg viewBox="0 0 600 400" role="img" aria-label="Three circles, the last one in the accent colour">
      <circle cx="120" cy="200" r="90" fill="var(--deck-bg-2)"/>
      <circle cx="300" cy="200" r="90" fill="var(--deck-bg-2)"/>
      <circle cx="480" cy="200" r="90" fill="var(--deck-accent)"/>
    </svg>
  </div>
  <div class="slide-foot"><span data-slide-number></span></div>
</section>
```

`04-chart.html`, a chart:

```html
<section data-screen-label="04 Chart">
  <h2 class="slide-title">The number that moved.</h2>
  <svg viewBox="0 0 1600 640" role="img" aria-label="Bar chart: 32, 41, 53 and 72 per cent, the last bar in the accent colour" style="margin-top:48px;">
    <g fill="var(--deck-fg-2)" font-size="32" font-family="var(--deck-font-body)" text-anchor="middle">
      <rect x="100" y="406" width="240" height="154" fill="var(--deck-hairline)"/><text x="220" y="610">2023</text>
      <rect x="480" y="363" width="240" height="197" fill="var(--deck-hairline)"/><text x="600" y="610">2024</text>
      <rect x="860" y="306" width="240" height="254" fill="var(--deck-hairline)"/><text x="980" y="610">2025</text>
      <rect x="1240" y="214" width="240" height="346" fill="var(--deck-accent)"/><text x="1360" y="610">2026</text>
      <text x="1360" y="190" fill="var(--deck-fg)" font-size="48">72%</text>
    </g>
  </svg>
  <div class="slide-foot"><span data-slide-number></span></div>
</section>
```

v) Check `index.html?audit` reports all five slides clean, then ask the user to comment on the
   sample. Apply the comments to the kit, not to the sample.
vi) Delete `<tmp>`.

## Several kits

- Every run adds a kit under `<config>/themes/`. `ls <config>/themes` lists them.
- `config.json`'s `active` picks the kit for new decks. To switch, ask the user which kit and
  rewrite that one key.
- `bin/deck init <folder> --theme <name>` uses another kit for one deck; `--theme none` uses the
  clean default.
- A deck carries its kit's `theme.json`, so switching the active kit never changes a deck
  already made.
