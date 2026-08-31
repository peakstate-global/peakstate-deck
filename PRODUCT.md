# peakstate-deck

*Written from this repository's own documentation (`SKILL.md`, `reference/*.md`, `themes/peak-state`),
not from a prompt. Run `impeccable teach` to replace it with your own answers.*

## Register

**product.** The design serves the deck. Every pixel of chrome is a pixel not showing a slide.

## Product purpose

One tool, three jobs: author a deck as a single standalone HTML file, review it in the browser and
round-trip the comments, export it to native PowerPoint. No build step, no server, no framework.

The two surfaces being designed are both **chrome around somebody else's content**:

- **The control bar**, top right of every slide in edit mode. Nine controls today.
- **The overview**, a grid of every slide as a live thumbnail, with per-slide state.

## Users

**One author, working alone, and the reader they send the deck to.** Not a team, not a queue, no
permissions model. The author is usually the presenter as well, so the same person meets this
interface while building at a desk and while standing in front of a room.

Three moments, and they are not alike:

1. **Building**, at a laptop, hours at a time. Wants the chrome out of the way and the slide honest.
2. **Reviewing**, someone else's browser, twenty minutes. Wants to find the affordance without being
   taught.
3. **Presenting**, in front of people. Wants no chrome at all, and gets performance mode.

## Brand

Peak State Global. Charcoal and bone, one accent (burnt sienna), one signal (peak gold, used at most
twice per surface). Spectral for display and body, Inter for UI chrome, JetBrains Mono for labels,
codes and anything the reader might type. Sentence case everywhere except eyebrows and chapter marks.
No emoji in brand output, calm motion only.

## Strategic principles

- **State is never carried by colour alone.** Shape, glyph, word or position must say it too. This is
  a hard rule and it is already met; a redesign may not lose it.
- **Nothing obscures the slide.** The deck is 1920x1080 and the chrome floats over it.
- **Standalone.** One HTML file plus two scripts. No dependency may be introduced.
- **The reader's state is theirs.** Stars, hides, notes and comments live in localStorage and ride
  back in one JSON payload. Nothing is lost on rebuild.

## Anti-references

- **The SaaS toolbar.** A pill of undifferentiated icon buttons that all look equally important.
- **The Figma or Slides clone.** This is not a canvas editor and must not borrow its furniture.
- **The dashboard.** No metrics, no cards of stats, no chrome that competes with the content.
- **Emoji as iconography.** Currently used, currently wrong, and the first thing to go.
