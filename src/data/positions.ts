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
      "Deployed machine learning models with FastAPI, Docker and AWS ECS Fargate, using Terraform for infrastructure and Secrets Manager for credentials, to process 100 GB of geospatial data a day under strict compliance.",
      "Refactored Python data pipelines with parallelization and algorithm optimization, cutting average processing time by 70%.",
      "Delivered full-stack mapping apps in React and FastAPI for real-time geospatial analysis, improving user productivity by 500%.",
      "Optimized PyTorch computer vision models, raising accuracy 25% and halving inference time.",
    ],
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
      "Led a full-stack image and video management app in React, FastAPI and Go microservices, letting customers run custom vision models for classification, detection and segmentation; productivity up 150%.",
      "Built a media catalog on DynamoDB indexing 100,000+ assets (10 TB) a day, with Redis orchestrating async video processing and shared state across microservices.",
      "Architected a model training platform with FastAPI and PyTorch on Kubernetes, cutting client onboarding by 93%, from two weeks to one day.",
      "Designed secure AWS infrastructure with load balancers, Secrets Manager credential rotation and multi-tenant isolation, improving scalability and reliability by 60%.",
    ],
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
      "Built an interactive 3D map in React with WebSockets, streaming live methane emissions from drone flights and cutting render latency by 80%.",
      "Moved geospatial ingestion from REST to gRPC in Go: latency 200 ms → 50 ms, error rate 4.9% → 0.1%.",
      "Integrated ClickHouse for OLAP analytics on drone IoT sensor streams, querying billions of points with sub-second latency.",
      "Deployed Python and Go microservices on Docker and Kubernetes in AWS with least-privilege IAM, speeding deploys by 50%.",
    ],
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
  },
];

export const education = {
  id: "uc-davis",
  school: "University of California, Davis",
  degree: "B.S. Environmental Science",
  specialization: "Specialization in Geospatial Information Systems",
  start: "2016-09",
  end: "2019-06",
  location: "Davis, CA",
  landmark: "camp" as Landmark,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

/** Start of the first software or data engineering role, which the resume counts experience from. */
export function careerStart() {
  const first = positions.findLast((position) => position.id !== "far-western")!;
  const [year, month] = first.start.split("-").map(Number);
  return new Date(year, month - 1, 1);
}
