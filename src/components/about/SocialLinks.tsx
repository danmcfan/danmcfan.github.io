import { Github, Linkedin } from "lucide-solid";
import { For } from "solid-js";
import { Dynamic } from "solid-js/web";

import { type Social } from "../../data/socials";
import { cn } from "../../lib/cn";
import { buttonVariants } from "../ui/button";

const iconByKind = {
  github: Github,
  linkedin: Linkedin,
} as const;

const labelByKind = {
  github: "GitHub",
  linkedin: "LinkedIn",
} as const;

type SocialLinksProps = {
  socials: Social[];
  class?: string;
};

export function SocialLinks(props: SocialLinksProps) {
  return (
    <ul class={cn("flex flex-wrap gap-2", props.class)}>
      <For each={props.socials}>
        {(social) => (
          <li>
            <a
              class={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "transition-[color,border-color,translate] motion-safe:hover:-translate-y-0.5",
              )}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              title={labelByKind[social.kind]}
            >
              <Dynamic component={iconByKind[social.kind]} class="size-5" aria-hidden="true" />
              <span class="sr-only">{labelByKind[social.kind]} (opens in new tab)</span>
            </a>
          </li>
        )}
      </For>
    </ul>
  );
}
