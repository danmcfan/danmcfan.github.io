import { type JSX } from "solid-js";

type DoodleProps = {
  draw: () => JSX.Element;
  class?: string;
};

/** Icon drawn twice with a wobble filter, like a pencil sketch. */
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
      <g filter="url(#sketch)">
        <g stroke-width="2.4">{props.draw()}</g>
        <g stroke-width="1.2" opacity="0.45" transform="translate(1.1 0.8) rotate(1.5 32 32)">
          {props.draw()}
        </g>
      </g>
    </svg>
  );
}
