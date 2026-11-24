// Copies the web app files from the repo root into www/ — the directory
// Capacitor syncs into the Android APK (webDir in capacitor.config.json).
// www/ is generated (gitignored): the repo root stays the single source of
// truth, and the GitHub Actions build regenerates www/ on every run.
// Usage: node scripts/sync-www.js
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const www = path.join(root, 'www');

// Files/dirs copied verbatim (the web app itself).
const COPY = [
  'index.html', 'app.js', 'journey.js', 'quran.js', 'style.css', 'sw.js',
  'manifest.json', 'icon-192.png', 'icon-512.png', 'icon.svg',
  'logo-a.webp', 'logo-b.webp',
  'featured-1.jpg', 'featured-2.jpg', 'featured-3.jpg',
  'app-ads.txt', 'data', 'vendor',
];
// Never copied into the APK (docs, tests, build tooling, sources).
const SKIP = new Set([
  'www', 'android', 'node_modules', '.git', '.github', 'verify', 'scripts',
  'package.json', 'package-lock.json', 'capacitor.config.json',
  'native-ads-entry.js',
]);

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });
for (const name of COPY) {
  const src = path.join(root, name);
  if (!fs.existsSync(src)) {
    if (name === 'vendor') continue; // built by build:native-ads
    throw new Error('sync-www: missing expected web file: ' + name);
  }
  if (SKIP.has(name)) continue;
  fs.cpSync(src, path.join(www, name), { recursive: true });
}
console.log('sync-www: copied ' + COPY.length + ' entries into www/');
