import { For } from "solid-js";

import { CampaignLog } from "../components/about/CampaignLog";
import { SocialLinks } from "../components/about/SocialLinks";
import { SheetBox } from "../components/ui/card";
import { AbilityScore, Pip, SheetField, StatBox } from "../components/ui/sheet";
import { careerStart, education, equipment, formatMonth, positions } from "../data/positions";
import { projects } from "../data/projects";
import { socials } from "../data/socials";
import { usePageTitle } from "../lib/usePageTitle";

const DAY = 24 * 60 * 60 * 1000;

const abilities = [
  { abbr: "STR", label: "Productivity", value: "+500%", detail: "User productivity from geospatial mapping apps at SITE Technologies" },
  { abbr: "DEX", label: "Inference", value: "−50%", detail: "Inference time on PyTorch vision models at SITE Technologies" },
  { abbr: "CON", label: "Reliability", value: "+90%", detail: "Service reliability after moving SeekOps services to Kubernetes" },
  { abbr: "INT", label: "Accuracy", value: "+25%", detail: "Computer vision model accuracy at SITE Technologies" },
  { abbr: "WIS", label: "Processing", value: "−70%", detail: "Data pipeline processing time at SITE Technologies" },
  { abbr: "CHA", label: "Deploys", value: "+50%", detail: "Deployment speed at SeekOps" },
];

const spells = [
  { name: "Media Ingest", focus: "Go", effect: "10 TB / day" },
  { name: "gRPC Rewrite", focus: "Go", effect: "200 → 50 ms" },
  { name: "Training Platform", focus: "PyTorch · K8s", effect: "2 wk → 1 day" },
  { name: "Emissions Map", focus: "React", effect: "10 s → 2 s" },
  { name: "Raster Inference", focus: "FastAPI · ECS", effect: "100 GB / day" },
];

const traits = [
  { name: "Personality", text: "I build software that is reliable, performant, and aesthetically pleasing." },
  {
    name: "Ideals",
    text: "Take vague ideas, map the terrain, and turn them into clear systems through thoughtful architecture and steady iteration.",
  },
  { name: "Bonds", text: "The California sun. Out of the coding dungeon, you'll find me surfing or rock climbing." },
];

const features = [
  { name: "Cartographer", text: "Maps of methane drone flights, facility inspections and satellite greenness." },
  { name: "Field Scientist", text: `${education.degree}, UC Davis.` },
  { name: "Polyglot", text: "Python, Go and TypeScript by trade; Rust and Odin on side quests." },
];

/** Every tool from work and quests, scored like a skill: +1 per role or quest that used it. */
function skills() {
  const rows = new Map<string, { roles: number; quests: number }>();
  const bump = (name: string, key: "roles" | "quests") => {
    if (equipment.includes(name)) return;
    const row = rows.get(name) ?? { roles: 0, quests: 0 };
    row[key] += 1;
    rows.set(name, row);
  };
  for (const position of positions) position.tools.forEach((tool) => bump(tool, "roles"));
  for (const project of projects) project.tags.forEach((tag) => bump(tag, "quests"));
  return [...rows.entries()]
    .map(([name, row]) => ({ name, ...row, bonus: row.roles + row.quests }))
    .sort((a, b) => b.bonus - a.bonus || b.roles - a.roles || a.name.localeCompare(b.name));
}

