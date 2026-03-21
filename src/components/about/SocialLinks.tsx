import { Github, Linkedin } from "lucide-solid";
import { For } from "solid-js";
import { Dynamic } from "solid-js/web";

import { type Social } from "../../data/socials";
import { socialIconButtonClass } from "../ui/buttonStyles";

type SocialLinksProps = {
  socials: Social[];
};

export function SocialLinks(props: SocialLinksProps) {
  const iconByKind = {
    github: Github,
    linkedin: Linkedin,
  } as const;

  return (
    <ul class="flex flex-wrap gap-3">
      <For each={props.socials}>
        {(social) => (
          <li>
            <a
              aria-label={social.kind}
              title={social.kind}
              class={socialIconButtonClass}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Dynamic component={iconByKind[social.kind]} class="size-7" />
            </a>
          </li>
        )}
      </For>
    </ul>
  );
}
