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
    <ul class={cn("flex flex-wrap gap-3", props.class)}>
      <For each={props.socials}>
        {(social) => (
          <li>
            <a
              class={buttonVariants({ variant: "outline" })}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Dynamic component={iconByKind[social.kind]} class="size-4" aria-hidden="true" />
              {labelByKind[social.kind]}
              <span class="sr-only">(opens in new tab)</span>
            </a>
          </li>
        )}
      </For>
    </ul>
  );
}
