# Building the moments

*Split out of `SKILL.md`. Open this file when you build or review the moments a deck's arc sheet planned.*

`/narrative-arc` decides the moments before any slide exists: the throughline, each slide's move and its line, the peak, the last 60 seconds, the open loop, the S.T.A.R. moment (Something They'll Always Remember), the stories, the credibility story, the "I was wrong" beat and the light moments. This file says how to build each one on slides and how to mark it in the notes. `/draft-eval`'s moments group checks the result.

## Stage directions in the speaker notes

Every presented content slide's note opens with its move tag and the line that delivers the move, in quotes. The rest of the note follows. Stage directions sit in square brackets where they happen.

| Direction | Means | Where it goes |
|---|---|---|
| `[MOVE: x]` | The slide's move: `encourage`, `justify`, `allay`, `confirm` or `on your side` | First, on every slide that makes a move |
| `[PAUSE]` | Hold a silence of two to three seconds; the silence is punctuation | At least at the peak and straight after the S.T.A.R. moment |
| `[ASK]` | Ask the room a question, and wait for the answer | Where the room guesses, scores or answers |
| `[STORY]` | A story starts here | At the first line of each story |
| `[LIGHT]` | A planned light moment: a joke, a self-deprecating line, a comic callback | At the line itself, first straight after the heaviest slide |

    [MOVE: confirm] "I know what half of you are thinking, that we have always built
    things nobody asked for, and you're right." [ASK] First the question ...
    [PAUSE] Hold the silence for three seconds ...

A generator does this in one place: a `move=(tag, line)` argument on its slide helper that prefixes the note, and a hidden moves map slide that lists every presented slide with its move. The build can then fail when a presented content slide has no move, when one of the five never appears, or when the first promise comes before any confirm or justify.

## The moment patterns

### The emulated live demonstration

A live demonstration replayed on three slides, so nothing can fail on the night. Use it for a dramatisation or an S.T.A.R. moment that would otherwise need a laptop and a network.

- **Slide 1, the request.** The prompt or request exactly as typed, in a terminal or a form, with a clock at 0:00. The note reads the request aloud, slowly, and says what is missing (no specification, no ticket).
- **Slide 2, the result, with a clock.** The finished result arrives on the click, beside the clock at its real elapsed time (for example 1:28) and a short report (files changed, tests passed). `[PAUSE]` on the clock before the click.
- **Slide 3, the question.** A pattern-break slide with one question that turns the demonstration into the point, such as "Did anyone here want that?". `[ASK]`, then `[PAUSE]` for three seconds.
- **Say it is an emulation.** The note and the sources field say the slides replay a demonstration, that invented details (names, amounts, counts) claim nothing, and where any real figure, such as the elapsed time, comes from.

### The pattern-break slide

One slide unlike every other slide: black with one line, one word, or one full-bleed photograph, with no header, no footer brand and no page furniture. Use it once per deck, for the S.T.A.R. moment or the peak. A second one cancels the first.

### Physical scale

A number nobody can picture becomes something the room can see or hold: a stack of paper, a barrow, a row of chairs. Draw it at true relative scale beside the thing it is compared with, or bring the object and name it in the note. The bare number goes on the slide small, under the object.

### Guess, then reveal

Plan two per talk. The first slide asks the room to commit to a guess (`[ASK]`, a show of hands, a number); the answer arrives on the next click or slide. The room remembers what it worked out better than what it was told. The guess slide carries the question and the answer options only, never a hint.

### Live scoring in the room

The room scores one of its own items against the deck's test: a show of hands on each criterion, or a score in their heads. The slide shows the criteria as a scorecard with empty boxes; the note scripts how the speaker reads the room back to them ("about half the hands went down on the second question").

### The repeatable line

Each section gets one sentence written to be repeated in the corridor afterwards: short, rhythmic and concrete. Set it large on the section's key slide, and say it twice in the notes, once at the start of the section and once at its end.

### The confession slide

The "I was wrong" beat. The slide shows what the speaker once believed or taught, then, on the click, what changed their mind, in their own words. Place it straight after the slide that challenges the room most. The note opens `[LIGHT]` with a self-deprecating line when the slide before it is heavy, then `[STORY]` for the confession itself.

### The closing slide that mirrors the title

The last presented slide uses the title slide's layout, colours and image, and carries the throughline or the opening line, now earned. The note scripts the last 60 seconds word for word and ends on where to start. No summary slide, no questions slide and no thank-you slide after it; take questions over this slide.

## Checking

Run `/draft-eval` on the deck. Its moments group checks `star_moment`, `peak_and_end`, `five_moves`, `people_and_stories`, `wrong_and_credible`, `light_moment` and `stage_directions`, and the group passes only when every check passes. A `[MOVE: x]` tag is a claim the grader checks against what the slide says, not proof.
