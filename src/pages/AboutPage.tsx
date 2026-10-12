import { For, Show } from "solid-js";

import { AboutCard } from "../components/about/AboutCard";
import { CampaignLog } from "../components/about/CampaignLog";
import { SocialLinks } from "../components/about/SocialLinks";
import { Badge } from "../components/ui/badge";
import { cardVariants } from "../components/ui/card";
import { careerStart, positions } from "../data/positions";
import { socials } from "../data/socials";
import { cn } from "../lib/cn";
import { usePageTitle } from "../lib/usePageTitle";

const YEAR = 365.25 * 24 * 60 * 60 * 1000;

const roles = ["Full Stack", "Backend", "Frontend"];
const languages = ["Python", "Go", "TypeScript"];

const skills = [
  {
    group: "Cloud Infrastructure",
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
      "Google Cloud Platform",
      "Azure",
    ],
  },
  {
    group: "Backend Systems",
    items: [
      "Go",
      "Python (FastAPI, Django)",
      "gRPC",
      "WebSockets",
      "RESTful APIs",
      "Microservices",
      "Distributed Systems",
    ],
  },
  {
    group: "Databases",
    items: ["DynamoDB", "ClickHouse", "Redis", "PostgreSQL", "MySQL", "MongoDB", "Kafka", "Neo4j", "SQLite"],
  },
  {
    group: "Frontend Development",
    items: ["React", "NextJS", "TypeScript", "JavaScript", "Tailwind CSS", "HTML/CSS"],
  },
  {
    group: "Machine Learning",
    items: ["PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "Model Deployment"],
  },
  {
    group: "DevOps & Tools",
    items: ["CI/CD (GitHub Actions)", "Git", "Agile/Scrum", "Test-Driven Development (TDD)", "System Design"],
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
          <div class="grid gap-2">
            <h2 class="font-display text-3xl leading-tight text-dragon md:text-4xl">{current.title}</h2>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
              <ul class="flex flex-wrap items-center gap-x-2.5 font-mono text-xs tracking-[0.12em] text-ink-soft uppercase" aria-label="Roles">
                <For each={roles}>
                  {(role, i) => (
                    <li class="flex items-center gap-2.5">
                      <Show when={i() > 0}>
                        <span class="size-1.5 rotate-45 bg-dragon/80" aria-hidden="true" />
                      </Show>
                      {role}
                    </li>
                  )}
                </For>
              </ul>
              <span class="hidden h-4 w-px bg-ink/30 sm:block" aria-hidden="true" />
              <ul class="flex flex-wrap gap-1.5" aria-label="Languages">
                <For each={languages}>
                  {(language) => (
                    <li>
                      <Badge>{language}</Badge>
                    </li>
                  )}
                </For>
              </ul>
            </div>
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
        <section aria-labelledby="about" class="grid grid-rows-[auto_1fr] gap-6">
          <h2 id="about" class="font-display text-3xl text-dragon">
            About
          </h2>
          <ul class="grid auto-rows-fr gap-4">
            <AboutCard icon="briefcase" label="Currently">{current.company}</AboutCard>
            <AboutCard icon="pin" label="Based in">San Diego, CA</AboutCard>
            <AboutCard icon="hourglass" label="Experience">{years}+ years</AboutCard>
            <AboutCard icon="cap" label="Education">B.S., UC Davis</AboutCard>
          </ul>
        </section>

        <section aria-labelledby="skills" class="grid grid-rows-[auto_1fr] gap-6">
          <h2 id="skills" class="font-display text-3xl text-dragon">
            Skills
          </h2>
          <dl class={cn(cardVariants({ variant: "notice" }), "gap-4 bg-graph p-5")}>
            <For each={skills}>
              {(row) => (
                <div class="grid gap-1.5">
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
        </section>
      </div>

      <CampaignLog />
    </article>
  );
}
