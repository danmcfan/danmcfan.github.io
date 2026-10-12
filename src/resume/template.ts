import { formatSpan, type Job, resume, type School, skillLabel } from "../data/resume";

/** Lucide icon bodies (24×24, stroked), matching the icons the site uses. */
const ICONS = {
  location:
    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  phone:
    '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
  email: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  linkedin:
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  website:
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
};

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function icon(name: keyof typeof ICONS) {
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
}

function contact(name: keyof typeof ICONS, text: string, href?: string) {
  const label = href ? `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>` : escapeHtml(text);
  return `<li>${icon(name)}${label}</li>`;
}

function bullets(items: string[]) {
  if (items.length === 0) return "";
  return `<ul class="bullets">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function entry(heading: string, subheading: string, span: string, location: string, highlights: string[]) {
  return `<article class="entry">
  <div class="entry-head">
    <div><h3>${escapeHtml(heading)}</h3><p>${escapeHtml(subheading)}</p></div>
    <div class="entry-meta"><p>${escapeHtml(span)}</p><p>${escapeHtml(location)}</p></div>
  </div>
  ${bullets(highlights)}
</article>`;
}

const job = (j: Job) => entry(j.company, j.title, formatSpan(j.start, j.end), j.location, j.highlights);
const school = (s: School) => entry(s.school, s.degree, formatSpan(s.start, s.end), s.location, s.highlights);

const STYLES = `
@page { size: letter; margin: 0.55in 0.6in; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Source Sans 3", sans-serif; font-size: 10.5pt; line-height: 1.45; color: #000; }
a { color: inherit; text-decoration: none; }
header h1 { font-size: 23pt; font-weight: 700; line-height: 1.1; }
header h1 em { font-size: 15pt; font-weight: 400; margin-left: 8pt; }
.contact { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 6pt 24pt; margin-top: 12pt; }
.contact li { display: flex; align-items: center; gap: 10pt; }
.icon { width: 11pt; height: 11pt; flex: none; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.summary { margin-top: 14pt; text-align: justify; }
section { margin-top: 14pt; }
h2 { font-size: 11.5pt; font-weight: 700; letter-spacing: 0.04em; text-align: center; text-transform: uppercase;
  border-block: 1.25pt solid #000; padding: 3pt 0; margin-bottom: 10pt; break-after: avoid; }
.entry { margin-bottom: 10pt; }
.entry-head { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 24pt; break-inside: avoid; break-after: avoid; }
.entry-head h3 { font-size: 10.5pt; font-weight: 700; }
.entry-meta { text-align: right; }
.bullets { max-width: 72%; padding-left: 20pt; }
.bullets li { break-inside: avoid; }
.skills p { margin-bottom: 5pt; break-inside: avoid; }
`;

/** The résumé as a standalone, printable HTML page. `fontFaces` is CSS that loads Source Sans 3. */
export function renderResumeHtml(fontFaces: string) {
  const { contact: c } = resume;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(resume.name)} Resume</title>
<style>${fontFaces}${STYLES}</style>
</head>
<body>
<header>
  <h1>${escapeHtml(resume.name)}<em>${escapeHtml(resume.headline)}</em></h1>
  <ul class="contact">
    ${contact("location", c.location)}
    ${contact("email", c.email, `mailto:${c.email}`)}
    ${contact("phone", c.phone, `tel:${c.phone.replace(/[^\d+]/g, "")}`)}
    ${contact("linkedin", c.linkedin, `https://${c.linkedin}`)}
    ${contact("website", c.website, `https://${c.website}`)}
  </ul>
</header>
<p class="summary">${escapeHtml(resume.summary)}</p>
<section><h2>Work Experience</h2>${resume.experience.map(job).join("")}</section>
<section class="skills"><h2>Skills</h2>${resume.skills
    .map(
      (row) => `<p><strong>${escapeHtml(row.group)}</strong> — ${escapeHtml(row.items.map(skillLabel).join(", "))}</p>`,
    )
    .join("")}</section>
<section><h2>Education</h2>${resume.education.map(school).join("")}</section>
</body>
</html>`;
}
