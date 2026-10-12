import { For } from "solid-js";

import { CampaignLog } from "../components/about/CampaignLog";
import { SocialLinks } from "../components/about/SocialLinks";
import { Badge } from "../components/ui/badge";
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
      "AWS ECS Fargate",
      "AWS ALB",
      "AWS Secrets Manager",
      "AWS S3",
      "AWS Lambda",
      "AWS EC2",
      "AWS IAM",
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
            Senior Software Engineer with 5+ years of experience architecting secure, high-scale cloud
            infrastructure and production AI systems. Expert in modernizing enterprise tech stacks using AWS (ECS
            Fargate, Secrets Manager), Terraform, and Docker, with a proven track record of optimizing pipelines to
            handle 10TB of daily data. Specialized in delivering business-critical full-stack solutions using Python,
            Go, and React while driving strict security compliance and operational efficiency. Outside of work, I am
            an avid outdoorsman who enjoys backpacking, rock climbing, and surfing.
          </p>
        </div>
      </header>

      <div class="grid gap-x-6 gap-y-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <SheetBox label="About" class="pb-6">
          <dl class="grid flex-1 content-between gap-5">
            <SheetField label="Currently">{current.company}</SheetField>
            <SheetField label="Based in">San Diego, CA</SheetField>
            <SheetField label="Experience">{years}+ years</SheetField>
            <SheetField label="Education">B.S., UC Davis</SheetField>
          </dl>
        </SheetBox>

        <SheetBox label="Skills" class="pb-6">
          <dl class="grid gap-4">
            <For each={skills}>
              {(row) => (
                <div class="grid gap-0.5">
                  <dt class="font-mono text-xs leading-5 tracking-[0.1em] text-ink-soft uppercase">{row.group}</dt>
                  <dd class="m-0">
                    <ul class="flex flex-wrap gap-1.5">
                      <For each={row.items}>
                        {(item) => (
                          <li>
                            <Badge>{item}</Badge>
                          </li>
                        )}
                      </For>
                    </ul>
                  </dd>
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
