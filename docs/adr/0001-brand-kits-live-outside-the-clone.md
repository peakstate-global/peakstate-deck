# 1. Brand kits live outside the clone, and the repo ships no brand

Date: 2026-11-13. Status: accepted.

## Context

The repo shipped one brand theme in `themes/`, and the no-theme default still looked like that
brand (a serif, light headings, a rust-coloured rule). A user's own theme had to sit inside the
clone, where the next `git pull` could collide with it. A stranger installing the skill met
another company's look as the starting point.

## Decision

- **The repo ships one look: a built-in default** in the Keynote Basic White style, held as the
  fallback values of `slides/deck.css`. It is not a theme folder.
- **Every brand is a brand kit outside the clone**, under `~/.config/peakstate-deck/themes/<kit>/`
  (or `$XDG_CONFIG_HOME`). A kit is a theme folder plus `DESIGN.md` and `rules.md`. First-run
  setup writes it. `bin/deck` and the exporter look there, never in the clone.
- **The repo's own brand theme is removed.** Its shapes (agenda, references, provenance,
  tables, the other treatments) move into the default. Its marks, palette and type leave. The
  maintainer's brand becomes a kit made by the same setup as anyone's.
- **Git history is not rewritten.** The removed files stay in history.

## Rejected alternatives

- **Keep the brand theme as an opt-in example.** It would be the worked example of a kit, but it
  publishes a company's brand to everyone and makes it the look a stranger copies from. A neutral
  fixture kit in `tests/fixtures/kit/` does the teaching job.
- **Kits inside the clone, gitignored.** A `git pull` or a re-clone loses them, and a plugin
  install puts the clone in a cache folder the user should not edit.
- **The default as a theme folder.** A theme the user can delete leaves the engine with no look.
  Fallback values in the engine's own stylesheet cannot go missing.
- **Rewrite history to remove the old theme.** It cannot be undone on a public repo. It would
  also leave the same brand in old `SKILL.md` and README text, and the brand is public on its
  owner's own website, so it would remove very little.

## Consequences

- `--theme` with the removed theme's name stops working. A deck scaffolded before this change keeps its copied
  stylesheets and still builds. Its PowerPoint export finds the kit by name in the config folder,
  so a kit made under the old theme's name keeps old decks exporting.
- A kit's stylesheets load after `deck.css`, so a kit can override any treatment selector as well
  as set the hooks.
- The variable hooks a kit sets are renamed to `--brand-*`, documented in `slides/README.md`.
- Tests measure the default example deck, `slides/example.html`.
