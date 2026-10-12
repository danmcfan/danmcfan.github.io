import { type JSX } from "solid-js";

import { type Project } from "../../data/projects";

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
      <circle cx="51" cy="32" r="0.5" />
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

const washes: Record<Project["icon"], [string, string]> = {
  gamepad: ["var(--color-wash-ochre)", "var(--color-wash-rose)"],
  sprout: ["var(--color-wash-sage)", "var(--color-wash-ochre)"],
  cpu: ["var(--color-wash-sky)", "var(--color-wash-sage)"],
  "check-check": ["var(--color-wash-rose)", "var(--color-wash-sky)"],
};

type QuestDoodleProps = {
  icon: Project["icon"];
};

export function QuestDoodle(props: QuestDoodleProps) {
  const wash = () => washes[props.icon];
  return (
    <div class="relative h-28 overflow-hidden" aria-hidden="true">
      <div
        class="absolute inset-2 rounded-[40%_60%_55%_45%/50%_40%_60%_50%] mix-blend-multiply"
        style={{
          filter: "url(#watercolor)",
          background: `radial-gradient(circle at 35% 40%, ${wash()[0]}, transparent 65%), radial-gradient(circle at 70% 62%, ${wash()[1]}, transparent 60%)`,
        }}
      />
      <svg
        class="absolute inset-0 m-auto size-16 text-ink"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {doodles[props.icon]()}
      </svg>
    </div>
  );
}
