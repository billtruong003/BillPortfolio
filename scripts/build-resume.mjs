import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Builds public/Bill_Resume.pdf from data/resume.json (facts shared with the website)
// and data/cv.json (CV-only wording). The body size is searched so the CV fills MAX_PAGES.

const MAX_PAGES = 2;
const FONT_RANGE = [9, 11];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));

const resume = readJson("data/resume.json");
const cv = readJson("data/cv.json");
const outPdf = join(root, "public", "Bill_Resume.pdf");

const BROWSERS = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const displayUrl = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const link = (url, text = displayUrl(url)) => (url ? `<a href="${esc(url)}">${esc(text)}</a>` : esc(text));

const social = (platform) => resume.socials.find((s) => s.platform === platform)?.url;

const headRow = (left, right, cls = "") =>
  `<div class="row ${cls}"><span>${left}</span><span class="right">${right}</span></div>`;

const bullets = (items = []) =>
  items.length ? `<ul>${items.map((i) => `<li><span class="dash">-</span>${esc(i)}</li>`).join("")}</ul>` : "";

const section = (title, body) => `<section><h2>${esc(title)}</h2>${body}</section>`;

const devJob = (j) => `
  <div class="entry">
    ${headRow(`<b>${esc(j.company)}</b>`, esc(j.location))}
    ${headRow(`<i>${esc(j.role)}</i>`, `<i>${esc(j.period)}</i>`)}
    ${bullets(j.achievements?.length ? j.achievements : [j.desc])}
    ${j.skills?.length ? `<p class="stack">Skills: ${esc(j.skills.join(", "))}</p>` : ""}
  </div>`;

const project = (p) => `
  <div class="entry tight">
    ${headRow(`<b>${link(p.url, p.name)}</b>${p.tag ? ` <span class="sep">|</span> <i>${esc(p.tag)}</i>` : ""}`, esc(p.meta ?? ""))}
    ${p.bullets.map((l) => `<p class="desc">${esc(l)}</p>`).join("")}
  </div>`;

const community = (c) => `
  <div class="entry tight">
    ${headRow(`<b>${link(c.url, c.name)}</b>, <i>${esc(c.tag)}</i>`, `<i>${esc(c.period)}</i>`)}
    <p class="desc">${esc(c.text)}</p>
  </div>`;

const education = (e) => `
  <div class="entry tight">
    ${headRow(`<b>${esc(e.school)}</b>, <i>${esc(e.degree)}</i>`, `<i>${esc(e.period)}</i>`)}
    <p class="desc">${esc(e.note)}</p>
  </div>`;

const skills = cv.skills.map((s) => `<p class="skill"><b>${esc(s.name)}:</b> ${esc(s.items)}</p>`).join("");

const { profile } = resume;
const email = profile.contact.email;
const contacts = [
  link(`mailto:${email}`, email),
  link(social("linkedin")),
  link(social("github")),
  link(cv.website),
].join(` <span class="sep">|</span> `);

const html = (fontPt) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(profile.name)} Resume</title>
<style>
  @page { size: A4; margin: 12mm 14mm 12mm 14mm; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    margin: 0;
    font-family: "Charter", "Bitstream Charter", "Sitka Text", "Cambria", "Georgia", serif;
    font-size: ${fontPt}pt;
    line-height: 1.3;
    color: #111;
    font-variant-numeric: lining-nums;
  }
  a { color: inherit; text-decoration: none; }
  header { text-align: center; margin-bottom: 6pt; }
  h1 { font-size: 22pt; font-variant: small-caps; letter-spacing: 0.5pt; margin: 0; font-weight: 700; line-height: 1.1; }
  .headline { font-size: 11pt; margin: 2pt 0 1pt; }
  .contact { font-size: 9.3pt; margin: 1pt 0 0; }
  .sep { color: #777; padding: 0 3pt; }
  section { margin-top: 7pt; }
  h2 {
    font-size: 11pt; font-variant: small-caps; font-weight: 600; letter-spacing: 0.4pt;
    margin: 0 0 3pt; padding-bottom: 1pt; border-bottom: 0.7pt solid #222;
    break-after: avoid;
  }
  .row { display: flex; justify-content: space-between; gap: 12pt; }
  .row .right { text-align: right; white-space: nowrap; }
  .entry { margin: 0 0 4.5pt 6pt; break-inside: avoid; }
  .entry.tight { margin-bottom: 3pt; }
  ul { margin: 1pt 0 0; padding-left: 4pt; list-style: none; }
  li { margin: 0.6pt 0; padding-left: 9pt; text-indent: -9pt; }
  .dash { display: inline-block; width: 9pt; text-indent: 0; }
  p { margin: 0; }
  .desc { margin-left: 7pt; }
  .stack { margin: 1pt 0 0 13pt; font-size: 0.92em; color: #444; }
  .summary, .skill { margin-left: 6pt; }
</style>
</head>
<body>
<header>
  <h1>${esc(profile.name)}</h1>
  <p class="headline">${esc(profile.title)}</p>
  <p class="contact">${esc(profile.location)}</p>
  <p class="contact">${contacts}</p>
</header>
${section("Summary", `<p class="summary">${esc(cv.summary)}</p>`)}
${section("Experience", resume.experience.dev.map(devJob).join(""))}
${section("Games", cv.games.map(project).join(""))}
${section("Open Source & Tools", cv.projects.map(project).join(""))}
${section("Teaching & Community", cv.community.map(community).join(""))}
${section("Education", cv.education.map(education).join(""))}
${section("Skills, Awards & Languages", skills)}
</body>
</html>
`;

const browser = BROWSERS.find(existsSync);
if (!browser) throw new Error("Chrome or Edge not found.");

const workDir = mkdtempSync(join(tmpdir(), "bill-resume-"));

const render = (fontPt, pdfPath) => {
  const page = html(fontPt);
  if (page.includes("\u2014")) throw new Error("Em dash found in generated HTML; fix the source data.");
  const htmlPath = join(workDir, "resume.html");
  writeFileSync(htmlPath, page, "utf8");
  execFileSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--virtual-time-budget=5000",
    `--user-data-dir=${join(workDir, "profile")}`,
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ], { stdio: "ignore" });
  return (readFileSync(pdfPath, "latin1").match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
};

// Largest body size (0.1pt steps) that still fits in MAX_PAGES.
const trialPdf = join(workDir, "trial.pdf");
let [lo, hi] = FONT_RANGE;
if (render(lo, trialPdf) > MAX_PAGES) throw new Error(`Content does not fit ${MAX_PAGES} pages even at ${lo}pt.`);
while (hi - lo > 0.05) {
  const mid = Math.round(((lo + hi) / 2) * 10) / 10;
  if (mid === lo || mid === hi) break;
  if (render(mid, trialPdf) <= MAX_PAGES) lo = mid;
  else hi = mid;
}
const pages = render(lo, outPdf);
console.log(`Wrote ${outPdf} (${pages} pages, ${lo}pt) using ${browser}`);

if (process.argv.includes("--keep-html")) console.log(`HTML kept at ${join(workDir, "resume.html")}`);
else try { rmSync(workDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
if (pages > MAX_PAGES) process.exitCode = 1;
