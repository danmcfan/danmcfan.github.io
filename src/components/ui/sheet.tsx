import { type JSX, Show } from "solid-js";

import { cn } from "../../lib/cn";

const framePaths = {
  // Notched corners, like the ability score boxes on a 5e sheet.
  ability: "M9 2 H91 L98 9 V111 L91 118 H9 L2 111 V9 Z",
  shield:
    "M50 3 C 64 10, 82 10, 96 7 V 50 C 96 80, 74 98, 50 107 C 26 98, 4 80, 4 50 V 7 C 18 10, 36 10, 50 3 Z",
  plaque: "M6 2 H94 C 96 2, 98 4, 98 6 V104 C 98 106, 96 108, 94 108 H6 C 4 108, 2 106, 2 104 V6 C 2 4, 4 2, 6 2 Z",
} as const;

type FrameShape = keyof typeof framePaths;

/** Inked outline that stretches to fill its parent. */
export function SheetFrame(props: { shape: FrameShape; class?: string }) {
  return (
    <svg
      class={cn("pointer-events-none absolute inset-0 size-full overflow-visible", props.class)}
      viewBox={props.shape === "ability" ? "0 0 100 120" : "0 0 100 110"}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={framePaths[props.shape]}
        class="fill-card/70 stroke-ink"
        stroke-width="2"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  );
}

type SheetFieldProps = {
  label: string;
  children: JSX.Element;
  class?: string;
};

/** A value written on a line with its small-caps label beneath, as in a sheet header. */
export function SheetField(props: SheetFieldProps) {
  return (
    <div class={cn("flex min-w-0 flex-col-reverse justify-start", props.class)}>
      <dt class="pt-1 font-mono text-[0.58rem] tracking-[0.14em] text-ink-soft uppercase">
        {props.label}
      </dt>
      <dd class="m-0 border-b border-ink/50 pb-0.5 font-hand text-[1.35rem] leading-tight text-pencil">
        {props.children}
      </dd>
    </div>
  );
}

type AbilityScoreProps = {
  label: string;
  value: string;
  abbr: string;
  /** Read by screen readers and shown as a tooltip. */
  detail: string;
};

export function AbilityScore(props: AbilityScoreProps) {
  return (
    <div class="relative grid h-[5.75rem] place-items-center px-1 pt-2 pb-4 text-center" title={props.detail}>
      <SheetFrame shape="ability" />
      <p class="relative font-mono text-[0.55rem] leading-none tracking-[0.12em] uppercase">{props.label}</p>
      <p class="relative font-display text-[1.6rem] leading-none text-dragon" aria-hidden="true">
        {props.value}
      </p>
      <p class="sr-only">
        {props.value}: {props.detail}
      </p>
      <span
        class="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-[50%] border-2 border-ink bg-parchment px-2.5 py-0.5 font-mono text-[0.6rem] leading-none"
        aria-hidden="true"
      >
        {props.abbr}
      </span>
    </div>
  );
}

type StatBoxProps = {
  label: string;
  value: string | number;
  shape?: FrameShape;
  hint?: string;
};

/** Small framed number, like armour class or initiative. */
export function StatBox(props: StatBoxProps) {
  return (
    <div class="relative flex min-h-24 flex-col-reverse items-center justify-center gap-1 px-2 pt-3 pb-4 text-center">
      <SheetFrame shape={props.shape ?? "plaque"} />
      <dt class="relative font-mono text-[0.58rem] leading-tight tracking-[0.12em] uppercase">
        {props.label}
        <Show when={props.hint}>
          <span class="block font-hand text-sm tracking-normal text-pencil normal-case">{props.hint}</span>
        </Show>
      </dt>
      <dd class="relative m-0 font-display text-4xl leading-none text-ink">{props.value}</dd>
    </div>
  );
}

/** Proficiency bubble. */
export function Pip(props: { filled?: boolean; class?: string }) {
  return (
    <i
      class={cn(
        "inline-block size-2.5 shrink-0 rounded-full border-[1.5px] border-ink",
        props.filled && "bg-ink",
        props.class,
      )}
      aria-hidden="true"
    />
  );
}
