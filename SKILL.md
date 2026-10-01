---
name: peakstate-deck
description: Build an HTML slide deck, review it in the browser, and export it to PowerPoint with editable text. Use when authoring or editing a deck, when delivering a deck the reader is meant to comment on, when a deck comment payload comes back, or when a deck needs a .pptx or a print-ready PDF. Pairs with html-brief, which does the review half for documents.
---

# peakstate-deck

One tool, three jobs: **author** a deck as a single standalone HTML file, **review** it in
the browser and round-trip the comments, **export** it to native PowerPoint.

A deck is one `index.html` with `deck-stage.js` and `deck-tools.js` beside it. No build step, no server, no
framework. `index.html?audit` reports per-slide overflow; "all N slides clean" is the pass.
After a deck builds and audits clean, `/draft-eval` scores it before anyone reviews it.

| Job | Start here |
|---|---|
| Author or edit a deck | `slides/README.md` — the runtime, the surfaces, the five treatments |
| Scaffold a new deck | `python3 bin/deck init <folder> --theme peak-state` |
| Export to PowerPoint | `python3 slides/export-pptx.py --deck /abs/path/index.html --theme peak-state`, then `reference/powerpoint-export.md` |
| Add the review layer | The next section |
| Work a returned payload | `reference/the-payload.md` |

## Design the arc before the slides

**Run `/narrative-arc` before authoring or reflowing a deck, and build nothing until its spine is approved.** It names the audience, the job the deck does for them, the beliefs and pains they arrive with, the shift, and each section's premise with the move it makes.

- **The slides carry the claims; the speaker notes carry the narrative.** Every note says what its slide claims and gives the line that carries the room from the last slide into this one and on to the next.
- **The first slide of each section names the belief it answers.**
- **Teach the vocabulary before the audience applies it**, and end on where to start rather than on a method.

## Decide the terms on a hidden slide

**A deck decides which terms it uses and which it does not, before any slide is built.** The slide is titled **Definitions** and renders each kept term as a boxed card (`.defs-grid .term`, the same shape as the peakstate-brief definitions block), in large type. When the terms do not fit at 24px, split them across two Definitions slides rather than shrinking the text. Prefer plain English. A term that is not plain English stays only if it earns its place, and then a visible slide introduces it early, visually, with a metaphor or an example, before its first use. A taxonomy id such as D1 is fine when its letter means something and the id is reused wherever that item appears.

The decisions live on a hidden terms slide early in the deck:

    <section data-role="terms" data-hidden data-hidden-src>
      <dl>
        <dt>churn</dt><dd>Customers who leave in a period. Introduced on the retention slide.</dd>
      </dl>
      <ul><li><s>synergy</s> &rarr; working together</li></ul>
    </section>

- **Each kept term is one `<dt>term</dt><dd>definition</dd>` pair.** Terms set aside go in a list with the plain words used instead, never in a `<dt>`, so every `<dt>` is a term in use.
- **The visible slide that introduces a term carries `data-introduces="term"`**, comma-separated for several (`data-introduces="churn,cohort"`). Spell each term exactly as its `<dt>`.
- **Write both hidden attributes.** The runtime reads `data-hidden-src`: it dims the slide in edit mode and skips it when presenting. `data-hidden` is the shared marker that evaluators read, and the review layer rewrites it from `data-hidden-src` on load, so it cannot stand alone. A generator's `hidden=True` emits `data-hidden-src`; add `data-hidden` beside it.

## Design rules

**Judge every slide as a first-time audience member would, and make every word, mark and model earn its place.** `/draft-eval` grades these; hold a revision against them before the reader sees it.

- **Words.** A first-time reader takes the point with nothing to guess. A question or label makes sense without the speaker. List items share one form; questions in a sequence share one polarity. A non-plain term is introduced early, visually, with a metaphor or example, then may be reused, ideally with context clues. A loaded word ("kill") has its object in view.
- **Economy and authority.** Every word and element serves the message: no meta-commentary, reading instructions or "this, not that". The slide states the position plainly; no hedge on its face. A text-heavy slide moves its story to the speaker notes.
- **Sources field.** Sources, limits and "not tested" caveats go in `#slide-sources`, never on the slide and never in the spoken note (`reference/authoring.md`, *Sources field*).
- **Shape.** Name the shape of the idea, then draw it: a journey is a map, a spread a curve, a filter a funnel, a ladder shows every rung. Draw it true to the thing (contours never cross, paths wind) and recognisable at a glance, never a photo-real imitation. The mascot appears only when it plays a part.
- **Encodings.** Every colour, line, circle and position means something the slide or notes make clear. Use the fewest encodings the story needs. Nothing the idea needs is cut off. A chart says what it measures, for whom, and its takeaway; a recommendation says what to do and when, set apart from the findings.
- **Frameworks.** One model per idea. Ids use a letter that stands for something and appear wherever the item does. Each framework has one look, used identically everywhere and unlike every other framework's.
- **Devices.** One device per slide, varied across the deck; curiosity counts. Narrative beats strict flow, and a case may sit in the notes.
- **Protect what works.** Praised elements go on `keep.json` beside the deck; a rewrite that removes one says why. A change marked worse is reverted first, then the new idea is applied. Fix the pattern across every slide, not only the slide flagged.

