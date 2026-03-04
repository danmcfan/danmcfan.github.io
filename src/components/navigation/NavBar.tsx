import { A, useLocation } from "@solidjs/router";
import { For } from "solid-js";

import { navButtonClass } from "../ui/buttonStyles";

const links = [
  { href: "/", label: "Adventure Log" },
  { href: "/projects", label: "Quests" },
  { href: "/about", label: "Character Sheet" },
];

export function NavBar() {
  const location = useLocation();

  const isActive = (href: string) =>
    href === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(href);

  return (
    <nav aria-label="Main" class="w-full">
      <ul class="flex flex-wrap items-center gap-3">
        <For each={links}>
          {(link) => (
            <li>
              <A
                href={link.href}
                class={navButtonClass}
                classList={{
                  "ring-2 ring-amber-300": isActive(link.href),
                }}
              >
                {link.label}
              </A>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
}
