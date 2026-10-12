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
  {
    group: "Cloud infrastructure",
    items: [
      "AWS (ECS Fargate, ALB, Secrets Manager, S3, Lambda, EC2, IAM)",
      "Terraform",
      "Docker",
      "Kubernetes",
      "GCP",
      "Azure",
    ],
  },
  {
    group: "Backend",
    items: ["Go", "Python (FastAPI, Django)", "gRPC", "WebSockets", "REST", "Microservices", "Distributed systems"],
  },
  {
    group: "Data",
    items: ["DynamoDB", "ClickHouse", "Redis", "PostgreSQL", "MySQL", "MongoDB", "Kafka", "Neo4j", "SQLite"],
  },
  { group: "Frontend", items: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML/CSS"] },
  {
    group: "Machine learning",
    items: ["PyTorch", "TensorFlow", "scikit-learn", "Pandas", "NumPy", "Model deployment"],
  },
  {
    group: "DevOps & practice",
    items: ["GitHub Actions CI/CD", "Git", "Agile/Scrum", "Test-driven development", "System design"],
  },
];

const focus = [
  {
    name: "Cloud infrastructure",
    text: "Secure, compliant AWS stacks built with Terraform, Docker, ECS Fargate and Kubernetes, with credentials kept in Secrets Manager.",
  },
  {
    name: "Production AI",
    text: "Computer vision models trained, optimized and served with PyTorch and FastAPI, and a training platform that cut client onboarding from two weeks to one day.",
  },
  {
    name: "Data at scale",
    text: "A media catalog indexing 10 TB a day, ClickHouse analytics over billions of sensor readings, and Python pipelines made 70% faster.",
  },
  {
    name: "Full-stack geospatial apps",
    text: "React mapping tools for drone, satellite and inspection data, backed by FastAPI and gRPC services in Python and Go.",
  },
];

export function AboutPage() {
  usePageTitle("Character Sheet");

  const years = Math.floor((Date.now() - careerStart().getTime()) / YEAR);
  const current = positions[0];

  return (
    <article class="grid gap-12">
      <header class="grid gap-6 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10">
        <div class="mx-auto grid w-40 content-start justify-items-center gap-3 md:w-full">
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
            <p class="font-mono text-xs tracking-[0.12em] text-ink-soft uppercase">Cloud infrastructure · Production AI · Full stack</p>
          </div>
          <p class="max-w-[62ch] text-lg leading-relaxed">
            Senior software engineer with {years}+ years of experience architecting secure, high-scale cloud
            infrastructure and production AI systems, after starting out as a geospatial engineer. I modernize stacks
            with AWS, Terraform and Docker, build pipelines that handle 10 TB of data a day, and ship full-stack
            products in Python, Go and React. Outside of work I&apos;m usually backpacking, rock climbing or surfing.
          </p>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-4 rounded-[6px_10px_6px_10px] border-2 border-ink bg-card/60 p-4 lg:grid-cols-4">
            <SheetField label="Currently">{current.company}</SheetField>
            <SheetField label="Based in">San Diego, CA</SheetField>
            <SheetField label="Experience">{years}+ years</SheetField>
            <SheetField label="Education">B.S., UC Davis</SheetField>
          </dl>
        </div>
      </header>

      <div class="grid gap-x-6 gap-y-10 md:grid-cols-2">
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

        <SheetBox label="Skills" class="pb-6">
          <dl class="grid gap-3">
            <For each={skills}>
              {(row) => (
                <div class="grid gap-0.5">
                  <dt class="font-mono text-xs leading-5 tracking-[0.1em] text-ink-soft uppercase">{row.group}</dt>
                  <dd class="m-0 leading-snug">{row.items.join(" · ")}</dd>
                </div>
              )}
            </For>
          </dl>
        </SheetBox>
      </div>

      <CampaignLog />
    </article>
  );
}