## Every slide carries a visual, and the best one is the metaphor

**A deck is a visual medium. Before writing any slide, find the visual metaphor for its main point, then decide how to show it.** Text-only slides are the exception, and each one needs a reason.

For every slide, answer three questions in the generator, as a comment above the slide:

- **What is the one point?** One sentence.
- **What is its visual metaphor?** A protest crowd for objections, a seesaw for a shift in weight, a dial for degrees of autonomy, a road for a journey, a stamp for a verdict.
- **How can we show it?** Choose the highest rung that is feasible:
  1. **The content sits inside the metaphor.** The objections are the words on the protest placards; the cheap work and the precious work sit on the two ends of the seesaw; the four levels of autonomy are the marks on the dial. This is the goal.
  2. **An illustration** that carries the metaphor, with the text beside it.
  3. **An infographic or chart** that shows the number's shape: a falling line, a pair of bars, a scale comparison. A number that changes over time is shown as a chart, never as a sentence.
  4. **A symbol or icon** that marks the idea.

  Text alone is the last resort, and only when a visual would add nothing.

- **One visual per slide, for its main point only.** If a slide makes two points, illustrate the main one and leave the other as text. A second visual competes with the first and turns the slide into clutter.
- **A visual must aid comprehension or add joy.** An icon placed because the space looked empty does neither. Section dividers and closing lines usually need no visual: a strong sentence stands alone.
- **Never hand-draw icons in SVG.** Use an established icon set (Lucide, ISC licence, at <https://lucide.dev>) or the Noun Project when the owner gives access, or use no icon.
- **Illustrations use the house style:** the robot-monkey line art in the `peak-state-design` skill (`assets/characters/robot-monkey/README.md`, drawn with Nano Banana 2 from its two reference images). The robot monkey is always the AI and the people are always people. One hero image per deck may break the style when the moment calls for it, such as a full-slide cartoon at the turning point.
- **Charts show what the data says, and only that.** Plot only the points the source gives. Label every value, and say on the slide when a line joins only two measured points.
- **Motion is part of the metaphor when it means something.** A placard that rises from below, a bar chart that climbs, a needle that turns. Use `data-build` for one item per click (see `slides/README.md`), and keep print and reduced motion static.
- **Illustrations hold a consistent style across a deck** (one illustrator, one set of recurring characters). Say in the attribution that they are AI-generated.

## Every word on a slide earns its place

**Add text only when it adds value, never to fill a slot in the template.** A footer, an
eyebrow, a subtitle or a caption that restates the headline, labels the device or narrates the
slide is noise. It competes with the content and makes the slide harder to read.

- **Footers carry the page number and nothing else.** No footer strapline, tagline or summary.
- **Before adding any secondary line, ask what the reader loses without it.** If the answer is
  nothing, leave the space empty. Empty space is a design choice, not a hole to fill.
- **Space freed by removed text goes to the content**, for example larger illustrations.

## The review layer

`html-brief` gives a document selection comments and a Copy-responses payload.
This does the same for a **slide deck**: select text on a slide, write a note,
hit Copy, paste the JSON into chat. The payload says which build was reviewed
and where every note belongs, so no other context is needed.

## Install it into a deck


One file, no dependencies, no build step.

    cp <skill>/assets/deck-comments.js <deck-folder>/

Then, in the deck HTML, after the deck script:

    <script src="deck-comments.js"></script>

And in `<head>`, four meta tags — **this is the part that makes the payload
self-sufficient**, so do not skip it:

    <meta name="deck-file"        content="path/to/deck.html">
    <meta name="deck-source"      content="path/to/generator.py">
    <meta name="deck-build"       content="2026-01-01T00:00:00Z">
    <meta name="deck-build-hash"  content="<12 hex chars>">
    <meta name="deck-resolutions" content="path/to/review-resolutions.json">

- `deck-file` — the deck, repo-relative.
- `deck-source` — the file to EDIT. On a generated deck that is the generator,
  never the emitted HTML. Same value as `deck-file` when the deck is hand-written.
- `deck-build` — UTC timestamp of the build.
- `deck-build-hash` — a short content hash of the slides. It is what lets Claude
  notice that the deck moved after the comments were written.
- `deck-resolutions` — where the ticked-off comments live. See below.

A generator should emit all four. In Python:

    import hashlib, datetime
    body = ''.join(slide_html) + ''.join(speaker_notes)
    build_hash = hashlib.sha256(body.encode()).hexdigest()[:12]
    build_at = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

## Ticking comments off


Across rounds, the expensive mistake is re-reading comments already dealt with.
So Claude ticks them off, and the deck shows it.

Keep a `review-resolutions.json` beside the deck:

```json
{ "resolutions": [
  { "at": "2026-01-01T09:15:22.100Z", "status": "addressed", "build": "84c3ea6ae5e8",
    "note": "Reworded to say what the figures count." },
  { "at": "2026-01-01T09:18:04.900Z", "status": "question",
    "note": "Needs a decision before I can act." }
] }
```

`status` is `addressed`, `wontfix` or `question`. `note` is the reply to the
reader. In the list, an answered comment opens as a thread, as in peakstate-brief:
**You** (the comment), **Response** (the `note`), each follow-up, then a
**Continue the conversation** box. **Edit original** sits beside it. The same
thread opens on the slide: an answered highlight stays painted as a dotted gold
underline, and an answered slide comment keeps **Slide comment** lit, so
clicking either one opens the conversation where the comment was made.

**A follow-up reopens the comment.** Whatever its status, a comment with a
follow-up the answer has not covered counts as `new`, so it travels in the next
Copy with `follow_up[]` beside `resolutionNote`. To answer it, rewrite `note` so
it covers the follow-up too, and set `seen` to the number of follow-ups it now
answers:

```json
{ "at": "…", "status": "addressed", "note": "The answer, now covering the follow-up.", "seen": 1 }
```

The build embeds this file as a JSON block the runtime reads:

    <script type="application/json" id="deck-resolutions"> …the file… </script>

**Entries are keyed by the comment's `at` timestamp, not by an id, and that is
the whole trick.** Editing a comment rewrites its `at`, so the resolution stops
matching and the tick falls off by itself. A comment the user reconsiders comes
back as `new` without anybody having to remember to clear anything.

In the payload every comment then carries `status`, `addressedInBuild` and
`resolutionNote`, and the top level carries `openCount`. In the list, an
addressed comment is dimmed and stamped; its highlight stops being painted; and
the count badge reads `open/total`.

**Work only `new` and `question`.** Do not redo `addressed`, and do not report
on it — the user has read that round already.

## Branding on and off

The reader can hide the branding on every slide: the diamond control in the bar, or **Show
branding** in the overview. It is a view setting, saved with the deck's other review state.

The toggle only puts `deck-nobrand` on `<html>`. **What counts as branding is the deck's own
call**, so a deck opts in by styling it:

    html.deck-nobrand .ft .brand,
    html.deck-nobrand .brandmark { visibility: hidden; }

A deck that never wrote that rule ignores the toggle, which is the right failure: this layer does
not get to guess which marks are yours.

## The control surfaces

Two rules hold across the bar and the overview, and a change that breaks either is a defect.

- **Icons are inline SVG, never emoji.** Emoji render differently on every platform, carry a
  colour nobody chose, and sit at whatever weight the font decides. Every icon comes from the
  `ICON` map in `deck-comments.js` and carries `data-icon="<name>"`, which is also how a test
  asserts which state is drawn.
- **A toggle's label says what turning it on does, and never changes.** `Show starred only`,
  `Show hidden slides`, `Show branding`. Whether it is on lives in `aria-pressed`, not in the
  words. A label that flips between "on" and "off" makes the reader work out which state the
  words are describing.

The bar rests at 62 per cent opacity and wakes on hover or keyboard focus. Per-tile controls in
the overview appear on hover or focus only, so the grid reads as slides rather than as a wall of
buttons. The status strip under a tile is drawn only when it has something true to say.

## Companion files

Open one when its line is true of the work in front of you; never preload them.

| File | Read this when |
|---|---|
| `reference/the-payload.md` | A payload has come back and you are working it, or you are changing what one carries |
| `reference/the-overview.md` | You are working on the overview, the bar, or the keyboard |
| `reference/identity.md` | Slides moved or were renamed, or the deck has states |
| `reference/authoring.md` | You are writing or generating the deck itself |
| `reference/internals.md` | You edited `deck-comments.js` and need to know what must still hold |
| `reference/powerpoint-export.md` | You are exporting to PowerPoint, changing the exporter, or a deck came back from it wrong |
