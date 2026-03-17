import * as fs from 'node:fs';
import * as path from 'node:path';
import { ensureDir, CLAUDE_MD_RULE, CLAUDE_MD_MARKER } from '../lib/claude-md.js';

type InitResult = 'created' | 'already exists' | 'updated';

interface ToolConfig {
  name: string;
  filePath: string;
  content: string;
  append?: boolean;
  marker?: string;
}

const MCP_INSTRUCTIONS = `When you need a CLI tool for a task, use \`need\` to find and install it:

1. **Search** — \`need <query>\` (e.g. \`need json formatter\`)
2. **Install** — follow the install command from the results
3. **Report** — \`need report <tool> --success\` or \`--fail\`

If you have access to MCP tools, prefer using \`search_tools\`, \`install_tool\`, and \`report_tool_usage\` from the \`need\` MCP server.`;

function getToolConfigs(cwd: string): ToolConfig[] {
  return [
    {
      name: 'Claude Code (CLAUDE.md)',
      filePath: path.join(cwd, 'CLAUDE.md'),
      content: CLAUDE_MD_RULE,
      append: true,
      marker: CLAUDE_MD_MARKER,
    },
    {
      name: 'Claude Code (command)',
      filePath: path.join(cwd, '.claude', 'commands', 'need.md'),
      content: `---\ndescription: Find and install CLI tools using need\n---\n\n${MCP_INSTRUCTIONS}\n`,
    },
    {
      name: 'Cursor',
      filePath: path.join(cwd, '.cursor', 'rules', 'need.mdc'),
      content: `---\ndescription: Find and install CLI tools using need\nglobs:\nalwaysApply: true\n---\n\n${MCP_INSTRUCTIONS}\n`,
    },
    {
      name: 'GitHub Copilot',
      filePath: path.join(cwd, '.github', 'copilot-instructions.md'),
      content: `# need — CLI Tool Discovery\n\n${MCP_INSTRUCTIONS}\n`,
    },
    {
      name: 'Windsurf',
      filePath: path.join(cwd, '.windsurf', 'rules', 'need.md'),
      content: `---\ndescription: Find and install CLI tools using need\n---\n\n${MCP_INSTRUCTIONS}\n`,
    },
  ];
}

export async function initCommand(): Promise<void> {
  const cwd = process.cwd();
  const results: Array<{ name: string; result: InitResult; filePath: string }> = [];

  for (const tool of getToolConfigs(cwd)) {
    if (tool.append && tool.marker) {
      if (fs.existsSync(tool.filePath)) {
        const existing = fs.readFileSync(tool.filePath, 'utf-8');
        if (existing.includes(tool.marker)) {
          results.push({ name: tool.name, result: 'already exists', filePath: tool.filePath });
        } else {
          fs.writeFileSync(tool.filePath, existing.trimEnd() + '\n\n' + tool.content + '\n', 'utf-8');
          results.push({ name: tool.name, result: 'updated', filePath: tool.filePath });
        }
      } else {
        ensureDir(path.dirname(tool.filePath));
        fs.writeFileSync(tool.filePath, tool.content + '\n', 'utf-8');
        results.push({ name: tool.name, result: 'created', filePath: tool.filePath });
      }
    } else if (fs.existsSync(tool.filePath)) {
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
      console.log(`\u2713 ${name} \u2014 ${result} (${rel})`);
    }
  }
}
