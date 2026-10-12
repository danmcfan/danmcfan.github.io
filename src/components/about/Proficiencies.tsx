import { For, Index } from "solid-js";

import { type Project } from "../../data/projects";

type ProficienciesProps = {
  projects: Project[];
  limit?: number;
};

/** Tech proficiencies counted from the quests that used each tag. */
export function Proficiencies(props: ProficienciesProps) {
  const rows = () => {
    const counts = new Map<string, number>();
    for (const project of props.projects) {
      for (const tag of project.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
      .slice(0, props.limit ?? 8);
  };

  return (
    <ul class="grid gap-1.5">
      <For each={rows()}>
        {([name, count]) => (
          <li class="flex items-center justify-between gap-3">
            <span>{name}</span>
            <span
              class="inline-flex gap-1"
              role="img"
              aria-label={`Used in ${count} of ${props.projects.length} quests`}
            >
              <Index each={props.projects}>
                {(_, i) => (
                  <i
                    class="size-2.5 rounded-full border-[1.5px] border-ink"
                    classList={{ "bg-ink": i < count }}
                  />
                )}
              </Index>
            </span>
          </li>
        )}
      </For>
    </ul>
  );
}
