import { type JSX } from "solid-js";

import { cn } from "../../lib/cn";
import { cardVariants } from "../ui/card";
import { Doodle } from "../ui/doodle";

export type AboutIcon = "briefcase" | "pin" | "hourglass" | "cap";

const doodles: Record<AboutIcon, () => JSX.Element> = {
  briefcase: () => (
    <>
      <path d="M9 23 h46 v30 h-46 z" />
      <path d="M24 23 v-6 c0-2 1-3 3-3 h10 c2 0 3 1 3 3 v6" />
      <path d="M9 35 h46" />
      <path d="M28 32 h8 v7 h-8 z" />
    </>
  ),
  pin: () => (
    <>
      <path d="M32 52 C 22 40, 16 32, 16 24 a16 16 0 0 1 32 0 c0 8 -6 16 -16 28 z" />
      <circle cx="32" cy="24" r="6" />
      <path d="M20 58 c6-3 18-3 24 0" />
    </>
  ),
  hourglass: () => (
    <>
      <path d="M17 8 h30 M17 56 h30" />
      <path d="M21 8 C 21 22, 41 24, 41 32 C 41 40, 21 42, 21 56" />
      <path d="M43 8 C 43 22, 23 24, 23 32 C 23 40, 43 42, 43 56" />
      <path d="M26 53 c2-5 10-5 12 0" />
      <path d="M32 34 v12" />
    </>
  ),
  cap: () => (
    <>
      <path d="M5 25 L32 14 L59 25 L32 36 z" />
      <path d="M17 30 v11 c0 6 30 6 30 0 v-11" />
      <path d="M53 27 v15" />
      <path d="M50 42 h6 l-3 7 z" />
    </>
  ),
};

type AboutCardProps = {
  icon: AboutIcon;
  label: string;
  children: JSX.Element;
};

/** One fact about me, written on its own graph-paper card. */
export function AboutCard(props: AboutCardProps) {
  return (
    <li class={cn(cardVariants({ variant: "notice" }), "flex-row items-center gap-3 bg-graph px-5 py-5 lg:gap-4 lg:px-6")}>
      <div class="grid min-w-0 flex-1 gap-0.5">
        <p class="font-mono text-xs tracking-[0.12em] text-ink-soft uppercase">{props.label}</p>
        <p class="font-hand text-xl leading-tight whitespace-nowrap text-pencil sm:text-2xl md:text-xl lg:text-2xl">{props.children}</p>
      </div>
      <Doodle draw={doodles[props.icon]} class="size-9 shrink-0 text-ink lg:size-11" />
    </li>
  );
}
