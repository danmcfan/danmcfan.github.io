import { type JSX } from "solid-js";

type ProfileBlockProps = {
  imageSrc: string;
  name: string;
  role: string;
  description: string;
  children?: JSX.Element;
};

export function ProfileBlock(props: ProfileBlockProps) {
  return (
    <section class="grid gap-6 md:grid-cols-[16rem_1fr] md:items-start">
      <img
        class="h-80 w-full rounded-xl border border-emerald-500/60 object-cover shadow-lg shadow-emerald-950/40 md:h-96"
        src={props.imageSrc}
        alt={`${props.name} portrait`}
      />
      <div class="space-y-3">
        <h2 class="font-serif text-3xl text-emerald-50">{props.name}</h2>
        <p class="text-sm tracking-wide text-emerald-200 uppercase">
          {props.role}
        </p>
        <p class="leading-7 text-emerald-100">{props.description}</p>
        {props.children ? <div class="pt-2">{props.children}</div> : null}
      </div>
    </section>
  );
}
