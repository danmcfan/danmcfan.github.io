import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";

import { cn } from "../../lib/cn";

export const cardVariants = cva("relative flex flex-col text-ink", {
  variants: {
    variant: {
      notice:
        "border border-ink/25 bg-card shadow-[0_2px_0_rgb(46_34_25/0.06),0_8px_14px_-10px_rgb(40_25_10/0.5)]",
      sheet: "rounded-[6px_10px_6px_10px] border-2 border-ink bg-card/60",
    },
  },
  defaultVariants: {
    variant: "notice",
  },
});

type CardProps = JSX.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>;

export function Card(props: CardProps) {
  const [local, rest] = splitProps(props, ["class", "variant"]);
  return (
    <div
      class={cn(cardVariants({ variant: local.variant }), local.class)}
      {...rest}
    />
  );
}

type SheetBoxProps = JSX.HTMLAttributes<HTMLElement> & { label: string };

/** A labelled box in the style of a character sheet field. */
export function SheetBox(props: SheetBoxProps) {
  const [local, rest] = splitProps(props, ["class", "label", "children"]);
  return (
    <section
      class={cn(cardVariants({ variant: "sheet" }), "gap-3 p-4 pb-5", local.class)}
      {...rest}
    >
      {/* First in the DOM so it heads the box's content; drawn on the bottom edge. */}
      <h3 class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-parchment px-2 font-mono text-[0.7rem] tracking-[0.12em] whitespace-nowrap uppercase">
        {local.label}
      </h3>
      {local.children}
    </section>
  );
}