export function AboutPage() {
  usePageTitle("Character Sheet");

  const start = careerStart();
  const days = Math.floor((Date.now() - start.getTime()) / DAY);
  const level = Math.max(1, Math.floor(days / 365.25));
  const proficiency = Math.ceil(level / 4) + 1;
  const current = positions[0];

  return (
    <article class="grid gap-12">
      <header class="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8">
        <div class="mx-auto grid w-44 justify-items-center gap-3 md:w-full">
          <img
            class="aspect-square w-full border-2 border-ink bg-card object-cover p-1.5 shadow-[0_8px_14px_-8px_rgb(40_25_10/0.55)]"
            src="/headshot.jpeg"
            alt="Danny O'Brien smiling in sunglasses outdoors"
            width="460"
            height="460"
          />
          <SocialLinks socials={socials} class="justify-center" />
        </div>

        <div class="grid content-start gap-5">
          <div class="relative border-2 border-ink bg-card/60 px-5 pt-3 pb-2 [clip-path:polygon(0_0,100%_0,calc(100%-14px)_50%,100%_100%,0_100%,14px_50%)] md:max-w-md">
            <h2 class="font-display text-4xl leading-tight text-dragon">Danny O&apos;Brien</h2>
            <p class="font-mono text-[0.58rem] tracking-[0.14em] text-ink-soft uppercase">Character name</p>
          </div>

          <dl class="grid grid-cols-2 gap-x-5 gap-y-4 rounded-[6px_10px_6px_10px] border-2 border-ink bg-card/60 p-4 sm:grid-cols-3">
            <SheetField label="Class & level">Software Engineer {level}</SheetField>
            <SheetField label="Background">Environmental Scientist</SheetField>
            <SheetField label="Guild">{current.company}</SheetField>
            <SheetField label="Homeland">San Diego, CA</SheetField>
            <SheetField label="Specialty">Full stack · Geospatial</SheetField>
            <SheetField label="Experience points">{days.toLocaleString("en-US")}</SheetField>
          </dl>
        </div>
      </header>

      <div class="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {/* Abilities and skills */}
        <div class="grid grid-cols-[6.25rem_minmax(0,1fr)] items-start gap-4">
          <ul class="grid gap-5" aria-label="Ability scores">
            <For each={abilities}>
              {(ability) => (
                <li>
                  <AbilityScore {...ability} />
                </li>
              )}
            </For>
          </ul>

          <div class="grid gap-4">
            <dl class="flex items-center gap-3 rounded-full border-2 border-ink bg-card/60 py-1 pr-3 pl-1">
              <dd class="m-0 grid size-9 place-items-center rounded-full border-2 border-ink bg-parchment font-display text-xl">
                +{proficiency}
              </dd>
              <dt class="font-mono text-[0.58rem] leading-tight tracking-[0.12em] uppercase">Proficiency bonus</dt>
            </dl>

            <SheetBox label="Skills" class="gap-2 px-3 pt-3 pb-6">
              <ul class="grid gap-1 text-[0.95rem]">
                <For each={skills()}>
                  {(skill) => (
                    <li class="flex items-center gap-2">
                      <Pip filled={skill.roles > 0} />
                      <span class="w-6 border-b border-ink/40 text-center font-mono text-xs">+{skill.bonus}</span>
                      <span class="min-w-0 truncate">{skill.name}</span>
                      <span class="sr-only">
                        : used in {skill.roles} roles and {skill.quests} quests
                      </span>
                    </li>
                  )}
                </For>
              </ul>
              <p class="grid gap-1 border-t border-ink/20 pt-2 font-hand text-base leading-none text-pencil" aria-hidden="true">
                <span class="flex items-center gap-2 whitespace-nowrap">
                  <Pip filled /> on the job
                </span>
                <span class="flex items-center gap-2 whitespace-nowrap">
                  <Pip /> side quests
                </span>
              </p>
            </SheetBox>
          </div>
        </div>

        {/* Combat column */}
        <div class="grid content-start gap-7">
          <dl class="grid grid-cols-3 gap-3">
            <StatBox shape="shield" label="Level" value={level} />
            <StatBox label="Guilds" value={positions.length} />
            <StatBox label="Quests" value={projects.length} />
          </dl>

          <SheetBox label="Current quest" class="gap-1 text-center">
            <p class="font-mono text-[0.62rem] tracking-[0.12em] text-ink-soft uppercase">
              Since {formatMonth(current.start)}
            </p>
            <p class="font-display text-2xl leading-tight">{current.title}</p>
            <p class="font-hand text-xl leading-none text-pencil">{current.company}</p>
          </SheetBox>

          <div class="grid grid-cols-2 gap-3">
            <SheetBox label="Training" class="gap-1 px-3 text-center">
              <p class="font-display text-lg leading-tight">UC Davis</p>
              <p class="text-sm leading-snug text-ink-soft">B.S. Environmental Science</p>
              <p class="font-mono text-[0.62rem] tracking-[0.1em] text-ink-soft">{education.years}</p>
            </SheetBox>
            <SheetBox label="Downtime" class="gap-1 px-3 text-center">
              <p class="font-hand text-xl leading-tight text-pencil">Surfing</p>
              <p class="font-hand text-xl leading-tight text-pencil">Rock climbing</p>
            </SheetBox>
          </div>

          <SheetBox label="Attacks & spellcasting" class="px-3">
            <table class="w-full border-separate border-spacing-x-1 border-spacing-y-1 text-left text-sm">
              <thead>
                <tr class="font-mono text-[0.55rem] tracking-[0.12em] text-ink-soft uppercase">
                  <th class="px-1.5 font-normal">Name</th>
                  <th class="px-1.5 font-normal">Effect</th>
                </tr>
              </thead>
              <tbody>
                <For each={spells}>
                  {(spell) => (
                    <tr class="[&>td]:rounded-[2px] [&>td]:bg-parchment-deep/45 [&>td]:px-1.5 [&>td]:py-1">
                      <td>
                        <span class="block leading-tight font-semibold">{spell.name}</span>
                        <span class="block font-mono text-[0.62rem] text-ink-soft">{spell.focus}</span>
                      </td>
                      <td class="whitespace-nowrap">{spell.effect}</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </SheetBox>

          <SheetBox label="Equipment">
            <ul class="grid grid-cols-2 gap-x-4 font-hand text-xl leading-snug text-pencil">
              <For each={equipment}>{(item) => <li class="border-b border-ink/20">{item}</li>}</For>
            </ul>
          </SheetBox>
        </div>

        {/* Traits column */}
        <div class="grid content-start gap-7 md:col-span-2 md:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
          <div class="grid content-start gap-5 rounded-[6px_10px_6px_10px] border-2 border-ink bg-card/60 p-1.5">
            <For each={traits}>
              {(trait) => (
                <section class="relative rounded-[4px] border border-ink/50 px-3 pt-3 pb-6 last:mb-0">
                  <p class="font-hand text-xl leading-snug text-pencil">{trait.text}</p>
                  <h3 class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-parchment px-2 font-mono text-[0.58rem] tracking-[0.14em] whitespace-nowrap uppercase">
                    {trait.name}
                  </h3>
                </section>
              )}
            </For>
          </div>

          <SheetBox label="Features & traits" class="gap-4">
            <For each={features}>
              {(feature) => (
                <div>
                  <h4 class="font-display text-lg leading-tight text-dragon">{feature.name}</h4>
                  <p class="leading-snug">{feature.text}</p>
                </div>
              )}
            </For>
          </SheetBox>
        </div>
      </div>

      <CampaignLog />
    </article>
  );
}
