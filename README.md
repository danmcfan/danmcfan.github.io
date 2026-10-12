# dannyobrien.dev

Personal site: a quest board of projects and a character sheet, styled like a tabletop game on graph paper.

Built with SolidJS, Tailwind CSS v4 and a small set of shadcn-style components in `src/components/ui`. The dice are three.js, loaded lazily in `src/components/dice`.

```bash
bun install
bun run dev     # http://localhost:3000
bun run build   # outputs dist/
```

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`.
