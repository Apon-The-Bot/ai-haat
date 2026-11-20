import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const sourceRoots = ['src', 'scripts'];
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const ignored = /(^|[\\/])(node_modules|\.next|dist|build|coverage|vendor|generated|reports)([\\/]|$)|\.d\.ts$/;

function walk(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (ignored.test(full)) continue;
    if (entry.isDirectory()) result.push(...walk(full));
    else if (extensions.has(path.extname(entry.name))) result.push(full);
  }
  return result;
}

function gitFileLineCount(relativeFile) {
  try {
    const content = execFileSync('git', ['show', `HEAD:${relativeFile}`], { cwd: root, encoding: 'utf8' });
    return content.split(/\r?\n/).length;
  } catch {
    return null;
  }
}

const violations = sourceRoots.flatMap((dir) => walk(path.join(root, dir)))
  .map((file) => {
    const relativeFile = path.relative(root, file).replaceAll('\\', '/');
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).length;
    const previousLines = lines > 300 ? gitFileLineCount(relativeFile) : null;
    return { file: relativeFile, lines, previousLines };
  })
  .filter(({ lines }) => lines > 300)
  .filter(({ previousLines }) => previousLines === null || previousLines <= 300)
  .sort((a, b) => b.lines - a.lines);

if (violations.length) {
  console.error(`Source-file length check failed: ${violations.length} new file(s) exceed 300 physical lines.`);
  for (const item of violations) console.error(`${item.lines}\t${item.file}`);
  process.exitCode = 1;
} else {
  console.log('Source-file length check passed: all maintained source files are at or below 300 lines.');
}
