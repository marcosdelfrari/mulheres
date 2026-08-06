import { createHash } from "crypto";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import { absoluteUrl } from "@/lib/seo";

export const AGENT_SKILLS_SCHEMA =
  "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

export const AGENT_SKILLS_INDEX_PATH = "/.well-known/agent-skills/index.json";

const SKILLS_ROOT = path.join(
  process.cwd(),
  "public",
  ".well-known",
  "agent-skills",
);

export type AgentSkillType = "skill-md" | "archive";

export type AgentSkillEntry = {
  name: string;
  type: AgentSkillType;
  description: string;
  url: string;
  digest: string;
};

function sha256Hex(bytes: Buffer | string) {
  return createHash("sha256").update(bytes).digest("hex");
}

function parseFrontmatter(markdown: string): {
  name?: string;
  description?: string;
} {
  if (!markdown.startsWith("---")) return {};
  const end = markdown.indexOf("\n---", 3);
  if (end < 0) return {};
  const block = markdown.slice(3, end).trim();
  const out: { name?: string; description?: string } = {};
  for (const line of block.split("\n")) {
    const match = /^(name|description):\s*(.*)$/.exec(line);
    if (!match) continue;
    const key = match[1] as "name" | "description";
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function isValidSkillName(name: string) {
  return (
    name.length >= 1 &&
    name.length <= 64 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)
  );
}

export async function buildAgentSkillsIndex() {
  const skills: AgentSkillEntry[] = [];

  let entries: string[] = [];
  try {
    entries = await readdir(SKILLS_ROOT);
  } catch {
    return {
      $schema: AGENT_SKILLS_SCHEMA,
      skills,
    };
  }

  for (const name of entries.sort()) {
    if (!isValidSkillName(name)) continue;
    const skillMdPath = path.join(SKILLS_ROOT, name, "SKILL.md");
    try {
      const info = await stat(skillMdPath);
      if (!info.isFile()) continue;
    } catch {
      continue;
    }

    const raw = await readFile(skillMdPath);
    const text = raw.toString("utf8");
    const meta = parseFrontmatter(text);
    const description =
      meta.description?.slice(0, 1024) ||
      `Mulheres agent skill: ${name}`;

    skills.push({
      name: meta.name && isValidSkillName(meta.name) ? meta.name : name,
      type: "skill-md",
      description,
      url: `/.well-known/agent-skills/${name}/SKILL.md`,
      digest: `sha256:${sha256Hex(raw)}`,
    });
  }

  return {
    $schema: AGENT_SKILLS_SCHEMA,
    skills,
  };
}

export function agentSkillsAbsoluteUrl(relativePath: string) {
  return absoluteUrl(relativePath);
}
