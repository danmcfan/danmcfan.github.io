import { For } from "solid-js";

import { type Project } from "../../data/projects";
import { cn } from "../../lib/cn";
import { Badge } from "../ui/badge";
import { cardVariants } from "../ui/card";
import { InkUnderline } from "../ui/ink";
import { QuestDoodle } from "./QuestDoodle";

type ProjectLinkCardProps = {
  project: Project;
};

export function ProjectLinkCard(props: ProjectLinkCardProps) {
  return (
    <a
      class={cn(
        cardVariants({ variant: "notice" }),
        "group h-full gap-3 p-5 no-underline",
        "motion-safe:transition-[translate,box-shadow] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(.2,.8,.2,1)]",
        "hover:shadow-[0_2px_0_rgb(46_34_25/0.06),0_22px_26px_-16px_rgb(40_25_10/0.55)] focus-visible:shadow-[0_2px_0_rgb(46_34_25/0.06),0_22px_26px_-16px_rgb(40_25_10/0.55)]",
        "motion-safe:hover:-translate-y-1.5 motion-safe:focus-visible:-translate-y-1.5",
      )}
      href={props.project.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span
        class="absolute top-2 right-3 translate-y-1 font-hand text-lg text-pencil opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        aria-hidden="true"
      >
        opens in new tab ↗
      </span>
      <QuestDoodle icon={props.project.icon} />
      <h2 class="relative self-start font-display text-2xl leading-tight">
        {props.project.name}
        <InkUnderline />
      </h2>
      <p class="leading-relaxed">{props.project.description}</p>
      <ul class="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Built with">
        <For each={props.project.tags}>
          {(tag) => (
            <li>
              <Badge>{tag}</Badge>
            </li>
          )}
        </For>
      </ul>
      <span class="sr-only">(opens in new tab)</span>
    </a>
  );
}
