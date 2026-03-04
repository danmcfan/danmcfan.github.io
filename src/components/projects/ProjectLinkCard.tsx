import { Dices, Gamepad2 } from "lucide-solid";
import { type Project } from "../../data/projects";
import { projectCardButtonClass } from "../ui/buttonStyles";

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
        {props.project.icon === "gamepad" ? (
          <Gamepad2 class="size-5" />
        ) : (
          <Dices class="size-5" />
        )}
      </span>
      <p class="font-serif text-2xl text-emerald-50">{props.project.name}</p>
      <p class="mt-2 text-sm text-emerald-100">{props.project.description}</p>
    </a>
  );
}
