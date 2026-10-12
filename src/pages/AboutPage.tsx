import { Proficiencies } from "../components/about/Proficiencies";
import { SocialLinks } from "../components/about/SocialLinks";
import { SheetBox } from "../components/ui/card";
import { projects } from "../data/projects";
import { socials } from "../data/socials";
import { usePageTitle } from "../lib/usePageTitle";

const facts = [
  { label: "Class", value: "Software Engineer" },
  { label: "Subclass", value: "Systems Mage" },
  { label: "Home", value: "California" },
  { label: "Downtime", value: "Surfing · Rock climbing" },
];

export function AboutPage() {
  usePageTitle("Character Sheet");

  return (
    <div class="grid gap-8 md:grid-cols-[16rem_1fr]">
      <figure class="relative self-start">
        <div
          class="absolute -inset-3 rounded-[46%_54%_48%_52%/55%_45%_55%_45%] bg-[radial-gradient(circle_at_30%_30%,var(--color-wash-sky),transparent_65%),radial-gradient(circle_at_70%_75%,var(--color-wash-ochre),transparent_60%)] opacity-80 mix-blend-multiply"
          style={{ filter: "url(#watercolor)" }}
          aria-hidden="true"
        />
        <img
          class="relative aspect-square w-full border-2 border-ink bg-card object-cover p-1.5 shadow-[0_8px_14px_-8px_rgb(40_25_10/0.55)]"
          src="/headshot.jpeg"
          alt="Danny O'Brien smiling in sunglasses outdoors"
          width="460"
          height="460"
        />
        <figcaption class="relative mt-2 text-center font-hand text-xl text-pencil">
          portrait of the mage, on a sunny day
        </figcaption>
      </figure>

      <div class="grid min-w-0 gap-7">
        <h2 class="font-display text-3xl text-dragon">Character Sheet</h2>

        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {facts.map((fact) => (
            <div class="grid gap-0.5 border-b border-ink/40 pb-1">
              <dt class="font-mono text-[0.62rem] tracking-[0.14em] text-ink-soft uppercase">
                {fact.label}
              </dt>
              <dd class="m-0 font-display text-lg leading-snug">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <div class="grid gap-7 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <SheetBox label="Backstory">
            <p class="max-w-[65ch] text-lg leading-relaxed">
              I build software that is reliable, performant, and aesthetically
              pleasing. I enjoy taking vague ideas, mapping the terrain, and
              turning them into clear systems through thoughtful architecture
              and steady iteration. When I'm not in my coding dungeon, you can
              usually find me out in the California sun surfing or rock
              climbing.
            </p>
          </SheetBox>
          <SheetBox label="Proficiencies">
            <p class="font-hand text-lg leading-tight text-pencil">
              counted from my quests
            </p>
            <Proficiencies projects={projects} />
          </SheetBox>
        </div>

        <SocialLinks socials={socials} />
      </div>
    </div>
  );
}
