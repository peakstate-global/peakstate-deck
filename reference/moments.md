# Building the moments

*Split out of `SKILL.md`. Open this file when you build or review the moments a deck's arc sheet planned.*

`/narrative-arc`, when installed, decides the moments before any slide exists: the throughline, each section's move, the peak at the end of act 3, the closing line in quotes, the open loop, the S.T.A.R. moment (Something They'll Always Remember), the stories, the mission, the light moments and, only when a true story serves the throughline, the optional "I was wrong" beat. This file says how to build each one on slides and where to record it on the planning slide. `/draft-eval`'s moments group checks the result when it is installed.

## The planning slide

The planning slide is the first backstage slide (`data-role="backstage-plan"`, with `data-hidden` and `data-hidden-src`), placed after the last presented slide. It holds everything the speaker plans and the room never sees, so the speaker notes stay a five-line briefing (`SKILL.md`, "Speaker notes are a briefing").

- **One row per presented slide, with columns for Act, Section, Move and Clock time:** the act, the section, the move (`encourage`, `justify`, `allay`, `confirm` or `on your side`), the beats placed there, and the stage directions.
- **Stage directions, in plain words, against the slide they belong to:** a pause of two to three seconds (at least at the peak and straight after the S.T.A.R. moment), a question to the room and the wait for its answer, where each story starts, and each light moment.
- **Clock times:** the minute each slide starts (a section's minutes, with a "keep tight" or "keep lean" mark, go in the note under the table), and the minute the first solution starts, which is at or after 40% of the running time.
- **The beats:** every required beat, on the slide that carries it, or a one-line reason it is left out.
- **The short cut:** what goes when time is short. Drop the optional beats first, then the demos. Stories and emotional beats stay.
- **The spine's state:** say "provisional" until the author's final outline locks it.

A generator does this in one place: a `move=` argument on its slide helper that feeds the planning slide, never the note. The build can then fail when a presented content slide has no move, when one of the five never appears, or when the first promise comes before any confirm or justify.

## The moment patterns

### The demo summary slide

Every demo of a tool or a skill is one summary slide, about 15 seconds of talk: what the tool did, what it changed, and a QR code that opens the full demonstration, a recording or the steps. The room takes the point; anyone who wants the detail scans for it. Demos are the second thing the short cut drops, after the optional beats.

### The emulated live demonstration

A full simulation of a live demonstration, so the room sees the work happen and nothing can fail on the night. It is not three static slides: a request, a result and a question in still frames read as a story about a demonstration, not as one. Use it at most once per talk, for the S.T.A.R. moment, when that moment would otherwise need a laptop and a network. Every other demo is a summary slide.

- **Slide 1, the console.** A full-slide agent console in the deck's palette, with the request pinned at the top. When the slide becomes active, a script streams the agent's output upward too fast to read, for about the length of the speaker's riff (around 30 seconds): thinking lines, tool calls, file reads, green and red diffs, a test that fails, the fix, and a passing run. Generate the lines in script from a short plan of the work, so the file stays small, and make them plausible for the result the next slide shows. A clock in the console's bar may run faster than real time to the elapsed time the result slide claims.
- **The landing.** The stream settles on the agent's final message and the link it produced. A large pointer, visible from the back of the room, rises from the lower part of the slide to the link, the link lights, the pointer presses, and the deck advances on its own to the result.
- **Slide 2, the result.** The finished result is already in place when the click lands, beside the real elapsed time and a short report (files changed, tests passed). The planning slide marks a pause on it before the speaker says anything.
- **Slide 3, the question.** A pattern-break slide with one question that turns the demonstration into the point. The planning slide marks the question to the room and a three-second pause.
- **Behaviour.** A forward key or a click during the stream skips straight to the link state, so the speaker can cut the riff short. Leaving the slide stops the stream and the timers; arriving again restarts it from the top. It runs only on the active slide, never in the overview, a thumbnail or a presenter preview. Reduced motion, print and the PowerPoint export show the settled frame (the final message, the link lit and the pointer on it), with no auto-advance. Keep that frame in the slide's own markup and put it back whenever the stream stops, so every clone shows it.
- **Motion audit.** The stream is script-driven, so `?motion` cannot see it and reports the slide as still. Say what runs, and for how long, in the slide's `data-motion` sentence. Never loosen the 7-second rule to fit it: the sequence is allowed because it covers the speaker's riff and a single press ends it.
- **Say it is an emulation.** The note and the sources field say the console replays a demonstration, how much faster than real time it runs, that invented details (names, amounts, counts, the link) claim nothing, and where any real figure, such as the elapsed time, comes from. The console's note gives the point of the riff in its first line, and the planning slide gives the cue to stop talking when the link appears.

### The pattern-break slide

One slide unlike every other slide: black with one line, one word, or one full-bleed photograph, with no header, no footer brand and no page furniture. Use it once per deck, for the S.T.A.R. moment or the peak. A second one cancels the first.

### Physical scale

A number nobody can picture becomes something the room can see or hold: a stack of paper, a barrow, a row of chairs. Draw it at true relative scale beside the thing it is compared with, or bring the object and name it in the note. The bare number goes on the slide small, under the object.

### Guess, then reveal

Plan two per talk. The first slide asks the room to commit to a guess (a show of hands, a number); the answer arrives on the next click or slide. The room remembers what it worked out better than what it was told. The guess slide carries the question and the answer options only, never a hint.

### Live scoring in the room

The room scores one of its own items against the deck's test: a show of hands on each criterion, or a score in their heads. The slide shows the criteria as a scorecard with empty boxes; the note's likely-question line and the planning slide cover how the speaker reads the room back to them ("about half the hands went down on the second question").

### The repeatable line

Each section gets one sentence written to be repeated in the corridor afterwards: short, rhythmic and concrete. Set it large on the section's key slide, and say it twice in the notes, once at the start of the section and once at its end.

### The confession slide (optional)

The "I was wrong" beat. Build this slide only when the arc sheet names a true story that serves the throughline; otherwise skip it, the arc sheet already says why in one line. When one is used, the slide shows what the speaker once believed or taught, then, on the click, what changed their mind, in their own words. Place it straight after the slide that challenges the room most. When the slide before it is heavy, the planning slide marks a self-deprecating line as the light moment, then the start of the confession story.

### The offer

The offer lives on a slide, a QR code and a hand-out, never in the speaker's mouth. The slide names what is on offer and who it is for, the QR code opens it, and the hand-out carries the same thing for anyone who does not scan. The speaker stays on the room's side and lets the slide make the offer.

### The closing slide that mirrors the title

The last presented slide uses the title slide's layout, colours and image, and carries the throughline or the opening line, now earned, as a closing line in quotes. Its note gives that line first, in quotes, and the few concrete first moves. No summary slide, no questions slide and no thank-you slide after it; take questions over this slide.

## Checking

If `/draft-eval` is installed, run it on the deck; if it is not, say it is missing and continue. Its moments group reads the presented slides, their notes and the backstage slides. The required checks are `four_acts`, `peak_and_end`, `five_moves`, `people_and_stories`, `wrong_and_credible`, `notes_briefing` and `pain_before_solution`, and each must pass. The recommended checks are `star_moment`, `quoted_close` and `light_moment`; they are reported and never block. A move on the planning slide is a claim the grader checks against what the slide says, not proof.
