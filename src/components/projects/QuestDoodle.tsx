import { type JSX } from "solid-js";

import { type Project } from "../../data/projects";
import { Doodle } from "../ui/doodle";

const doodles: Record<Project["icon"], () => JSX.Element> = {
  // Arcade cabinet
  gamepad: () => (
    <>
      <path d="M18 58 V12 c0-3 2-5 5-5 h18 c3 0 5 2 5 5 V58" />
      <path d="M22 13 h20 v15 h-20 z" />
      <path d="M18 34 h28" />
      <circle cx="27" cy="42" r="2.5" />
      <path d="M36 41 h6 M36 46 h6" />
      <path d="M14 58 h36" />
    </>
  ),
  // Sprout
  sprout: () => (
    <>
      <path d="M32 58 C 32 46, 31 38, 32 28" />
      <path d="M32 34 C 22 34, 14 28, 13 17 C 24 16, 31 22, 32 34" />
      <path d="M32 28 C 34 18, 42 11, 52 12 C 52 23, 44 29, 32 28" />
      <path d="M20 58 c4-3 20-3 24 0" />
    </>
  ),
  // AND gate
  cpu: () => (
    <>
      <path d="M18 16 h14 a16 16 0 0 1 0 32 h-14 z" />
      <path d="M6 24 h12 M6 40 h12 M48 32 h12" />
    </>
  ),
  // Speech bubble with read ticks
  "check-check": () => (
    <>
      <path d="M10 14 h44 v28 h-24 l-10 10 v-10 h-10 z" />
      <path d="M18 29 l5 5 l9 -10" />
      <path d="M29 33 l1 1 l9 -10" />
    </>
  ),
};

type QuestDoodleProps = {
  icon: Project["icon"];
  class?: string;
};

/** Project icon drawn as a pencil sketch. */
export function QuestDoodle(props: QuestDoodleProps) {
  return <Doodle draw={doodles[props.icon]} class={props.class} />;
}
