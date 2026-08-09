// dev.mjs — local dev server with watch + live-reload
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { build } from './build.mjs';
import chokidar from 'chokidar';

// Run relative to this file's folder, so it works from any cwd
// (e.g. when launched via .claude/launch.json from the repo root).
process.chdir(dirname(fileURLToPath(import.meta.url)));

const PORT = 5173;
const HOST = '0.0.0.0'; // accessible from iPhone on same network

let clients = [];
let lastBuild = 0;

function rebuild() {
  try {
    build();
    lastBuild = Date.now();
    // Notify all SSE clients
    clients.forEach(c => c.write(`data: reload\n\n`));
  } catch (e) {
    console.error('✗ Build error:', e.message);
  }
}

// Initial build
rebuild();

// Watch src/
const watcher = chokidar.watch('./src', {
  ignored: /node_modules|\.git/,
  ignoreInitial: true,
});
watcher.on('all', (event, path) => {
  console.log(`\n📝 ${event}: ${path}`);
  rebuild();
});

// Live-reload snippet injected into HTML response
const liveReload = `
<script>
(function() {
  const es = new EventSource('/__livereload');
  es.onmessage = (e) => { if (e.data === 'reload') location.reload(); };
  es.onerror = () => setTimeout(() => location.reload(), 2000);
})();
</script>
`;

// HTTP server
createServer((req, res) => {
  // SSE endpoint for live-reload
  if (req.url === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    clients.push(res);
    req.on('close', () => { clients = clients.filter(c => c !== res); });
    return;
  }

  // Serve the built HTML
  const file = join('./dist', 'LifeOS.html');
  if (!existsSync(file)) {
    res.writeHead(503);
    res.end('Build pending...');
    return;
  }
  let html = readFileSync(file, 'utf8');
  // Inject live-reload right before </body>
  html = html.replace('</body>', liveReload + '</body>');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}).listen(PORT, HOST, () => {
  console.log(`\n🚀 LifeOS dev server running`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   iPhone:   http://<deine-lokale-ip>:${PORT}`);
  console.log(`   (ipconfig → IPv4-Adresse, Phone muss im selben WLAN sein)`);
  console.log(`\nÄnderungen in src/ werden live übernommen.\n`);
});
