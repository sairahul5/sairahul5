const fs = require("fs");

const API_URL = "https://backend-g3hl.onrender.com/api/projects";

async function main() {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const projects = await res.json();

  const projectSection = projects.map((p) => {
    return `### ${p.name}
${p.description}

**Tech Stack:** ${p.techStack}

[GitHub](${p.githubLink})${p.liveLink ? ` | [Live Demo](${p.liveLink})` : ""}`;
  }).join("\n\n---\n\n");

  const readme = fs.readFileSync("README.md", "utf8");

  const updated = readme.replace(
    /<!-- PROJECTS_START -->[\s\S]*<!-- PROJECTS_END -->/,
    `<!-- PROJECTS_START -->\n\n${projectSection}\n\n<!-- PROJECTS_END -->`
  );

  if (readme === updated) {
    throw new Error("Projects markers not found in README.md");
  }

  fs.writeFileSync("README.md", updated);
  console.log("README updated");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
