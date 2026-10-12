import type { JSX } from "solid-js";

type DoodleProps = {
  draw: () => JSX.Element;
  class?: string;
};

/** Icon drawn with a gentle wobble, like a confident pencil sketch. */
export function Doodle(props: DoodleProps) {
  return (
    <svg
      class={props.class}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <g filter="url(#sketch-soft)" stroke-width="2.6">
        {props.draw()}
      </g>
    </svg>
  );
}
