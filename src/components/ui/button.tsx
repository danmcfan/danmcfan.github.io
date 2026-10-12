import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[3px] font-serif text-base transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        ink: "bg-ink text-parchment hover:bg-dragon",
        outline:
          "border border-ink/50 bg-card/60 text-ink hover:border-dragon hover:text-dragon",
        ghost: "text-ink hover:text-dragon",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-sm",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
