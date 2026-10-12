import { A } from "@solidjs/router";
import { For } from "solid-js";

import { InkLoop } from "../ui/ink";

const showAdventureLog = false;

const links = [
  { href: "/blog", label: "Adventure Log", hidden: !showAdventureLog },
  { href: "/projects", label: "Quests" },
  { href: "/about", label: "Character Sheet" },
];

export function NavBar() {
  return (
    <nav aria-label="Main" class="w-full">
      <ul class="flex flex-wrap items-center gap-x-7 gap-y-2">
        <For each={links.filter((link) => !link.hidden)}>
          {(link) => (
            <li>
              <A
                href={link.href}
                class="relative inline-block px-3 py-1.5 font-display text-xl text-ink-soft no-underline transition-colors hover:text-ink aria-[current=page]:text-dragon"
              >
                {link.label}
                <InkLoop />
              </A>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
}
