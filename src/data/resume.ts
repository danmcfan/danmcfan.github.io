/**
 * The résumé: single source of truth for the PDF (`bun run resume`) and for the
 * character sheet's facts. Edit here; never in the PDF or the site.
 */

export type Job = {
  id: string;
  company: string;
  title: string;
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM"; omitted for the current role. */
  end?: string;
  /** "City, State" with the state spelled out. */
  location: string;
  highlights: string[];
};

/** A plain skill, or a family whose parts the résumé brackets ("AWS (S3, IAM)") and the site splits into badges. */
export type Skill = string | { name: string; parts: string[] };

export type SkillGroup = { group: string; items: Skill[] };

export type School = {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
  location: string;
  highlights: string[];
};

export const resume = {
  name: "Daniel O'Brien",
  headline: "Senior Software Engineer",
  contact: {
    location: "San Diego, California",
    phone: "(949) 257-5690",
    email: "danmcfan33@gmail.com",
    linkedin: "linkedin.com/in/daniel-c-obrien",
    website: "dannyobrien.dev",
  },
  summary:
    "Senior Software Engineer with 5+ years of experience architecting secure, high-scale cloud infrastructure and production AI systems. Expert in modernizing enterprise tech stacks using AWS (ECS Fargate, Secrets Manager), Terraform, and Docker, with a proven track record of optimizing pipelines to handle 10TB of daily data. Specialized in delivering business-critical full-stack solutions using Python, Go, and React while driving strict security compliance and operational efficiency. Outside of work, I am an avid outdoorsman who enjoys backpacking, rock climbing, and surfing.",
  /** Newest first. */
  experience: [
    {
      id: "site",
      company: "SITE Technologies",
      title: "Senior Software Engineer",
      start: "2024-11",
      location: "Chicago, Illinois",
      highlights: [
        "Deployed machine learning models using FastAPI, Docker, and AWS ECS Fargate, utilizing Terraform for infrastructure-as-code and AWS Secrets Manager to secure sensitive credentials, ensuring strict compliance for processing 100GB of geospatial data daily",
        "Drove refactoring of existing data pipelines in Python using parallelization and algorithm optimization, reducing average processing times by 70% and accelerating delivery timelines",
        "Delivered full-stack mapping web applications using React and FastAPI to visualize geospatial data and perform real-time analysis, collaborating with product teams to improve user productivity by 500%",
        "Optimized computer vision machine learning models using PyTorch, improving accuracy by 25% and reducing inference times by 50% through strategic model architecture improvements",
      ],
    },
    {
      id: "aicadium",
      company: "Aicadium",
      title: "Software Engineer",
      start: "2023-06",
      end: "2024-11",
      location: "San Diego, California",
      highlights: [
        "Led development of a full-stack web application using React, FastAPI, and Go microservices for image and video management, enabling customers to apply custom computer vision models for classification, object detection, and segmentation tasks, improving user productivity by 150%",
        "Built a high-throughput media catalog using DynamoDB to index metadata for 100,000+ daily assets (10TB), leveraging Redis to orchestrate asynchronous video processing pipelines and manage distributed state across microservices",
        "Architected a computer vision model training platform using FastAPI and PyTorch, deployed on Kubernetes for efficient scaling, reducing client onboarding time by 93% (from 2 weeks to 1 day) by automating model fine-tuning processes",
        "Championed secure cloud infrastructure design on AWS, implementing Application Load Balancers (ALB) for traffic distribution and AWS Secrets Manager for credential rotation; optimized multi-tenant isolation strategies to improve system scalability and reliability by 60%",
      ],
    },
    {
      id: "seekops",
      company: "SeekOps",
      title: "Software Engineer",
      start: "2022-06",
      end: "2023-06",
      location: "Austin, Texas",
      highlights: [
        "Pioneered development of an interactive 3D map application using React and WebSockets to stream real-time methane emissions data from drone flights, reducing data rendering latency by 80% and enabling live visualization for field operators",
        "Redesigned REST APIs to gRPC endpoints in Go for geospatial data ingestion, reducing average latency by 75% (from 200ms to 50ms) and decreasing error rates from 4.9% to 0.1%",
        "Integrated ClickHouse to perform high-speed OLAP analytics on massive streams of incoming drone IoT sensor data, optimizing Python ingestion pipelines to query billions of data points with sub-second latency",
        "Orchestrated deployment strategy for Python and Go microservices using Docker and Kubernetes on AWS, configuring ingress controllers and IAM roles to ensure least-privilege security access, improving deployment speed by 50%",
      ],
    },
    {
      id: "benson-hill",
      company: "Benson Hill",
      title: "Data Engineer",
      start: "2021-11",
      end: "2022-06",
      location: "St. Louis, Missouri",
      highlights: [],
    },
    {
      id: "lightbox",
      company: "LightBox",
      title: "Data Engineer",
      start: "2021-03",
      end: "2021-11",
      location: "Irvine, California",
      highlights: [],
    },
    {
      id: "far-western",
      company: "Far Western",
      title: "Geospatial Engineer",
      start: "2019-10",
      end: "2021-03",
      location: "Davis, California",
      highlights: [],
    },
  ] satisfies Job[],
  skills: [
    {
      group: "Cloud Infrastructure",
      items: [
        { name: "AWS", parts: ["ECS Fargate", "ALB", "Secrets Manager", "S3", "Lambda", "EC2", "IAM"] },
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
  ] satisfies SkillGroup[],
  education: [
    {
      id: "uc-davis",
      school: "University of California, Davis",
      degree: "Bachelor of Science, Environmental Science",
      start: "2016-09",
      end: "2019-06",
      location: "Davis, California",
      highlights: ["Specialization in Geospatial Information Systems"],
    },
  ] satisfies School[],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2024-11" → "Nov 2024" */
export function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

/** "Nov 2024 – Present" */
export function formatSpan(start: string, end?: string) {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "Present"}`;
}

/** As the résumé writes it: "AWS (S3, IAM)". */
export function skillLabel(skill: Skill) {
  return typeof skill === "string" ? skill : `${skill.name} (${skill.parts.join(", ")})`;
}

/** As the site's badges show it: one badge per part, "AWS S3", "AWS IAM". */
export function skillBadges(skill: Skill) {
  return typeof skill === "string" ? [skill] : skill.parts.map((part) => `${skill.name} ${part}`);
}

const STATES: Record<string, string> = {
  California: "CA",
  Illinois: "IL",
  Missouri: "MO",
  Texas: "TX",
};

/** "Chicago, Illinois" → "Chicago, IL", the site's shorter form. */
export function shortLocation(location: string) {
  const [city, state] = location.split(", ");
  const code = STATES[state];
  if (!code) throw new Error(`Add "${state}" to STATES in src/data/resume.ts`);
  return `${city}, ${code}`;
}
