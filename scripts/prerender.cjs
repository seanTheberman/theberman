#!/usr/bin/env node
/**
 * SPA Prerender Script
 * Generates static HTML files for each public route after Vite build.
 * This allows Googlebot and other crawlers to see actual HTML content
 * without executing JavaScript.
 */
const { chromium } = require('/usr/local/lib/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const DIST = path.resolve(__dirname, '../dist');

// Public routes that should be prerendered for SEO
const ROUTES = [
  '/',
  '/about',
  '/services',
  '/pricing',
  '/contact-us',
  '/catalogue',
  '/locations',
  '/faq',
  '/news',
  '/blog',
  '/hire-agent',
  '/get-quote',
  '/privacy',
  '/terms',
  '/cookie-policy',
  '/signup',
  '/login',
  '/assessor-terms',
];

async function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      // Sanitize URL to prevent directory traversal
      const safeUrl = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
      let filePath = path.join(DIST, safeUrl);

      // Try exact file match
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const contentType =
          ext === '.html'
            ? 'text/html'
            : ext === '.js' || ext === '.mjs'
            ? 'application/javascript'
            : ext === '.css'
            ? 'text/css'
            : ext === '.json'
            ? 'application/json'
            : ext === '.svg'
            ? 'image/svg+xml'
            : ext === '.png'
            ? 'image/png'
            : ext === '.jpg' || ext === '.jpeg'
            ? 'image/jpeg'
            : 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(fs.readFileSync(filePath));
        return;
      }

      // Try with .html extension
      const htmlPath = filePath + '.html';
      if (fs.existsSync(htmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(htmlPath));
        return;
      }

      // Try index.html in directory
      const indexPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(indexPath));
        return;
      }

      // SPA fallback: serve root index.html for client-side routing
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(path.join(DIST, 'index.html')));
    });

    server.listen(PORT, () => {
      console.log(`[prerender] Static server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function prerenderRoute(page, route) {
  const url = `http://localhost:${PORT}${route}`;
  console.log(`[prerender] Rendering: ${route}`);

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 15000,
  });

  // Wait for React to render
  await page.waitForTimeout(1500);

  // Ensure react-helmet has injected meta tags
  await page.waitForFunction(() => document.title.length > 0, { timeout: 5000 }).catch(() => {});

  const html = await page.content();

  // Write to dist/<route>/index.html (or dist/index.html for root)
  const outDir = route === '/' ? DIST : path.join(DIST, route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);

  console.log(`[prerender] ✓ Saved: ${outDir}/index.html`);
}

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error('[prerender] dist/ folder not found. Run "vite build" first.');
    process.exit(1);
  }

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      try {
        await prerenderRoute(page, route);
      } catch (err) {
        console.error(`[prerender] ✗ Failed: ${route}`, err.message);
      } finally {
        await page.close();
      }
    }

    console.log(`\n[prerender] Complete. ${ROUTES.length} routes prerendered.`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error('[prerender] Fatal error:', err);
  process.exit(1);
});
