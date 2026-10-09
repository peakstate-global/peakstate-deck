# Motion and metaphor

**A deck carries its meaning in pictures and movement, and the words are the last resort.** Every
presented slide has a visual that shows its one point. Every movement on a slide says something
about that point. The foreground movement settles within 7 seconds, so the room (or the video
edit) comes back to the speaker. Subtle background loops may run for the whole slide.

Read this when you plan, build or review the visuals and motion of a deck. The worked examples come
from a workshop deck on AI hallucination and provenance (34 presented slides), which is the
reference standard for how visual a deck should be.

## The visual budget

- **Every presented slide carries a visual.** Aim for nine slides in ten. A text-only slide is a
  title, a pull quote from an authority, or a section line, and the generator comment says why it
  has no picture.
- **A non-technical slide carries about 25 words or fewer.** In the reference deck, the story slides
  carry 7 to 24 words: 7 and 8 on the cartoons, 11 to 14 on the cat sentence, 24 on the
  illustration of the pit under the stage. The speaker notes carry the
  rest.
- **A technical slide may carry more words, but they sit inside an artefact.** A citation panel, a
  decision log, a terminal, a scorecard, a food label, a sign-off card. The slide states the rule in
  one line, and the artefact arrives on the next click (`data-build`). In the reference deck, six
  slides of 126 to 216 words work this way, and each one reads as a picture of the thing, not as a
  paragraph.
- **Vary the kind of visual across the deck.** The reference deck uses line-art illustrations, a
  single-panel cartoon, a ranked chart, an object (a riveted black box), a dictionary entry, a
  rubber stamp, mock artefacts and big numbers. No two neighbouring slides use the same kind.
- **Plan the metaphors as a set.** A metaphor can come back later as a callback. In the reference
  deck, robot monkeys sort gems from rubbish in a pit under the stage early on, and at the close the
  same monkey sorts nuggets from rubbish on a conveyor. The problem board has sienna top rules and
  the answer board has the same tiles with gold rules.

## Motion rules

- **Every movement means something.** Before you add a movement, write what it says in one
  sentence. If the sentence is "it looks lively", delete the movement.
- **Foreground motion settles by 7 seconds after the slide arrives, or after the click that
  started it. Design for 5.** Foreground motion is anything that draws the eye: an entrance, a
  morph, a chart drawing, a stamp, a shake. After the settle point the foreground is still. On
  stage the audience looks back at the speaker. In a video edit, the settle point is where the cut
  goes back to the speaker.
- **Subtle loops are welcome when they mean something.** A blinking cursor says the system is
  still live. Slow drifting clouds say time passes. A faint pulse on a node says it is the one in
  focus. A loop is subtle when it is small, slow and low in contrast, so it does not pull the eye
  away from the speaker. Mark the element, or a wrapper, `data-ambient`, which tells the motion
  audit the loop is on purpose.
- **Check it with `index.html?motion`.** The motion audit visits every presented slide and reports
  when its motion settles. A slide that settles after 7 seconds is `LATE`. A loop outside
  `data-ambient` is `LOOP`. Each one is a problem to fix or to mark. It sees arrival motion only,
  not motion that a click build or a script timer starts.
- **Motion slows to rest.** Use an ease-out, a damped shake or a small overshoot that settles. A
  hard stop at full speed reads as a glitch.
- **The settled frame is the slide.** Print, `?export`, reduced motion and a paused video show the
  end state, so the end state must make the point on its own.
- **One motion idea per slide.** Several things can move, but they tell one story, in order. Two
  unrelated movements compete for the eye.
- **State the point, then move.** The rule or headline is on screen before the animation that
  shows it. A morph waits for its travellers to land before the rest of the slide arrives (the
  runtime does this).
- **Move whole things, never text the layout flows around.** A morph that reflows a line looks like
  the layout is tearing. Scale or translate a wrapper instead (`slides/README.md`, *Morph*).
- **The push between slides only says "next".** Save meaningful motion for inside the slide, and
  make the move between slides immersive wherever the next slide continues the same world (the
  next section).

## Immersive transitions

**When the next slide continues the same scene or the same object, carry the audience across
instead of cutting.** The audience should feel they move through one world, not flip cards.

- **Morph the thing that continues.** Link the pair (`data-morph-link`) and key the element that
  carries over (`data-morph="key"`): the stamp word becomes the dictionary headword, the sentence
  passes into the black box. Two or three keyed elements, never the whole slide.
