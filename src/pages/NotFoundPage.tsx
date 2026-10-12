import { A } from "@solidjs/router";

import { buttonVariants } from "../components/ui/button";
import { usePageTitle } from "../lib/usePageTitle";

export function NotFoundPage() {
  usePageTitle("Lost");

  return (
    <div class="grid justify-items-start gap-4 py-6">
      <p class="font-mono text-xs tracking-[0.14em] text-ink-soft uppercase">404 · page not found</p>
      <h2 class="font-display text-4xl text-dragon">You rolled a natural 1</h2>
      <p class="max-w-[60ch] text-lg">
        This path leads nowhere. The map may be out of date, or the page has moved on to another campaign.
      </p>
      <A href="/projects" class={buttonVariants({ variant: "ink" })}>
        Back to the quest board
      </A>
    </div>
  );
}
