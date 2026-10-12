import { For } from "solid-js";

import { CampaignLog } from "../components/about/CampaignLog";
import { SocialLinks } from "../components/about/SocialLinks";
import { SheetBox } from "../components/ui/card";
import { SheetField } from "../components/ui/sheet";
import { careerStart, positions } from "../data/positions";
import { socials } from "../data/socials";
import { usePageTitle } from "../lib/usePageTitle";

const YEAR = 365.25 * 24 * 60 * 60 * 1000;

const skills = [
  { group: "Languages", items: ["Python", "Go", "TypeScript"] },
  { group: "Frontend", items: ["React", "SolidJS", "MapLibre"] },
  { group: "Backend", items: ["FastAPI", "gRPC", "Neo4j", "SQL Server"] },
  { group: "ML & data", items: ["PyTorch", "Earth Engine"] },
  { group: "Cloud", items: ["Docker", "Kubernetes", "AWS", "GCP", "Azure"] },
];

const focus = [
  {
    name: "Geospatial web apps",
    text: "React and FastAPI mapping tools for drone, satellite and facility inspection data.",
  },
  {
    name: "Machine learning in production",
    text: "Training and inference platforms for computer vision models with PyTorch, Docker and Kubernetes.",
  },
  {
    name: "Data pipelines",
    text: "Go media pipelines handling 10 TB of uploads a day, and parallel Python pipelines for geospatial data.",
  },
];

export function AboutPage() {
  usePageTitle("Character Sheet");

  const years = Math.floor((Date.now() - careerStart().getTime()) / YEAR);
  const current = positions[0];

  return (
    <article class="grid gap-12">
      <header class="grid gap-6 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10">
        <div class="mx-auto grid w-40 justify-items-center gap-3 md:w-full">
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
          <div class="grid gap-1">
            <h2 class="font-display text-3xl leading-tight text-dragon md:text-4xl">{current.title}</h2>
            <p class="font-mono text-xs tracking-[0.12em] text-ink-soft uppercase">Full stack · Backend · Frontend</p>
          </div>
          <p class="max-w-[62ch] text-lg leading-relaxed">
            Software engineer with {years} years of experience building full-stack applications, data pipelines and
            cloud systems. Most of my work sits where geospatial data meets machine learning: mapping apps, computer
            vision models and the infrastructure that runs them.
          </p>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-4 rounded-[6px_10px_6px_10px] border-2 border-ink bg-card/60 p-4 lg:grid-cols-4">
            <SheetField label="Currently">{current.company}</SheetField>
            <SheetField label="Based in">San Diego, CA</SheetField>
            <SheetField label="Experience">{years} years</SheetField>
            <SheetField label="Education">B.S., UC Davis</SheetField>
          </dl>
        </div>
      </header>

      <div class="grid gap-x-6 gap-y-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <SheetBox label="Skills" class="pb-6">
          <dl class="grid gap-3">
            <For each={skills}>
              {(row) => (
                <div class="grid gap-0.5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-3">
                  <dt class="font-mono text-xs leading-6 tracking-[0.1em] text-ink-soft uppercase">{row.group}</dt>
                  <dd class="m-0 leading-6">{row.items.join(" · ")}</dd>
                </div>
              )}
            </For>
          </dl>
        </SheetBox>

        <SheetBox label="Focus" class="gap-4 pb-6">
          <For each={focus}>
            {(item) => (
              <div>
                <h4 class="font-bold leading-snug">{item.name}</h4>
                <p class="leading-snug text-ink-soft">{item.text}</p>
              </div>
            )}
          </For>
        </SheetBox>
      </div>

      <CampaignLog />
    </article>
  );
}
