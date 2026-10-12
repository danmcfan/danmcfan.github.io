# dannyobrien.dev

Merging to `main` deploys the live site. Work on a branch and open a PR; CI (`.github/workflows/checks.yml`) must be green.

- **Gate**: `bun run check` (typecheck, lint, unit tests, build). Any warning fails it. `bun run lint:fix` formats.
- **Screenshots**: `bun run shots` captures every page at desktop and mobile, plus the résumé, on `origin/main` and on your branch, and diffs them. Needs Docker running. Output goes to `test-results/shots/` (gitignored); screenshots are never committed. To look at a page, read `after/*.png`; `diff/*.png` marks what moved.
- **PR**: a PR that changes anything visible carries its screenshots. Append `test-results/shots/screenshots.md` to the body file and upload the images with `gh`'s `--attach` flag, which swaps each local path for an uploaded URL:
  `gh pr create --title "…" --body-file body.md $(cat test-results/shots/attach.txt)`
  After a later visual push, rerun `bun run shots` and post with `gh pr comment <number> --body-file test-results/shots/screenshots.md $(cat test-results/shots/attach.txt)`. Flags and alt-text syntax: https://docs.github.com/en/github-cli/github-cli/attaching-files-with-github-cli
- **Résumé**: `src/data/resume.ts` is the single source for the PDF (`bun run resume`) and the character sheet's facts. Site-only additions (map landmarks, the full Far Western name) live in `src/data/positions.ts`.
- **Review rules**: `CODING_STANDARDS.md`.
