import { onCleanup, onMount } from "solid-js";

type DiceLayerProps = {
  sheet: () => HTMLElement;
  tray: () => HTMLElement;
};

/** Canvas of three.js dice that roll onto the page once, on first load. */
export function DiceLayer(props: DiceLayerProps) {
  let canvas!: HTMLCanvasElement;
  let dispose: (() => void) | undefined;
  let cancelled = false;

  onMount(() => {
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
  });

  onCleanup(() => {
    cancelled = true;
    dispose?.();
  });

  return (
    <canvas
      ref={canvas}
      class="pointer-events-none absolute top-0 left-0 z-10 h-svh w-full"
      aria-hidden="true"
    />
  );
}
