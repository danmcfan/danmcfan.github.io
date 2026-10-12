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
        "group h-full gap-4 bg-graph p-6 no-underline md:p-7",
        "motion-safe:transition-[translate,box-shadow] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(.2,.8,.2,1)]",
        "hover:shadow-[0_2px_0_rgb(46_34_25/0.06),0_22px_26px_-16px_rgb(40_25_10/0.55)] focus-visible:shadow-[0_2px_0_rgb(46_34_25/0.06),0_22px_26px_-16px_rgb(40_25_10/0.55)]",
        "motion-safe:hover:-translate-y-1.5 motion-safe:focus-visible:-translate-y-1.5",
      )}
      href={props.project.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="flex items-start gap-4">
        <h2 class="min-w-0 flex-1 pt-1 font-display text-2xl leading-tight">
          <span class="relative inline-block">
            {props.project.name}
            <InkUnderline />
          </span>
        </h2>
        <QuestDoodle
          icon={props.project.icon}
          class="size-12 shrink-0 text-ink motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-rotate-6 motion-safe:group-focus-visible:-rotate-6"
        />
      </div>
      <p class="leading-relaxed">{props.project.description}</p>
      <div class="mt-auto flex items-end gap-3 pt-2">
        <ul class="flex min-w-0 flex-1 flex-wrap gap-2" aria-label="Built with">
          <For each={props.project.tags}>
            {(tag) => (
              <li>
                <Badge>{tag}</Badge>
              </li>
            )}
          </For>
        </ul>
        <span
          class="shrink-0 translate-y-1 font-hand text-lg leading-none text-pencil opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          aria-hidden="true"
        >
          visit ↗
        </span>
      </div>
      <span class="sr-only">(opens in new tab)</span>
    </a>
  );
}
