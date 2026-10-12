import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";

import { cn } from "../../lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center rounded-[2px] border font-mono text-[0.7rem] leading-none whitespace-nowrap",
  {
    variants: {
      variant: {
        tag: "border-ink/40 bg-white/40 px-1.5 py-1 text-ink",
        seal: "border-2 border-current px-2 py-1 font-semibold tracking-widest uppercase -rotate-2",
      },
    },
    defaultVariants: {
      variant: "tag",
    },
  },
);

type BadgeProps = JSX.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge(props: BadgeProps) {
  const [local, rest] = splitProps(props, ["class", "variant"]);
  return (
    <span
      class={cn(badgeVariants({ variant: local.variant }), local.class)}
      {...rest}
    />
  );
}