- **Pan across one scene.** Key a background layer (a horizon, a landscape, a texture) on both
  slides of a linked pair, placed a short distance apart, and set `data-morph-ms` long enough to
  feel like a camera move. The runtime pans the background first and the new foreground arrives
  when it lands. Keep the shift small (a tenth of the slide width or less) so it reads as a camera
  move, not as a second subject. True layered parallax, where near and far layers move at
  different speeds during the change, is not built in the runtime yet.
- **Zoom into a detail.** Key the detail on both slides, small on the first and large on the
  second, with `data-morph-scale`. The next slide is the inside of the thing the audience was
  looking at.
- **Keep the immersive move for continuity.** A section change is a real change of place, so it
  pushes or cuts. Immersion between unrelated slides is arbitrary motion.
- **Distant callbacks.** When a later slide answers an earlier one (a problem board and its answer
  board), make them neighbours, or repeat the earlier board just before the answer so the pair can
  morph.

## Match the motion to the metaphor

Pick the motion that acts out the idea. These are starting points, not a fixed list.

| The idea | The motion |
|---|---|
| Unreliable, shaky, uncertain | A jiggle whose size scales with the value, damping to rest |
| A verdict, a ruling, a label applied | A stamp that drops large and faint, hits slightly small, settles |
| The same thing becomes something else | A morph: the key element travels to its new role |
| Choices resampled from a set | States of one slide: the old option exits, the new one enters, the anchor stays still |
| Input passes through a process | A morph carries the input across and into the process |
| A trend, growth or drift over time | The line or bars draw in time order |
| A change exposes a failure | One click reveals the new version and turns the failed row red together |
| A rule enforced live | A log that types out, each verdict landing after its line |
| A shift in weight or priority | A seesaw or scale tips and settles |
| Pieces combine into a whole | Parts travel in and lock together |
| Erosion, decay, loss | Fade, crumble or drain, slowly |
| Order from chaos | Scattered items slide into a grid |
| A system still live or watching | A subtle blinking cursor or slow pulse (`data-ambient`) |
| Time passing, a living scene | A slow background drift (`data-ambient`) |
| Moving deeper into one idea | A zoom morph into a detail, or a pan across one scene on a linked pair |

## Worked examples from the reference deck

**The hallucination scatter.** Point: the hallucination rates of the last two flagship models
from each of five makers reshuffle between versions, so no ranking holds. The numbers sit in two
rough columns, deliberately not aligned, coloured gold to sienna by rate. The left column fades in
rank by rank, wavy arrows wipe across (`hwipe`, 1.2s from 1s), then the right column lands. Each
number shakes (`hjig`) with an amplitude proportional to its rate: 92% shakes at ten times the
base, 15% at 1.6. The shake damps to zero, the left column by 5.5s and the right by 7s. The
unreliable numbers behave unreliably, then go still so the speaker can talk over a calm chart.

**The stamp.** Point: the convincing journal page the audience just read was confabulated. The
next slide keeps the page in place (`data-morph-link` with the title keyed on both sides, so
nothing pushes). A rubber stamp drops onto it (`stamp-hit`, 0.55s: scale 1.9 to 0.93 to 1, held
at -7 degrees). Then the stamp word travels (morph key `confab`) to become the headword of a
dictionary entry on the slide after. The verdict lands on the thing you believed, then becomes the
term you learn.

**The cat sentence.** Point: a model picks its next word from probabilities, and even absurd words
stay possible. "The cat sat on the ___" is one slide with six states. The cat never moves. The
word and its percentage drop in (`flash-down`) and the perch the cat sits on slides in
(`flash-left`, 300ms), while the old ones exit. The rule under the blank morphs to each word's
width. The audience watches the model resample.

**The black box.** Point: only the output of a model can be checked. Through a linked pair, the
cat sentence shrinks left, the chosen word crosses right, and a riveted box marked LLM fades in
between them with "???" inside. The same sentence passes through the box.

**The regression scorecard.** Point: re-running fixed test questions on every change catches
drift. The first click shows version 1's scores. The second click reveals version 2 and turns the
failed row red in the same step, so the update itself exposes the regression.

**The fallen sticker.** Point: an "AI was used" label answers none of the reader's questions, and a
food-style label does. A still picture can tell a movement: the sticker sits folded on the floor
below the label, with a smear on the wall where it slid down. Not every story needs animation.

## In the generator

Add two lines to the comment above each slide, after the point, the metaphor and how it is shown:

    # Motion: the numbers shake in proportion to their rate, then go still.
    # Settles by: 7s. Ambient: none.

Write `Motion: none` when the slide is still. A deck where every slide says `none` is a deck that
has not asked the question.
