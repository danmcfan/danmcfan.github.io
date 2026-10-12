import { cn } from "../../lib/cn";

export type DieSides = 4 | 6 | 8 | 20;

/** Outline of each die, drawn in a 32px box. */
const faces: Record<DieSides, string> = {
  4: "M16 2.5 L29 24 L16 29.5 L3 24 Z M16 2.5 V29.5",
  6: "M16 2.5 L28 9 V23 L16 29.5 L4 23 V9 Z M4 9 L16 15.5 L28 9 M16 15.5 V29.5",
  8: "M16 2.5 L28 9 V23 L16 29.5 L4 23 V9 Z M16 2.5 L28 23 H4 Z",
  20: "M16 2.5 L28 9 V23 L16 29.5 L4 23 V9 Z M16 10 L23 21.5 H9 Z M16 2.5 V10 M28 23 L23 21.5 M4 23 L9 21.5",
};

type DieProps = {
  sides: DieSides;
  class?: string;
};

/** A small hand-drawn die, used as a list marker. */
export function Die(props: DieProps) {
  return (
    <svg
      class={cn("overflow-visible", props.class)}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={faces[props.sides]} filter="url(#sketch)" />
    </svg>
  );
}
