# peakstate-deck

A slide rig that builds a presentation as one standalone HTML file, reviews it in the browser,
and exports it to PowerPoint with real, editable text.

A deck is a single `index.html`. No build step, no server, no framework. Open it and present.

## What is in here

| Path | What it is |
|---|---|
| `slides/deck-stage.js` | The 1920×1080 presentation runtime. Slides are `deck-stage > section`. |
| `slides/index.html` | The starter deck: title, divider, content, quote, data point, comparison, end card. |
| `slides/treatments.css` | Five recurring slide shapes — pull quote, specimen, gutter mark, and the rest. |
| `slides/export-pptx.py` | Turns a deck's `?export` layout dump into native PowerPoint shapes. |
| `slides/README.md` | The engine's own reference: surfaces, treatments, the markup each one wants. |

## Build a deck

Copy `slides/index.html` and `slides/deck-stage.js` beside each other, edit the sections, open the
HTML. `index.html?audit` gives a per-slide overflow report; "all N slides clean" is the pass.

## Export to PowerPoint

    ~/.local/pptx-venv/bin/python slides/export-pptx.py --deck /abs/path/to/index.html

The deck measures its own laid-out geometry under `?export` and emits it as JSON. The script turns
that into real PowerPoint shapes, with presenter notes and embedded fonts.

## Where this came from

The engine lived in a Google Drive folder, unversioned, until 29 August 2026. Every fix up to that
date arrived here in the first commit. The old Drive paths are symlinks into this repository, so
anything that referenced them still resolves.
