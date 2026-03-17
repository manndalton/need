import * as fs from 'node:fs';
import * as path from 'node:path';

type InitResult = 'created' | 'already exists';

interface ToolConfig {
  name: string;
  filePath: string;
  content: string;
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getToolConfigs(cwd: string): ToolConfig[] {
  const mcpInstructions = `When you need a CLI tool for a task, use \`need\` to find and install it:

1. **Search** — \`need <query>\` (e.g. \`need json formatter\`)
2. **Install** — follow the install command from the results
3. **Report** — \`need report <tool> --success\` or \`--fail\`

If you have access to MCP tools, prefer using \`search_tools\`, \`install_tool\`, and \`report_tool_usage\` from the \`need\` MCP server.`;

  return [
    {
      name: 'Claude Code',
      filePath: path.join(cwd, '.claude', 'commands', 'need.md'),
      content: `---
description: Find and install CLI tools using need
---

${mcpInstructions}
`,
    },
    {
      name: 'Cursor',
      filePath: path.join(cwd, '.cursor', 'rules', 'need.mdc'),
      content: `---
description: Find and install CLI tools using need
globs:
alwaysApply: true
---

${mcpInstructions}
`,
    },
    {
      name: 'GitHub Copilot',
      filePath: path.join(cwd, '.github', 'copilot-instructions.md'),
      content: `# need — CLI Tool Discovery

${mcpInstructions}
`,
    },
    {
      name: 'Windsurf',
      filePath: path.join(cwd, '.windsurf', 'rules', 'need.md'),
      content: `---
description: Find and install CLI tools using need
---

${mcpInstructions}
`,
    },
  ];
}

export async function initCommand(): Promise<void> {
  const cwd = process.cwd();
  const results: Array<{ name: string; result: InitResult; filePath: string }> = [];

  for (const tool of getToolConfigs(cwd)) {
    if (fs.existsSync(tool.filePath)) {
      results.push({ name: tool.name, result: 'already exists', filePath: tool.filePath });
    } else {
      ensureDir(path.dirname(tool.filePath));
      fs.writeFileSync(tool.filePath, tool.content, 'utf-8');
      results.push({ name: tool.name, result: 'created', filePath: tool.filePath });
    }
  }

  for (const { name, result, filePath } of results) {
    const rel = path.relative(cwd, filePath);
    if (result === 'already exists') {
      console.log(`\u2013 ${name} \u2014 already exists (${rel})`);
    } else {
      console.log(`\u2713 ${name} \u2014 created (${rel})`);
    }
  }
}
