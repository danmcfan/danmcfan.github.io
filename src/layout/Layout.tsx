import { useLocation } from "@solidjs/router";
import { createEffect, on, type JSX } from "solid-js";

import { DiceLayer } from "../components/dice/DiceLayer";
import { NavBar } from "../components/navigation/NavBar";
import { InkRule, SketchFilter } from "../components/ui/ink";
import { socials } from "../data/socials";

type LayoutProps = {
  children?: JSX.Element;
};

export function Layout(props: LayoutProps) {
  const location = useLocation();
  let main!: HTMLElement;
  let sheet!: HTMLDivElement;
  let diceTray!: HTMLDivElement;

  // Replay the page-in animation on every route change.
  createEffect(
    on(
      () => location.pathname,
      () => {
        main.classList.remove("motion-safe:animate-page-in");
        void main.offsetWidth;
        main.classList.add("motion-safe:animate-page-in");
      },
      { defer: true },
    ),
  );

  return (
    <div class="relative flex min-h-dvh flex-col overflow-x-clip bg-parchment-page text-ink">
      <SketchFilter />
      <div
        ref={sheet}
        class="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8 md:px-14 md:py-12"
      >
        <header class="grid gap-x-6 md:grid-cols-[1fr_minmax(0,20rem)]">
          <div
            ref={diceTray}
            class="order-first h-24 md:order-none md:col-start-2 md:row-start-1 md:h-auto"
            aria-hidden="true"
          />
          <div class="grid gap-3 md:col-start-1 md:row-start-1">
            <p class="font-mono text-xs tracking-[0.18em] text-ink-soft uppercase">
              Software Engineer
            </p>
            <h1 class="font-display text-5xl leading-none text-dragon md:text-6xl">
              Danny O&apos;Brien
            </h1>
            <div class="pt-2">
              <NavBar />
            </div>
          </div>
        </header>

        <InkRule class="mt-6 mb-10 w-full max-w-xs" />

        <main ref={main} class="flex-1">
          {props.children}
        </main>

        <footer class="mt-16 grid gap-3">
          <InkRule class="max-w-40" />
          <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-sm text-ink-soft">
            <p>© {new Date().getFullYear()} Danny O&apos;Brien</p>
            <ul class="flex gap-5">
              {socials.map((social) => (
                <li>
                  <a
                    class="underline decoration-ink/30 underline-offset-4 hover:text-dragon hover:decoration-wavy"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.kind === "github" ? "GitHub" : "LinkedIn"}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
      <DiceLayer sheet={() => sheet} tray={() => diceTray} />
    </div>
  );
}
