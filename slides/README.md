# Slides — the deck rig and its treatments

- `deck-stage.js` — the 1920×1080 presentation runtime. Slides are
  `deck-stage > section`; the live one carries `data-deck-active`.
- `deck-tools.js` — `?audit` and `?export`. Nothing in it runs unless asked.
- `export-pptx.py` — the PowerPoint exporter.
- `../themes/peak-state/deck.html` — an example deck: title, section divider,
  content, big quote, data point, comparison, end card.
- `../themes/peak-state/treatments.css` — five recurring slide types with real
  shape, below. It needs the theme's `colors_and_type.css` loaded first.
- `../assets/deck-comments.js` — the review layer. See `SKILL.md` in this
  repository for the four `<meta>` tags it needs and how to act on its payload.

Surfaces: default is bone, `.paper` is sand, `.meta` is charcoal. Sections are
`position: relative` with `padding: 76px 120px 104px`, so an absolutely
positioned child measures from the slide edge.

## The five treatments

**Pull quote.** The mark is a lifted tone of the background, never a gold
graphic, and the quote sits in a measure to its right.

```html
<div class="pull-slide">
  <span class="mark">&ldquo;</span>
  <blockquote>One sentence that has to land.</blockquote>
  <div class="rule"></div>
  <p class="attrib">Who said it &middot; when &middot; to whom</p>
</div>
```

`colors_and_type.css` styles every `blockquote` italic, charcoal, with a sienna
rule — invisible text on a charcoal slide. `treatments.css` resets all four.
Same for the gold underline it puts on `.mark`.

**Specimen quote.** For a definition, where the word is the point.

```html
<div class="specimen-q">
  <p class="word">Confabulation</p>
  <p class="pos">noun &middot; not a defect</p>
  <div class="hair"></div>
  <div class="row">
    <p class="def">the production of <em>the damning clause</em>, struck in sienna.</p>
    <div class="src">SOURCE<br>lines<br>in mono</div>
  </div>
  <p class="no">THE FOOTNOTE THAT MAKES IT BITE</p>
</div>
```

**Stat wall.** One number owns the left, the rest hang in a right margin. The
gold `.chip` is for movement in the headline figure — the reason it is on the
slide at all.

```html
<div class="statwall">
  <div class="hero">
    <div class="big">1,959</div><div class="chip">+37 IN NINE DAYS</div>
    <div class="cap">What it counts.</div><div class="src">Source, read on a date</div>
  </div>
  <div class="side">
    <div><div class="big">84&rarr;51</div><div class="cap">…</div><div class="src">…</div></div>
    <div><div class="big">78 vs 29</div><div class="cap">…</div><div class="src">…</div></div>
  </div>
</div>
```

**The board.** Seven equal columns, tops and bottoms aligned. Grid is
`align-content: center; grid-auto-rows: min-content`, so columns match each
other without stretching to the full slide and leaving dead space.

```html
<div class="board">
  <div class="tile"><div class="l">S</div><div class="n">Name</div>
    <div class="bias">THE FAILURE MODE</div><div class="p">One sentence.</div></div>
  <!-- ×7 -->
</div>
```

**Exercise.** Charcoal surface, no title band, and the timebox as the object.
Absolutely positioned, so it does not sit in the section's flex column.

```html
<section class="exercise">
  <div class="xdial"><b>8</b></div>
  <div class="xunder">MINUTES<br>ON YOUR OWN<br>NOBODY SHARES</div>
  <div class="xbody">
    <p class="kicker">Exercise 1 &middot; the name</p>
    <h2 class="t">The instruction</h2>
    <ol><li><b>Step.</b><small>The detail under it.</small></li></ol>
  </div>
</section>
```

`li small` must carry `grid-column: 2` — the list item is a two-column grid, so
without it the sub-line lands in the number column and wraps to nothing.

