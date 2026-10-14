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

A full simulation of a live demonstration, so the room sees the work happen and nothing can fail on the night. It is not three static slides: a request, a result and a question in still frames read as a story about a demonstration, not as one. Use it for a dramatisation or an S.T.A.R. moment that would otherwise need a laptop and a network.

- **Slide 1, the console.** A full-slide agent console in the deck's palette, with the request pinned at the top. When the slide becomes active, a script streams the agent's output upward too fast to read, for about the length of the speaker's riff (around 30 seconds): thinking lines, tool calls, file reads, green and red diffs, a test that fails, the fix, and a passing run. Generate the lines in script from a short plan of the work, so the file stays small, and make them plausible for the result the next slide shows. A clock in the console's bar may run faster than real time to the elapsed time the result slide claims.
- **The landing.** The stream settles on the agent's final message and the link it produced. A large pointer, visible from the back of the room, rises from the lower part of the slide to the link, the link lights, the pointer presses, and the deck advances on its own to the result.
- **Slide 2, the result.** The finished result is already in place when the click lands, beside the real elapsed time and a short report (files changed, tests passed). `[PAUSE]` on it before the speaker says anything.
- **Slide 3, the question.** A pattern-break slide with one question that turns the demonstration into the point. `[ASK]`, then `[PAUSE]` for three seconds.
- **Behaviour.** A forward key or a click during the stream skips straight to the link state, so the speaker can cut the riff short. Leaving the slide stops the stream and the timers; arriving again restarts it from the top. It runs only on the active slide, never in the overview, a thumbnail or a presenter preview. Reduced motion, print and the PowerPoint export show the settled frame (the final message, the link lit and the pointer on it), with no auto-advance. Keep that frame in the slide's own markup and put it back whenever the stream stops, so every clone shows it.
- **Motion audit.** The stream is script-driven, so `?motion` cannot see it and reports the slide as still. Say what runs, and for how long, in the slide's `data-motion` sentence. Never loosen the 7-second rule to fit it: the sequence is allowed because it covers the speaker's riff and a single press ends it.
- **Say it is an emulation.** The note and the sources field say the console replays a demonstration, how much faster than real time it runs, that invented details (names, amounts, counts, the link) claim nothing, and where any real figure, such as the elapsed time, comes from. The console's note gives the speaker the riff, word for word, with `[PAUSE]` and the cue to stop talking when the link appears.

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
