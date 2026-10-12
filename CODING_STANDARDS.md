# Coding standards

Judgement calls for review. Anything a tool can check lives in `bun run check` instead; a rule here is one no check can make.

## Visual changes

- **Screenshots in the PR.** A diff that can change what the site or résumé looks like has a `bun run shots` section in the PR body (or a later comment), with images uploaded through `gh --attach`. No screenshots are committed.
- **Screenshots match the request.** Every page listed as changed traces to something the task asked for; anything else is a regression, even if it looks fine.
- **Both widths.** A layout change is judged at mobile and desktop. Text stays readable at both: no cramped type, no element that only fits one width.
- **Brand names stay whole.** "SITE Technologies" and similar names never wrap mid-name (`whitespace-nowrap`).

## Look and feel

The site is a tabletop character sheet: parchment page, graph-paper cards, ink, hand-drawn doodles, dragon-red headings and badges.

- **Theme tokens only.** Colours come from the `--color-*` tokens in `src/index.css`. A new text and background pairing gets a case in `src/theme.test.ts`, so AA contrast is tested.
- **Hover means clickable.** Only interactive elements change on hover. Badges, cards without a link, and doodles stay still.
- **Doodles are smooth hand-drawn strokes**, consistent with `src/components/ui/doodle.tsx` and `ink.tsx`: one stroke weight, rounded caps, no jitter artifacts.
- **Matches its neighbours.** A new component reuses `src/components/ui` variants before it adds classes of its own.
- **Decoration is lazy and fails quietly.** three.js and cannon-es stay in the lazily loaded dice chunk. A missing WebGL or failed chunk leaves the page usable.

## Copy

- **The résumé is the source.** Facts about jobs, skills, education and the summary come from `src/data/resume.ts`. Copy on the page derives from it word for word rather than restating or condensing it.
- **No invented voice.** New first-person copy, taglines or bios need the owner's sign-off in the task. Agents don't write them speculatively.

## Code

- **Tests for logic.** Physics, layout maths and data derivations get `bun test` cases next to the code. Appearance is judged from the PR screenshots, not DOM assertions.
- **Suppressions are narrow and explained.** A `biome-ignore` or `@ts-expect-error` covers one line and says why.
- **Comments say why**, in one line, matching the surrounding density.
