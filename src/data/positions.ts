import { type Job, resume, shortLocation } from "./resume";

export type Landmark = "tower" | "lighthouse" | "keep" | "windmill" | "village" | "ruins" | "camp";

export type Position = Job & {
  /** Doodle that marks this stop on the campaign map. */
  landmark: Landmark;
};

type SiteDetails = {
  landmark: Landmark;
  /** Overrides the résumé's company name on the site. */
  company?: string;
};

/** What the site adds to each résumé job. Every job in `resume.experience` needs an entry. */
const details: Record<string, SiteDetails> = {
  site: { landmark: "tower" },
  aicadium: { landmark: "lighthouse" },
  seekops: { landmark: "keep" },
  "benson-hill": { landmark: "windmill" },
  lightbox: { landmark: "village" },
  "far-western": {
    landmark: "ruins",
    company: "Far Western Anthropological Research Group",
  },
};

/** Work history, newest first, from the résumé. */
export const positions: Position[] = resume.experience.map((job) => {
  const site = details[job.id];
  if (!site) throw new Error(`Add "${job.id}" to details in src/data/positions.ts`);
  return { ...job, ...site, company: site.company ?? job.company, location: shortLocation(job.location) };
});

const school = resume.education[0];

export const education = {
  id: school.id,
  school: school.school,
  degree: "B.S. Environmental Science",
  specialization: school.highlights[0],
  start: school.start,
  end: school.end,
  location: shortLocation(school.location),
  landmark: "camp" as Landmark,
};

/** Start of the first software or data engineering role, which the resume counts experience from. */
export function careerStart() {
  const first = positions.findLast((position) => position.id !== "far-western")!;
  const [year, month] = first.start.split("-").map(Number);
  return new Date(year, month - 1, 1);
}