**Agenda page.** Slide two, and **included by default**. A reader who does not
know the shape of a deck spends the first third working it out instead of
listening. Two columns of numbered parts, each with a one-line note saying what
is in it — a bare list of part names tells nobody anything they could not get
from the dividers. Mark the part being presented with `.here`.

```html
<div class="agenda">
  <ol><li class="here"><span class="ag-part">Part name
    <span class="ag-note">One line on what is in it</span></span></li></ol>
  <ol style="--ag-from:2;"><li><span class="ag-part">The next part</span></li></ol>
</div>
```

The second `<ol>` continues the first's numbering through `--ag-from`, set to
the count of the left column. `<ol start>` does nothing here — CSS counters
ignore it, and the second column silently restarts at 01.

**Hide it rather than delete it** when a delivery does not want one, the same
way as any other unused slide (see below). It is a slide the audience often
wants and the author rarely thinks to add.

**References page.** Any deck that makes a claim ends with one, and it is the
last slide. APA 7 entries numbered down the left, the provenance block on the
right with its `References` line removed — because this page *is* that line.
Every claim in the deck carries `<sup class="cite">n</sup>` pointing at its entry.

```html
<div class="refpage">
  <ol class="apa">
    <li>Author, A. (2026). <i>Title</i>. Publisher. host.example</li>
  </ol>
  <div class="pblock small boxed"><!-- References line omitted --></div>
</div>
```

`.apa li` is a hanging indent, not a grid: the number and the entry are one
flowing paragraph, which is what APA sets and what stops the list doubling in
height.

**The entry only. No quoted passages on a slide.** A written brief puts the
verbatim passage under every entry, because a reader can check it there. A deck
cannot: one quote per source turns a single references page into three or four,
and a references section long enough to need paging is one nobody reads. **The
quotes live in the `.sourced` sidecar**, which the provenance block links, and
the slide carries the entry and its number.

This is a real difference between the two skills, not an oversight — say so if
someone asks why the deck is thinner than the brief.

**Provenance block.** Four labels — Attribution, Accountable, Limitations,
References — on any deck that makes a claim.

```html
<div class="pblock">
  <div><div class="k">Attribution</div><div class="v">Who and what made this.</div></div>
  <div><div class="k">Accountable</div><div class="v">Who is answerable for acting on it.</div></div>
  <div><div class="k">Limitations</div><div class="v">What would change a reader's decision.</div></div>
  <div><div class="k">References</div><div class="v">Sources, and a relative link to the sidecar.</div></div>
</div>
```

Two placements, and **combined is the default**: the block sits in the right
column of `.refpage`, sharing the last slide with the entries, with its
`References` line omitted. A plain `class="pblock"` is right there — `.refpage` narrows it to one column.
(`.pblock.small.boxed` is the older flat label/value shape, kept for decks that
already use it; new work writes the wrapped pairs shown above.)

Its **own slide** when the block has more to say than a column holds, or when
asked. Then all four labels appear, and the references page footer reads
**"References included on previous slides"** — never a line explaining which
slide replaces which, which is deck-internal bookkeeping the audience did not
ask for.

**Attribution links what it names.** The skills used, where they have a public
URL; the sidecar, **relatively** (`deck-name.html.sourced`), so the pair
survives being moved or sent on. Never an absolute local path — it breaks for
every reader but you and leaks a directory structure into a document that
travels.

## Slides a delivery does not use

Mark them in the generator rather than deleting them:

```python
slide(..., label='The sky claim', hidden=True)
```

That emits `data-hidden-src` on the section. The runtime dims it in edit mode (darker, never a light wash) and skips it in
performance mode, and it survives a rebuild. A reader can also hide a slide from the toolbar, which
is a browser-local decision that rides back in the review payload rather than changing the deck.

## Speaker notes are the presenter's, not yours

**Never write a speaker note unless the deck's owner asks for one.** Leave the note empty and let
them fill it.

