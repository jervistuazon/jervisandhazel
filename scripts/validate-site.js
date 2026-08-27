const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteFiles = [
  'index.html',
  'style.css',
  'script.js',
  'wedding/index.html',
  'wedding/assets/css/wedding.css',
  'wedding/assets/js/wedding.js'
];

const errors = [];
const warnings = [];

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const normalizeRef = (ref) => ref.split('?')[0].split('#')[0];
const isExternal = (ref) => /^(?:https?:|mailto:|tel:|data:|#|\/)/i.test(ref);

const checkMojibake = () => {
  const mojibake = /(?:\u00e2|\u00c3|\ufffd)/;
  siteFiles.forEach((file) => {
    const content = read(file);
    if (mojibake.test(content)) {
      errors.push(`${file}: possible garbled UTF-8 text remains.`);
    }
  });
};

const checkLocalReferences = () => {
  const referencePattern = /(?:src|href)=["']([^"']+)["']|url\(["']?([^"')]+)["']?\)/g;

  siteFiles.forEach((file) => {
    const content = read(file);
    const baseDir = path.dirname(file);
    let match;

    while ((match = referencePattern.exec(content)) !== null) {
      const ref = match[1] || match[2];
      if (!ref || isExternal(ref)) continue;

      const cleanRef = normalizeRef(ref);
      if (!cleanRef || cleanRef.startsWith('fonts.googleapis.com')) continue;

      const target = path.normalize(path.join(baseDir, cleanRef));
      if (!exists(target)) {
        errors.push(`${file}: missing referenced asset ${ref}`);
      }
    }
  });
};

const extractVersion = (content, pattern, label) => {
  const match = content.match(pattern);
  if (!match) {
    errors.push(`Missing cache-busting version for ${label}.`);
    return null;
  }
  return match[1];
};

const checkVersionAlignment = () => {
  const rootHtml = read('index.html');
  const weddingHtml = read('wedding/index.html');
  const weddingJs = read('wedding/assets/js/wedding.js');

  const rootStyleVersion = extractVersion(rootHtml, /style\.css\?v=([0-9-]+)/, 'root style.css');
  const rootScriptVersion = extractVersion(rootHtml, /script\.js\?v=([0-9-]+)/, 'root script.js');
  const weddingStyleVersion = extractVersion(weddingHtml, /wedding\.css\?v=([0-9-]+)/, 'wedding.css');
  const weddingScriptVersion = extractVersion(weddingHtml, /wedding\.js\?v=([0-9-]+)/, 'wedding.js');
  const galleryAssetVersion = extractVersion(weddingJs, /galleryAssetVersion = '([0-9-]+)'/, 'galleryAssetVersion');

  if (rootStyleVersion && rootScriptVersion && rootStyleVersion !== rootScriptVersion) {
    errors.push(`Root CSS/JS versions differ: ${rootStyleVersion} vs ${rootScriptVersion}.`);
  }

  if (weddingStyleVersion && weddingScriptVersion && weddingStyleVersion !== weddingScriptVersion) {
    errors.push(`Wedding CSS/JS versions differ: ${weddingStyleVersion} vs ${weddingScriptVersion}.`);
  }

  if (weddingScriptVersion && galleryAssetVersion && weddingScriptVersion !== galleryAssetVersion) {
    errors.push(`Wedding JS version and galleryAssetVersion differ: ${weddingScriptVersion} vs ${galleryAssetVersion}.`);
  }
};

const checkCname = () => {
  if (!exists('CNAME')) {
    errors.push('CNAME is missing.');
  }
};

checkMojibake();
checkLocalReferences();
checkVersionAlignment();
checkCname();

if (warnings.length) {
  warnings.forEach((warning) => console.warn(`WARN: ${warning}`));
}

if (errors.length) {
  errors.forEach((error) => console.error(`ERROR: ${error}`));
  process.exit(1);
}

console.log('Site validation passed.');
