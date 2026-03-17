import * as fs from 'node:fs';
import * as path from 'node:path';

const MARKER = '<!-- need-tools -->';

const RULE = `${MARKER}
# Tool Discovery (need)

Before writing scripts or installing packages for common tasks (scraping, file conversion, data processing, image manipulation, etc.), search for existing CLI tools using the \`need\` MCP server's \`search_tools\` function. Install the best match with \`install_tool\`, then report success/failure with \`report_tool_usage\`. Only write custom code if no suitable tool exists.
${MARKER}`;

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Appends the need tool-discovery rule to a CLAUDE.md file.
 * Skips if the marker is already present.
 * Returns whether a change was made.
 */
export function appendClaudeMdRule(filePath: string): 'created' | 'updated' | 'already exists' {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes(MARKER)) {
      return 'already exists';
    }
    fs.writeFileSync(filePath, content.trimEnd() + '\n\n' + RULE + '\n', 'utf-8');
    return 'updated';
  }

  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, RULE + '\n', 'utf-8');
  return 'created';
}

export { MARKER as CLAUDE_MD_MARKER, RULE as CLAUDE_MD_RULE };
