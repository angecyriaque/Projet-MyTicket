const fs = require('fs');
const path = require('path');

const versetsDir = path.join(__dirname, 'assets', 'versets');
const manifestPath = path.join(versetsDir, 'manifest.json');

if (!fs.existsSync(versetsDir)) {
    fs.mkdirSync(versetsDir, { recursive: true });
}

const files = fs.readdirSync(versetsDir);
const verseFiles = files
    .filter(f => /\.(jpe?g|png)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map(f => `assets/versets/${f}`);

fs.writeFileSync(manifestPath, JSON.stringify(verseFiles, null, 2), 'utf8');

console.log(`[VERSETS] Inventaire mis a jour: ${verseFiles.length} fichiers trouves.`);
console.log(`[VERSETS] Manifeste genere dans ${manifestPath}`);
