# Exporting to PowerPoint

*Split out of `SKILL.md`. Open this when you are running the exporter, changing it, or a deck came
back from PowerPoint wrong.*

    python3 slides/export-pptx.py --deck /abs/path/to/index.html --theme peak-state

The deck measures its own laid-out geometry under `?export` and emits it as JSON; the script turns
that into real PowerPoint shapes, so the text is editable rather than a picture of text.

Everything below was paid for. Each rule is a defect that reached a screen, and most of them left a
check behind rather than only a fix — the recurring lesson being that **a rule nobody can fail is a
rule that gets broken again.**

## What the run tells you, and why you read it

    38 slides at 1920x1080
      surfaces found      3
      on layout PS Dark      30 slide(s)
      on layout PS Light     5 slide(s)
      on layout PS Warm      3 slide(s)
      branding            on, 6 shape(s) placed on the layouts
      page numbers        38 field(s), they renumber themselves
      hidden slides       3
      morph transitions   9
      notes carried       10
      WARNING: a named morph shape appears on one slide of a pair and not the other …
      package             every part parses, no junk namespaces

Two lines are gates rather than trivia. **The WARNING** names a morph that will silently not
happen, because PowerPoint pairs shapes by name and a name on one slide of a pair and not the next
has nothing to travel to. **The package line** is the last thing that runs; if any part of the
saved file fails to parse, the run exits non-zero and names the part.

## Morph

**The namespace ends in `/2015/09/main`.** Not `/2015/main`. With the wrong URI PowerPoint does not
recognise `Requires="p159"`, skips the `mc:Choice`, and uses the `mc:Fallback` — which is a fade. It
looks exactly like a transition that was never set, and it survived three rounds of "fixed".

The shape that works, copied from a file PowerPoint itself wrote:

    <mc:AlternateContent xmlns:mc="…markup-compatibility/2006">
      <mc:Choice xmlns:p159="…/office/powerpoint/2015/09/main" Requires="p159">
        <p:transition spd="slow" xmlns:p14="…/office/powerpoint/2010/main" p14:dur="700">
          <p159:morph option="byObject"/>
        </p:transition>
      </mc:Choice>
      <mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback>
    </mc:AlternateContent>

- **Read a real file before believing a spec.** Every wrong version was plausible and
  schema-valid. The one that works came from opening a `.pptx` PowerPoint had written and copying
  what was there. Any Office file is a zip: `unzip -p deck.pptx ppt/slides/slide2.xml`.
- **The slide root needs nothing.** An earlier theory added namespace declarations and
  `mc:Ignorable` there; the genuine file has neither.
- **One source for a URI.** It was a constant *and* a literal in the string actually written, and
  the two drifted. The constant was right and the output was wrong.

## Shapes that morph are named

PowerPoint pairs shapes for a morph **by name**, and a name beginning `!!` forces the pair even when
the text differs. So a sentence exported as one shape has nothing to morph into and can only fade.

Mark the parts that should travel with `data-pptx-split="<name>"` in the deck. Each becomes its own
shape named `!!<name>`, and the block that held them stops exporting their words, or the sentence
appears twice and the copies overlap.

**A split shape is a fragment, never a paragraph.** PowerPoint measures type wider than the browser,
so a box cut to the browser's width breaks a fragment mid-line. Fragments get slack and never wrap.

## SVG

An inline `<use href="#id">` renders as **nothing** in a file of its own. Copying the symbol in is
not enough either: the symbol carries the `viewBox`, and without one the root SVG has no coordinate
system and paints an empty picture that looks like a successful export.

So: inline the symbol's contents, carry its `viewBox` up, and write an explicit `width`/`height`,
because the deck sized it in CSS the standalone file cannot see. The failure is silent — check for
ink, not for a picture:

    unzip -p deck.pptx ppt/media/image19.png | python3 -c "import sys,io;from PIL import Image;\
    a=Image.open(io.BytesIO(sys.stdin.buffer.read())).convert('RGBA').split()[3];\
    print('ink pixels', sum(1 for p in a.getdata() if p>20))"

## Type

**Letter-spacing has to be carried.** PowerPoint holds tracking on `rPr/@spc`, in hundredths of a
point. Dropped, every tracked line — a wordmark, an eyebrow, a run of numerals — arrives visibly
tighter than the deck draws it, and it reads as a font substitution rather than a missing property.

## The master

A deck runs on a small number of surfaces. Each becomes a **layout** carrying its own full-bleed
background, and the branding is placed once per layout instead of once per slide. Change the colour
in the master and every slide on that layout follows.

- **A theme need not name every surface a deck turns out to use.** This deck has three; the theme
  named two. Unnamed surfaces get a generated name rather than an exception, and a surface with no
  layout keeps its own rectangle and is named in the summary rather than drawn on the wrong ground.
- **`python-pptx` cannot add a shape to a layout.** Build it on a scratch slide and move the
  element. A picture also carries a relationship id pointing into the *slide's* part, so relate the
  image to the layout and rewrite the id, or it renders as a red cross. Drop the scratch slide
  afterwards.
- **Ink is chosen per ground, never inherited.** The mark is lifted from one slide, so whatever
  colour it wore there is wrong for at least one layout: the deck's lightest surface on a dark
  ground, its darkest on a light one.
- **Collect the whole mark before you stop looking.** A title slide may show the diamond and hide
  the words; a collector that stops at the first slide carrying any mark takes half of it.
- **The page number is a field**, not typed text, so inserting a slide renumbers the rest.

## The rules that are not negotiable

- **Never ask lxml to add a namespace declaration to an element it has already built.** It cannot,
  and it does not say so: it writes `ns0:p14="…"`, an attribute in the xmlns namespace, which is not
  valid XML. PowerPoint offers to repair such a file and repairs it **by deleting every slide that
  carries one** — which is why nine slides once vanished and the rest of the deck looked fine. Do
  that work on the packaged XML after saving, or not at all.
- **Validate the package before handing the file over.** `validate_package` parses every XML part
  and refuses any junk namespace. The corrupt file passed every check that existed at the time.
- **Take the layout dump with Playwright.** Headless Chrome with `--dump-dom` shares the running
  browser's profile and returns a page that never booted, intermittently — which reads as "the deck
  broke" rather than "the dump failed".

## What the format cannot carry

Entry and exit animations are dropped: a state exports as its own slide with the Morph transition,
which is the nearest PowerPoint has. A hidden slide exports as a hidden PowerPoint slide, not a
missing one. Speaker notes go into the notes field, one slide for one note.