A note is for the presenter in the room: an instruction to them, a line to read out, or the
expansion of an acronym on the slide in case they blank on it. It is not a second home for
facilitation reasoning, which belongs in the run sheet, and it is not a place to explain the design
decisions behind a slide.

Notes written by the generator get read as the owner's own words the first time they present from
the deck, which is the worst possible moment to discover they are not.

## Check every build

A slide can pass a layout check and still be unreadable: the audit measures
geometry, not contrast. Screenshot the slide types you changed before calling
a deck done.

## States: one slide, several frames

A section carrying `data-state-group="<id>"` is a **state**. Sections sharing a group are states of
one slide: navigated like separate slides, sharing one slide number, and **only the group's primary
state reaches print**. That is what stops a nine-state build becoming nine pages in a PDF.

- `data-state-primary` marks the primary. Unmarked, the first state takes the job.
- **A hidden primary falls back**, to the previous visible state in the group, then forward. A group
  whose every state is hidden contributes no page rather than a hidden one.
- The counter counts slides, not states, because a footer reading 08 beside a pill reading 12 of 37
  teaches the presenter to trust neither.

## Entry and exit animations

`data-entry` and `data-exit` on any element inside a slide, valued `flash-left` or `flash-down`.
Entry runs as the slide becomes visible, exit as it leaves.

    window.deckFlash(el, 'flash-left')    fire the same animation at any other time
    window.deckStatePages()               recompute which state prints
    window.deckRenumber()                 recompute the counter

The travel is the element's own size, so a wide thing flies further than a narrow one and both read
as the same speed. Motion blur is a short filter on the moving axis, dropped as it lands. Print and
reduced motion get the end state and no movement, so a PDF is never a page of half-faded elements.

## Morph: named things travel

An element named on both sides **travels rather than cuts**, the same idea as PowerPoint's morph.
It runs between two states of one group, or across a `data-morph-link` pair, on the flash's own
clock, linear, so a morph and a flash beside it start and stop together.

**Morph is opted into one element at a time**, with the same `data-morph="key"` on both sides.
Signature matching — tag, classes and place among siblings — was built, shipped and withdrawn: it
moved headers, containers and words nobody asked to move, and morphing anything the text lays out
around **reflows the line while it animates**, which reads as the layout tearing. Name the two or
three things that should travel; nothing else moves.

| Attribute | Does |
|---|---|
| `data-morph="key"` | The opt-in. The same key on both sides makes them one thing |
| `data-morph="none"` | Never morphs |
| `data-morph-link` | On either of two **adjacent** slides, opts that one pair into morphing. Two ordinary slides cut |
| `data-entry` / `data-exit` | Beats a key **between states**, because something that flashes in should not also be flown in. On a linked pair the key wins, since that pair is a designed hand-off |

**Something new fades, on a linked hand-off.** A named element with no counterpart on the slide
before did not travel from anywhere, so it fades in over the same duration rather than flying in
from a position it never held. A wrapper around something that did travel is not new, and only the
outermost new thing fades. Give it `data-entry` if it should arrive some other way. Between states
nothing fades, because an element entering the map for the first time there is a keying artefact
and fading something already on screen is a flicker.

    window.deckMorph(fromSection, toSection)   run one by hand

One trap, paid for once: a rect is in **screen** pixels and the deck is scaled to fit the window,
while a width or a translate is set in **layout** pixels. Mix them and the morph travels the wrong
distance and jumps the rest of the way as it releases.

## Exporting to PowerPoint

    python3 slides/export-pptx.py --deck /abs/path/to/index.html --theme peak-state

The contract it obeys, and every trap that has cost a rebuild, are in
`reference/powerpoint-export.md`. Read that file before changing the exporter or diagnosing a deck
that came back wrong — the failures in it are all silent ones: a picture with no ink, a transition
that falls through to a fade, a file PowerPoint offers to repair by deleting slides.

