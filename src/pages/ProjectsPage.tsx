import { For } from "solid-js";

import { ProjectLinkCard } from "../components/projects/ProjectLinkCard";
import { projects } from "../data/projects";

export function ProjectsPage() {
  return (
    <div class="grid gap-4 md:grid-cols-2">
      <For each={projects}>
        {(project) => <ProjectLinkCard project={project} />}
      </For>
    </div>
  );
}
