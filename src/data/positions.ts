export type Landmark =
  | "tower"
  | "lighthouse"
  | "keep"
  | "windmill"
  | "village"
  | "ruins"
  | "camp";

export type Position = {
  id: string;
  company: string;
  title: string;
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM"; omitted for the current role. */
  end?: string;
  location: string;
  /** Doodle that marks this stop on the campaign map. */
  landmark: Landmark;
  highlights: string[];
  tools: string[];
};

/** Work history, newest first. */
export const positions: Position[] = [
  {
    id: "site",
    company: "SITE Technologies",
    title: "Senior Software Engineer",
    start: "2024-11",
    location: "Chicago, IL",
    landmark: "tower",
    highlights: [
      "Deployed machine learning models with FastAPI, Docker and AWS ECS to process 100 GB of geospatial raster data a day for facility inspections.",
      "Refactored Python data pipelines with parallelization and algorithm work, cutting average processing time by 70%.",
      "Delivered full-stack mapping apps in React and FastAPI for real-time geospatial analysis, improving user productivity by 500%.",
      "Optimized PyTorch computer vision models, raising accuracy 25% and halving inference time.",
    ],
    tools: ["Python", "TypeScript", "React", "FastAPI", "PyTorch", "Docker", "AWS"],
  },
  {
    id: "aicadium",
    company: "Aicadium",
    title: "Software Engineer",
    start: "2023-06",
    end: "2024-11",
    location: "San Diego, CA",
    landmark: "lighthouse",
    highlights: [
      "Led a full-stack image and video management app in React, FastAPI and Go microservices, letting customers run custom vision models; productivity up 150%.",
      "Built Go media pipelines handling 100,000 uploads (10 TB) a day with tagging and metadata extraction.",
      "Architected a model training platform with FastAPI and PyTorch on Kubernetes, cutting client onboarding from two weeks to one day.",
      "Designed the AWS infrastructure for training, inference and asset management, improving scalability and reliability by 60%.",
    ],
    tools: ["Go", "Python", "TypeScript", "React", "FastAPI", "PyTorch", "Kubernetes", "AWS"],
  },
  {
    id: "seekops",
    company: "SeekOps",
    title: "Software Engineer",
    start: "2022-06",
    end: "2023-06",
    location: "Austin, TX",
    landmark: "keep",
    highlights: [
      "Built an interactive 3D map in React for methane emissions from 100+ monthly drone flights, cutting render time from 10 s to 2 s.",
      "Moved geospatial ingestion from REST to gRPC in Go: latency 200 ms → 50 ms, error rate 4.9% → 0.1%.",
      "Parallelized Python geospatial pipelines, reducing processing time by 80%.",
      "Ran Python and Go microservices on Docker and Kubernetes, speeding deploys by 50%.",
    ],
    tools: ["Go", "Python", "TypeScript", "React", "gRPC", "Docker", "Kubernetes"],
  },
  {
    id: "benson-hill",
    company: "Benson Hill",
    title: "Data Engineer",
    start: "2021-11",
    end: "2022-06",
    location: "St. Louis, MO",
    landmark: "windmill",
    highlights: [],
    tools: [],
  },
  {
    id: "lightbox",
    company: "LightBox",
    title: "Data Engineer",
    start: "2021-03",
    end: "2021-11",
    location: "Irvine, CA",
    landmark: "village",
    highlights: [],
    tools: [],
  },
  {
    id: "far-western",
    company: "Far Western Anthropological Research Group",
    title: "Geospatial Engineer",
    start: "2019-10",
    end: "2021-03",
    location: "Davis, CA",
    landmark: "ruins",
    highlights: [],
    tools: [],
  },
];

export const education = {
  id: "uc-davis",
  school: "University of California, Davis",
  degree: "B.S. Environmental Science",
  years: "2016 – 2019",
  location: "Davis, CA",
  landmark: "camp" as Landmark,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

export function careerStart() {
  const [year, month] = positions[positions.length - 1].start.split("-").map(Number);
  return new Date(year, month - 1, 1);
}
