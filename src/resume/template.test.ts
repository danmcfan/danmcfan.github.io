import { describe, expect, test } from "bun:test";

import { positions } from "../data/positions";
import { resume, shortLocation, skillBadges, skillLabel } from "../data/resume";
import { renderResumeHtml } from "./template";

const html = renderResumeHtml("");
const text = html.replace(/&amp;/g, "&").replace(/&quot;/g, '"');

describe("the PDF template prints every résumé fact", () => {
  const facts = [
    resume.name,
    resume.headline,
    ...Object.values(resume.contact),
    resume.summary,
    ...resume.experience.flatMap((job) => [job.company, job.title, job.location, ...job.highlights]),
    ...resume.skills.flatMap((row) => [row.group, ...row.items.map(skillLabel)]),
    ...resume.education.flatMap((school) => [school.school, school.degree, school.location, ...school.highlights]),
  ];
  for (const fact of facts) {
    test(fact.slice(0, 60), () => {
      expect(text).toContain(fact);
    });
  }
});

describe("the site's work history follows the résumé", () => {
  test("same jobs, in the same order", () => {
    expect(positions.map((position) => position.id)).toEqual(resume.experience.map((job) => job.id));
  });

  for (const job of resume.experience) {
    test(`${job.id}: title, dates, location and highlights word for word`, () => {
      const position = positions.find((p) => p.id === job.id)!;
      expect(position.title).toBe(job.title);
      expect([position.start, position.end]).toEqual([job.start, job.end]);
      expect(position.location).toBe(shortLocation(job.location));
      expect(position.highlights).toEqual(job.highlights);
    });
  }
});

describe("skills", () => {
  test("a family becomes one badge per part", () => {
    expect(skillBadges({ name: "AWS", parts: ["S3", "IAM"] })).toEqual(["AWS S3", "AWS IAM"]);
  });

  test("a family is bracketed on the résumé", () => {
    expect(skillLabel({ name: "AWS", parts: ["S3", "IAM"] })).toBe("AWS (S3, IAM)");
  });
});

test("a state without an abbreviation fails loudly", () => {
  expect(() => shortLocation("Portland, Oregon")).toThrow("Oregon");
});
