const fs = require("fs");

const API_URL = "https://backend-g3hl.onrender.com/api/projects";

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

function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function slug(text) {
  return encodeURIComponent(String(text).replace(/\s+/g, "_"));
}

function techBadge(tech) {
  const clean = String(tech).trim();
  const key = clean.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const logo = logoMap[key];
  if (logo) {
    return `![${escapeHtml(clean)}](https://img.shields.io/badge/${slug(clean)}-111827?style=for-the-badge&logo=${logo}&logoColor=white)`;
  }
  return `![${escapeHtml(clean)}](https://img.shields.io/badge/${slug(clean)}-111827?style=for-the-badge&logoColor=white)`;
}

function linkBadge(label, url, color, logo) {
  if (!url) return "";
  return `[![${label}](https://img.shields.io/badge/${slug(label)}-${color}?style=for-the-badge&logo=${logo}&logoColor=white)](${url})`;
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
      const techs = splitTechStack(p.techStack).map(techBadge).join(" ");
      const github = p.githubLink || "";
      const live = p.liveLink || "";
      const code = p.code ? escapeHtml(p.code) : "";
      const accent = index === 0 ? "Featured_Project" : "Project";

      return `
<div align="center">
<table width="100%">
<tr>
<td>
<p align="center">
  <img src="https://img.shields.io/badge/${accent}-1f6feb?style=for-the-badge" />
  ${year ? `<img src="https://img.shields.io/badge/Year-${slug(year)}-111827?style=for-the-badge" />` : ""}
  ${code ? `<img src="https://img.shields.io/badge/Code-${slug(code)}-111827?style=for-the-badge" />` : ""}
</p>

### ${name}

${description}

<p><strong>Tech Stack</strong></p>
<p>${techs || "_Not provided_"}</p>

<p>
  ${linkBadge("GitHub", github, "181717", "github")}
  ${live ? " " + linkBadge("Live_Demo", live, "1f6feb", "vercel") : ""}
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
  console.log(`✅ README updated with ${projects.length} project(s)`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
