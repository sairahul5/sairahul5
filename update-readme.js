const fs = require("fs");

const API_URL = "https://backend-g3hl.onrender.com/api/projects";

function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function main() {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const projects = await res.json();

  const projectSection = projects.map((p) => {
    const name = escapeHtml(p.name);
    const description = escapeHtml(p.description);
    const techStack = escapeHtml(p.techStack);
    const github = p.githubLink ? escapeHtml(p.githubLink) : "";
    const live = p.liveLink ? escapeHtml(p.liveLink) : "";

    return `
<div align="center">

<table>
<tr>
<td>

### ${name}

${description}

**Tech Stack:** \`${techStack}\`

${github ? `[GitHub](${github})` : ""}${github && live ? " · " : ""}${live ? `[Live Demo](${live})` : ""}

</td>
</tr>
</table>

</div>`;
  }).join("\n\n");

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
