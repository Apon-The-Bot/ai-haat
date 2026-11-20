import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const report = process.argv.includes("--write");
const rows = [];
const emoji = /(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:[\uFE0F\p{Emoji_Modifier}]|\u200D\p{Extended_Pictographic})*/gu;
const assets = /\.(?:svg|png|webp|gif|ico|avif|jpe?g)(?:[?#].*)?$/i;
const iconFonts = /\b(?:fa-(?:solid|regular|brands|[a-z][\w-]+)|material-icons(?:-[\w-]+)?|material-symbols-[\w-]+|fi-(?:rr|sr|br|rs|ss)-[\w-]+|iconify)\b/g;

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name).replaceAll("\\", "/");
    return entry.isDirectory() ? files(path) : [path];
  }).sort();
}

function inspect(path) {
  const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true);
  const imports = new Map();
  const brand = /facebook|instagram|youtube|twitter|google|whatsapp|telegram|linkedin|paypal|github|stripe|bkash|nagad|logo/i;
  const add = (node, type, name, target, status = "Pending", risk = "Confirm semantics in context") => {
    const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
    const priority = /Header|Footer|Navigation|BottomNav|checkout|auth\//i.test(path) ? "High" : "Normal";
    const site = path.startsWith("src/app/") ? path.slice(7) : path.split("/").pop();
    const usage = node.parent && ts.isJsxOpeningLikeElement(node.parent) ? "Rendered" : "Source reference";
    const behavior = /Loader|Spinner/i.test(name) ? "Loop while busy" :
      /Success|Warning|Error|Alert/i.test(name) ? "State" : "Context review";
    rows.push([site, path + ":" + line, type, name, usage, target, behavior, priority, status, risk]);
  };

  for (const node of source.statements) {
    if (!ts.isImportDeclaration(node) || node.importClause?.isTypeOnly) continue;
    const moduleName = node.moduleSpecifier.text;
    const animated = moduleName === "@/components/animated-icons/lucide";
    if (!animated && !/lucide-react|react-icons|heroicons|phosphor|tabler\/icons/.test(moduleName)) continue;
    const named = node.importClause?.namedBindings;
    if (named && ts.isNamedImports(named)) {
      for (const element of named.elements) {
        if (!element.isTypeOnly) imports.set(element.name.text, { name: element.propertyName?.text ?? element.name.text, animated });
      }
      if (named.elements.every((element) => element.isTypeOnly)) continue;
    }
    add(node, animated ? "AnimateIcons import" : "Legacy import", moduleName, "—", "Evidence", "Import declaration");
  }
  function visit(node) {
    if (ts.isImportDeclaration(node)) return;
    if (ts.isIdentifier(node) && imports.has(node.text) &&
      !(ts.isJsxClosingElement(node.parent) || (ts.isPropertyAssignment(node.parent) && node.parent.name === node))) {
      const { name, animated } = imports.get(node.text);
      if (animated) add(node, "AnimateIcons reference", name, name, "Migrated");
      else add(node, "Legacy reference", name, name, brand.test(name) ? "Review brand" : "Pending");
    }
    if (ts.isJsxOpeningLikeElement(node)) {
      const name = node.tagName.getText(source);
      if (name === "svg") add(node.tagName, "Inline SVG", "SVG", "Review markup", "Review", "May be a logo or illustration");
      if (/^(Icon|.*Icon|icon)$/.test(name) && !imports.has(name) && !/AnimatedIcon/.test(name)) {
        add(node.tagName, "Icon component", name, "Trace source", "Review", "May refer to an inventory entry elsewhere");
      }
    }
    if (ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node) || ts.isJsxText(node)) {
      const value = node.text;
      const raw = node.getText(source);
      const outOfUi = /\/api\/|^src\/lib\/|^src\/data\//.test(path);
      for (const match of value.matchAll(emoji)) {
        add(node, "Emoji candidate", match[0], "Review purpose", "Review", outOfUi ? "May be backend data, template, or external copy" : "May be application copy or shared data");
      }
      if (/\\u(?:\{[\da-f]+\}|[\da-f]{4})/i.test(raw) && emoji.test(value)) {
        add(node, "Unicode escape", "Emoji escape", "Review purpose", "Evidence");
      }
      emoji.lastIndex = 0;
      if (assets.test(value) && !ts.isJsxText(node)) add(node, "Image reference", value, "Review asset", "Review", "May be product artwork, photo, or official mark");
      for (const match of value.matchAll(iconFonts)) add(node, "Font class candidate", match[0], "Review font", "Review");
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

const sourceFiles = files("src").filter((file) => /\.[cm]?[jt]sx?$/.test(file));
sourceFiles.forEach(inspect);
const counts = {};
for (const [, , kind] of rows) counts[kind] = (counts[kind] ?? 0) + 1;
const summary = Object.entries(counts).map(([kind, count]) => `- ${kind}: ${count}`).join("\n");
console.log(`Scanned ${sourceFiles.length} source files.\n${summary}`);
if (report) {
  const escape = (value) => String(value).replaceAll("|", "\\|").replace(/[\r\n]/g, " ");
  mkdirSync("docs/animated-icons", { recursive: true });
  writeFileSync("docs/animated-icons/ICON_AUDIT.md", `# Original icon inventory

The inventory scans ${sourceFiles.length} application source files using TypeScript syntax. Rows represent source findings. Imports and Unicode escape rows are supporting evidence. Dynamic rendering references may pair with definition rows. Image, emoji, SVG and font candidates require visual and ownership review. CMS values, customer content and database records are outside this source scan.

Next.js 15.5.29 App Router uses React 18, Tailwind, CSS theme tokens and existing Framer Motion/CSS effects. The inventory covers shared components, storefront, auth, checkout, wallet, dashboard, administration and server-side templates. Product artwork, payment marks and AI Haat artwork require preservation. References keep an existing glyph until an approved equivalent is integrated.

${summary}

| Route or component | Location | Existing source | Meaning or identifier | Context | Proposed match or review | Playback | Priority | Original status | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.map((row) => `| ${row.map(escape).join(" | ")} |`).join("\n")}
`);
}
