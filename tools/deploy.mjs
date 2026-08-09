// Deploy dist/ to Netlify (same site, prod) via the file-digest API.
// Token from env NETLIFY_AUTH_TOKEN or the local .netlify-token file.
// Run: node tools/deploy.mjs   (build first, or use `npm run deploy`)
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

process.chdir(join(dirname(fileURLToPath(import.meta.url)), '..'));

const SITE_ID = '9eb1a157-4412-418a-88b8-4fc9a12ca0d6';
const SITE_URL = 'https://wonderful-meerkat-10ca3d.netlify.app/';
const API = 'https://api.netlify.com/api/v1';
const DIST = 'dist';

let TOKEN = process.env.NETLIFY_AUTH_TOKEN;
try { if (!TOKEN) TOKEN = readFileSync('.netlify-token', 'utf8').trim(); } catch {}
if (!TOKEN) { console.error('No Netlify token (set NETLIFY_AUTH_TOKEN or .netlify-token)'); process.exit(1); }

function walk(dir, base = '') {
  const out = [];
  for (const name of readdirSync(dir)) {
    const fp = join(dir, name);
    const rel = base ? base + '/' + name : name;
    statSync(fp).isDirectory() ? out.push(...walk(fp, rel)) : out.push({ rel, fp });
  }
  return out;
}

const digest = {}, bytes = {};
for (const f of walk(DIST)) {
  const buf = readFileSync(f.fp);
  const key = '/' + f.rel.replace(/\\/g, '/');
  digest[key] = createHash('sha1').update(buf).digest('hex');
  bytes[key] = buf;
}

const authJson = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };
const dep = await (await fetch(`${API}/sites/${SITE_ID}/deploys`, { method: 'POST', headers: authJson, body: JSON.stringify({ files: digest }) })).json();
if (!dep.id) { console.error('Deploy create failed:', dep); process.exit(1); }
const required = new Set(dep.required || []);
console.log(`deploy ${dep.id} — ${required.size} file(s) to upload`);
const uploaded = new Set(); // Netlify wants each unique sha only once
for (const [key, sha] of Object.entries(digest)) {
  if (required.has(sha) && !uploaded.has(sha)) {
    uploaded.add(sha);
    const r = await fetch(`${API}/deploys/${dep.id}/files${key}`, {
      method: 'PUT', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/octet-stream' }, body: bytes[key],
    });
    console.log('  ↑', key, r.status);
  }
}
console.log('✓ live → ' + SITE_URL);
