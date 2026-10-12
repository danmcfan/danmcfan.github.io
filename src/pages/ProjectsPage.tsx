import { For } from "solid-js";

import { ProjectLinkCard } from "../components/projects/ProjectLinkCard";
import { projects } from "../data/projects";
import { usePageTitle } from "../lib/usePageTitle";

export function ProjectsPage() {
  usePageTitle("Quests");

  return (
    <div class="grid gap-8 md:grid-cols-2">
      <For each={projects}>{(project) => <ProjectLinkCard project={project} />}</For>
    </div>
  );
}
