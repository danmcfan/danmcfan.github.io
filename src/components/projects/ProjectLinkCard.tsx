import { For } from "solid-js";
import { Dynamic } from "solid-js/web";
import { CheckCheck, Cpu, Gamepad2, Sprout } from "lucide-solid";
import { type Project } from "../../data/projects";
import { projectCardButtonClass } from "../ui/buttonStyles";

const icons = {
  gamepad: Gamepad2,
  sprout: Sprout,
  cpu: Cpu,
  "check-check": CheckCheck,
} satisfies Record<Project["icon"], unknown>;

type ProjectLinkCardProps = {
  project: Project;
};

export function ProjectLinkCard(props: ProjectLinkCardProps) {
  return (
    <a
      class={`${projectCardButtonClass} relative`}
      href={props.project.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span
        class="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-md border border-emerald-400/50 bg-emerald-900/70 text-emerald-100"
        aria-hidden="true"
      >
        <Dynamic component={icons[props.project.icon]} class="size-5" />
      </span>
      <p class="font-serif text-2xl text-emerald-50">{props.project.name}</p>
      <p class="mt-2 text-sm text-emerald-100">{props.project.description}</p>
      <ul class="mt-3 flex flex-wrap gap-1.5">
        <For each={props.project.tags}>
          {(tag) => (
            <li class="rounded-full border border-emerald-400/40 bg-emerald-950/60 px-2 py-0.5 text-xs text-emerald-200">
              {tag}
            </li>
          )}
        </For>
      </ul>
    </a>
  );
}
