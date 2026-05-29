const fs = require("fs");

const API_URL = process.env.API_URL;

function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function slug(text) {
  return encodeURIComponent(String(text).replace(/\s+/g, "_"));
}

const logoMap = {
  java: "openjdk",
  springboot: "springboot",
  mysql: "mysql",
  react: "react",
  vite: "vite",
  html: "html5",
  css: "css3",
  javascript: "javascript",
  js: "javascript",
  python: "python",
  django: "django",
  sql: "postgresql",
  node: "nodedotjs",
  typescript: "typescript",
  spring: "spring",
};

function techImage(tech) {
  const clean = String(tech).trim();
  const key = clean.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const logo = logoMap[key] || "";
  const encoded = slug(clean);

  const badgeUrl = logo
    ? `https://img.shields.io/badge/${encoded}-111827?style=for-the-badge&logo=${logo}&logoColor=white`
    : `https://img.shields.io/badge/${encoded}-111827?style=for-the-badge&logoColor=white`;

  return `<img src="${badgeUrl}" alt="${escapeHtml(clean)}" />`;
}

function splitTechStack(stack) {
  if (!stack) return [];
  return String(stack)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const projects = await res.json();

  const cards = projects
    .map((p, index) => {
      const name = escapeHtml(p.name || "Untitled");
      const description = escapeHtml(p.description || "");
      const year = p.year ? escapeHtml(p.year) : "";
      const code = p.code ? escapeHtml(p.code) : "";
      const techImages = splitTechStack(p.techStack).map(techImage).join(" ");
      const github = p.githubLink || "";
      const live = p.liveLink || "";
      const featured = index === 0 ? "Featured Project" : "Project";

      return `
<div align="center">

<table width="100%">
<tr>
<td>

<p align="center">
  <img src="https://img.shields.io/badge/${slug(featured)}-1f6feb?style=for-the-badge" alt="${escapeHtml(featured)}" />
  ${year ? `<img src="https://img.shields.io/badge/Year-${slug(year)}-111827?style=for-the-badge" alt="${escapeHtml(year)}" />` : ""}
  ${code ? `<img src="https://img.shields.io/badge/Code-${slug(code)}-111827?style=for-the-badge" alt="${escapeHtml(code)}" />` : ""}
</p>

### ${name}

${description}

<p><strong>Tech Stack</strong></p>

<p align="center">
  ${techImages || "_Not provided_"}
</p>

<p align="center">
  ${
    github
      ? `<a href="${github}"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>`
      : ""
  }
  ${
    live
      ? ` <a href="${live}"><img src="https://img.shields.io/badge/Live_Demo-1f6feb?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>`
      : ""
  }
</p>

</td>
</tr>
</table>

</div>`;
    })
    .join("\n\n");

  const readme = fs.readFileSync("README.md", "utf8");

  const updated = readme.replace(
    /<!-- PROJECTS_START -->[\s\S]*<!-- PROJECTS_END -->/,
    `<!-- PROJECTS_START -->\n\n${cards}\n\n<!-- PROJECTS_END -->`
  );

  if (readme === updated) {
    throw new Error("Projects markers not found in README.md");
  }

  fs.writeFileSync("README.md", updated);
  console.log(`README updated with ${projects.length} project(s)`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
