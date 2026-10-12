import { cn } from "../../lib/cn";

/** SVG filter that wobbles strokes so icons read as pencil doodles. */
export function SketchFilter() {
  return (
    <svg width="0" height="0" class="absolute" aria-hidden="true">
      <filter id="sketch" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      {/* A gentler, single-octave wobble for larger icons: smooth bends rather than jitter. */}
      <filter id="sketch-soft" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="1" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

type InkRuleProps = { class?: string };

export function InkRule(props: InkRuleProps) {
  return (
    <svg
      class={cn("block h-3 w-full stroke-dragon/70", props.class)}
      viewBox="0 0 320 12"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M2 7 C 60 2, 120 11, 180 6 S 290 3, 318 7"
        fill="none"
        stroke-width="2"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Loop drawn around the current nav item. Shown via `[aria-current="page"] > .ink-loop`. */
export function InkLoop() {
  return (
    <svg
      class="ink-loop pointer-events-none absolute -inset-x-2.5 -inset-y-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+1.25rem)] overflow-visible"
      viewBox="0 0 120 44"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        class="ink-stroke"
        pathLength="1"
        stroke-width="2.2"
        d="M10 24 C 6 9, 42 3, 70 4 C 102 5, 118 14, 114 26 C 110 39, 72 42, 42 40 C 16 38, 3 30, 12 17 C 16 12, 24 9, 32 8"
      />
    </svg>
  );
}

/** Underline drawn on hover or focus of the nearest `.group`. */
export function InkUnderline() {
  return (
    <svg
      class="ink-underline pointer-events-none absolute -bottom-1.5 left-0 h-2 w-full overflow-visible"
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path class="ink-stroke" pathLength="1" stroke-width="2" d="M1 5 C 20 2, 40 7, 60 4 S 90 3, 99 5" />
    </svg>
  );
}
