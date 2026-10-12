import { type JSX } from "solid-js";

import { cn } from "../../lib/cn";

type SheetFieldProps = {
  label: string;
  children: JSX.Element;
  class?: string;
};

/** A value written on a line with its small-caps label beneath, as in a sheet header. */
export function SheetField(props: SheetFieldProps) {
  return (
    <div class={cn("flex min-w-0 flex-col-reverse justify-start", props.class)}>
      <dt class="pt-1 font-mono text-[0.7rem] tracking-[0.12em] text-ink-soft uppercase">
        {props.label}
      </dt>
      <dd class="m-0 border-b border-ink/50 pb-0.5 font-hand text-[1.35rem] leading-tight text-pencil">
        {props.children}
      </dd>
    </div>
  );
}
