// build.mjs — bundles src/ modules into a single HTML file
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

const ROOT = resolve('./src');
const OUT = resolve('./dist');

// Build the embedded curriculum blob: the manifest (lifeos-kurse.json) plus the
// full text of every chapter, sliced out of each course's markdown file by its
// "## <nr>. …" heading. Emitted as `const KURSE_DATA = {…}` so the app has the
// whole curriculum offline with no runtime fetch.
function buildKurseData() {
  const dir = join(ROOT, 'kurse');
  const jsonPath = join(dir, 'lifeos-kurse.json');
  if (!existsSync(jsonPath)) return '';
  const manifest = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const volltext = {};
  for (const kurs of manifest.kurse || []) {
    const mdPath = kurs.datei ? join(dir, kurs.datei) : null;
    if (!mdPath || !existsSync(mdPath)) continue;
    const md = readFileSync(mdPath, 'utf8');
    // Positions of every "## <nr>. …" chapter heading.
    const re = /^##\s*(\d+)\.\s.*$/gm;
    const marks = [];
    let m;
    while ((m = re.exec(md)) !== null) marks.push({ nr: parseInt(m[1], 10), start: m.index });
    for (let i = 0; i < marks.length; i++) {
      const from = marks[i].start;
      // Slice until the next numbered chapter, a new "# TEIL"/top heading, or EOF.
      let to = md.length;
      for (let j = i + 1; j < marks.length; j++) { if (marks[j].nr !== marks[i].nr) { to = marks[j].start; break; } }
      const nextTeil = md.indexOf('\n# ', from + 1);
      if (nextTeil !== -1 && nextTeil < to) to = nextTeil;
      volltext[kurs.id + '.' + marks[i].nr] = md.slice(from, to).trim();
    }
  }
  // Companion guides (not part of the 10 courses) — embedded in the order the
  // user provided them: Start → Kompass → Playbook.
  const GUIDE_ORDER = [
    { id: 'start', datei: '00-START-HIER.md', titel: 'Start hier', icon: '🚩' },
    { id: 'kompass', datei: 'Der-Kompass.md', titel: 'Der Kompass', icon: '🧭' },
    { id: 'playbook', datei: 'Verkaufs-und-Netzwerk-Playbook.md', titel: 'Verkaufs- & Netzwerk-Playbook', icon: '🤝' },
  ];
  const leitfaeden = GUIDE_ORDER
    .filter(g => existsSync(join(dir, g.datei)))
    .map(g => ({ id: g.id, titel: g.titel, icon: g.icon, text: readFileSync(join(dir, g.datei), 'utf8') }));

  return 'const KURSE_DATA = ' + JSON.stringify({ manifest, volltext, leitfaeden }) + ';\n';
}

// Read all files from a directory, sorted alphabetically
function readDirSorted(dir, ext) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith(ext))
    .sort()
    .map(f => ({
      name: f,
      content: readFileSync(join(dir, f), 'utf8')
    }));
}

export function build() {
  console.log('🔨 Building LifeOS...');
  const start = Date.now();

  // Read template
  const template = readFileSync(join(ROOT, 'index.html'), 'utf8');

  // Concatenate CSS
  const cssFiles = readDirSorted(join(ROOT, 'styles'), '.css');
  const css = cssFiles.map(f => `/* === ${f.name} === */\n${f.content}`).join('\n\n');

  // Concatenate JS in this order: core, ui, screens
  const jsModules = [
    ...readDirSorted(join(ROOT, 'core'), '.js'),
    ...readDirSorted(join(ROOT, 'ui'), '.js'),
    ...readDirSorted(join(ROOT, 'screens'), '.js'),
  ];
  // Embedded curriculum first, so KURSE_DATA is defined before any screen runs.
  const kurseData = buildKurseData();
  const js = (kurseData ? '// === kurse-data (generated) ===\n' + kurseData + '\n\n' : '') +
    jsModules.map(f => `// === ${f.name} ===\n${f.content}`).join('\n\n');

  // Inject. NOTE: use replacer FUNCTIONS so the payload is inserted verbatim —
  // a plain string replacement treats $&, $', $`, $$ in the code as special
  // patterns (e.g. a JS string like '63.808 $' would inject the rest of the
  // template and break the bundle).
  let html = template
    .replace('/*<!--INJECT_CSS-->*/', () => css)
    .replace('//<!--INJECT_JS-->', () => js);

  // Write output
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, 'LifeOS.html'), html, 'utf8');
  // index.html so the dist/ folder is a deployable static site (PWA)
  writeFileSync(join(OUT, 'index.html'), html, 'utf8');

  // Copy PWA assets (manifest + icons) into dist/
  const ASSETS = join(ROOT, 'assets');
  let assetCount = 0;
  if (existsSync(ASSETS)) {
    for (const f of readdirSync(ASSETS)) {
      if (/\.(png|webmanifest|svg)$/.test(f)) { copyFileSync(join(ASSETS, f), join(OUT, f)); assetCount++; }
    }
  }

  // Netlify static-host headers (correct manifest type + caching)
  writeFileSync(join(OUT, '_headers'),
    '/manifest.webmanifest\n  Content-Type: application/manifest+json\n' +
    '/*.png\n  Cache-Control: public, max-age=604800\n', 'utf8');

  const ms = Date.now() - start;
  const kb = (html.length / 1024).toFixed(1);
  console.log(`✓ Built dist/LifeOS.html (${kb} KB) in ${ms}ms`);
  console.log(`  ${cssFiles.length} CSS files, ${jsModules.length} JS modules`);
}

// Run build if called directly (cross-platform; the old file:// string check
// never matched on Windows because import.meta.url uses file:///C:/…)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    build();
  } catch (e) {
    console.error('✗ Build failed:', e.message);
    process.exit(1);
  }
}
