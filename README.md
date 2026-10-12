# dannyobrien.dev

Personal site: a quest board of projects and a character sheet, styled like a tabletop game on graph paper.

Built with SolidJS, Tailwind CSS v4 and a small set of shadcn-style components in `src/components/ui`. The dice are three.js, loaded lazily in `src/components/dice`.

```bash
bun install
bun run dev          # http://localhost:3000
bun run check        # typecheck, lint, unit tests and build; warnings fail
bun run shots        # before/after screenshots against origin/main for a PR (needs Docker)
bun run resume       # prints src/data/resume.ts to public/Daniel_OBrien_Resume.pdf
```

The résumé lives in `src/data/resume.ts`: edit it there and the PDF and the character sheet both follow.

Pushes to `main` run the checks, build the résumé PDF and deploy to GitHub Pages via `.github/workflows/deploy.yml`. Pull requests run the same checks.
