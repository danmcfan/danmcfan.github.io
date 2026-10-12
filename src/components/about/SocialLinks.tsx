import { FileDown, Github, Linkedin } from "lucide-solid";
import { For } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { Social } from "../../data/socials";
import { cn } from "../../lib/cn";
import { buttonVariants } from "../ui/button";

const iconByKind = {
  github: Github,
  linkedin: Linkedin,
  resume: FileDown,
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
          <li class="group relative">
            <a
              class={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "transition-[color,border-color,translate] motion-safe:hover:-translate-y-0.5",
              )}
              href={social.href}
              {...(social.download ? { download: social.download } : { target: "_blank", rel: "noopener noreferrer" })}
            >
              <Dynamic component={iconByKind[social.kind]} class="size-5" aria-hidden="true" />
              <span class="sr-only">
                {social.label} {social.download ? "(download)" : "(opens in new tab)"}
              </span>
            </a>
            {/* Visual label for the icon; the link's own text already names it for screen readers. */}
            <span
              aria-hidden="true"
              class="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 translate-y-1 rounded-[3px] bg-ink px-2 py-1 font-mono text-[0.7rem] tracking-[0.06em] whitespace-nowrap text-parchment opacity-0 shadow-[0_6px_12px_-6px_rgb(40_25_10/0.6)] transition-[opacity,translate] duration-150 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-150 before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-ink"
            >
              {social.label}
            </span>
          </li>
        )}
      </For>
    </ul>
  );
}
