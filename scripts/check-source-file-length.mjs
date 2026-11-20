import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const baseline = new Set(fs.readFileSync(
  new URL('../docs/refactoring/source-length-baseline.txt', import.meta.url),
  'utf8',
).trim().split(/\r?\n/));
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

const oversized = sourceRoots.flatMap((dir) => walk(path.join(root, dir)))
  .map((file) => {
    const relativeFile = path.relative(root, file).replaceAll('\\', '/');
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).length;
    return { file: relativeFile, lines };
  })
  .filter(({ lines }) => lines > 300)
  .sort((a, b) => b.lines - a.lines);
const violations = oversized.filter(({ file }) => !baseline.has(file));

if (violations.length) {
  console.error(`Source-file length check failed: ${violations.length} new file(s) exceed 300 physical lines.`);
  for (const item of violations) console.error(`${item.lines}\t${item.file}`);
  process.exitCode = 1;
} else {
  console.log(`Source-file length check passed (${oversized.length} existing exceptions).`);
}
