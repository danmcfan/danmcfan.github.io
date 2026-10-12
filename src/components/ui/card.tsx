import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";

import { cn } from "../../lib/cn";

export const cardVariants = cva("relative flex flex-col text-ink", {
  variants: {
    variant: {
      notice:
        "border border-ink/25 bg-card shadow-[0_2px_0_rgb(46_34_25/0.06),0_8px_14px_-10px_rgb(40_25_10/0.5)]",
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
