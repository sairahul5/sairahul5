const fs = require("fs");
const API_URL = "https://backend-g3hl.onrender.com/api/projects";

function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function slug(text) {
  return String(text).replace(/\s+/g, "_").replace(/-/g, "--");
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
  const res = await fetch(API_URL, {
    headers: {
      // Render's edge blocks requests with no User-Agent (raw Node fetch default)
      "User-Agent": "github-actions-readme-updater/1.0",
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API request failed: ${res.status} ${res.statusText} — ${body}`);
  }

  const projects = await res.json();

  if (!Array.isArray(projects) || projects.length === 0) {
    console.log("No projects returned from API. Skipping README update.");
    return;
  }

  const cards = projects
    .map((p, index) => {
      const name = escapeHtml(p.name || "Untitled");
      const description = escapeHtml(p.description || "");
      const year = p.year ? escapeHtml(p.year) : "";
      const code = p.code ? escapeHtml(p.code) : "";
      const techImages = splitTechStack(p.techStack).map(techImage).join(" ");
      const github = p.githubLink || "";
      const live = p.liveLink || "";
      const featured = index === 0 ? "Featured_Project" : "Project";

      return `
<div align="center">
<table width="100%">
<tr>
<td>
<p align="center">
  <img src="https://img.shields.io/badge/${featured}-1f6feb?style=for-the-badge" alt="${escapeHtml(featured)}" />
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
  ${github ? `<a href="${github}"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>` : ""}
  ${live ? `<a href="${live}"><img src="https://img.shields.io/badge/Live_Demo-1f6feb?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>` : ""}
</p>
</td>
</tr>
</table>
</div>`;
    })
    .join("\n\n");

  const readme = fs.readFileSync("README.md", "utf8");
  const updated = readme.replace(
    /<!-- PROJECTS_START -->[\s\S]*?<!-- PROJECTS_END -->/,
    `<!-- PROJECTS_START -->\n\n${cards}\n\n<!-- PROJECTS_END -->`
  );

  if (readme === updated) {
    throw new Error("Projects markers not found in README.md");
  }

  fs.writeFileSync("README.md", updated);
  console.log(`✅ README updated with ${projects.length} project(s)`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});  const encoded = slug(clean);
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
  // Fetch with timeout so workflow doesn't hang if Render is sleeping
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let projects;
  try {
    const res = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      console.log(`API returned ${res.status} — backend may be sleeping. Skipping update.`);
      process.exit(0); // Exit 0 = don't fail the workflow
    }
    projects = await res.json();
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      console.log("API timed out (backend sleeping on Render free tier). Skipping update.");
    } else {
      console.log(`API fetch error: ${err.message}. Skipping update.`);
    }
    process.exit(0); // Exit 0 = don't fail the workflow
  }

  if (!Array.isArray(projects) || projects.length === 0) {
    console.log("No projects returned from API. Skipping README update.");
    process.exit(0);
  }

  const cards = projects
    .map((p, index) => {
      const name = escapeHtml(p.name || "Untitled");
      const description = escapeHtml(p.description || "");
      const year = p.year ? escapeHtml(p.year) : "";
      const code = p.code ? escapeHtml(p.code) : "";
      const techImages = splitTechStack(p.techStack).map(techImage).join(" ");
      const github = p.githubLink || "";
      const live = p.liveLink || "";
      const featured = index === 0 ? "Featured_Project" : "Project";

      return `
<div align="center">
<table width="100%">
<tr>
<td>
<p align="center">
  <img src="https://img.shields.io/badge/${featured}-1f6feb?style=for-the-badge" alt="${escapeHtml(featured)}" />
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
  ${github ? `<a href="${github}"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>` : ""}
  ${live ? `<a href="${live}"><img src="https://img.shields.io/badge/Live_Demo-1f6feb?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>` : ""}
</p>
</td>
</tr>
</table>
</div>`;
    })
    .join("\n\n");

  const readme = fs.readFileSync("README.md", "utf8");
  const startMarker = "<!-- PROJECTS_START -->";
  const endMarker = "<!-- PROJECTS_END -->";

  if (!readme.includes(startMarker) || !readme.includes(endMarker)) {
    throw new Error("Projects markers not found in README.md — add <!-- PROJECTS_START --> and <!-- PROJECTS_END --> comments.");
  }

  const updated = readme.replace(
    /<!-- PROJECTS_START -->[\s\S]*?<!-- PROJECTS_END -->/,
    `<!-- PROJECTS_START -->\n\n${cards}\n\n<!-- PROJECTS_END -->`
  );

  fs.writeFileSync("README.md", updated);
  console.log(`✅ README updated with ${projects.length} project(s)`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
