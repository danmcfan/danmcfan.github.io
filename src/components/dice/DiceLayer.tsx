import { onCleanup, onMount } from "solid-js";

type DiceLayerProps = {
  sheet: () => HTMLElement;
  tray: () => HTMLElement;
};

/** Viewport canvas of three.js dice that roll onto the page as it scrolls into view and reroll when clicked. */
export function DiceLayer(props: DiceLayerProps) {
  let canvas!: HTMLCanvasElement;
  let dispose: (() => void) | undefined;
  let cancelled = false;

  const start = () => {
    if (cancelled) return;
    import("./rollDice")
      .then(({ rollDice }) => {
        if (cancelled) return;
        dispose = rollDice({
          canvas,
          sheet: props.sheet(),
          tray: props.tray(),
        });
      })
      .catch(() => {
        // Dice are decoration; a failed chunk or missing WebGL leaves the page as is.
      });
  };

  // The dice chunk is the page's heaviest download, so it waits until the page has loaded and painted.
  // A callback two frames on runs once the first frame is on screen.
  const startAfterPaint = () =>
    requestAnimationFrame(() => requestAnimationFrame(() => (window.requestIdleCallback ?? setTimeout)(start)));

  onMount(() => {
    if (document.readyState === "complete") startAfterPaint();
    else window.addEventListener("load", startAfterPaint, { once: true });
  });

  onCleanup(() => {
    cancelled = true;
    window.removeEventListener("load", startAfterPaint);
    dispose?.();
  });

  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: the canvas has no tabindex and ignores the pointer, so it never takes focus.
  return <canvas ref={canvas} class="pointer-events-none fixed top-0 left-0 z-10 h-lvh w-full" aria-hidden="true" />;
}
