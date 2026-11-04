import fs from 'fs';
import path from 'path';

/**
 * API: /api/versets
 * Liste en temps réel tous les fichiers versets JPEG/PNG disponibles dans assets/versets
 */
export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const versetsDir = path.join(process.cwd(), 'assets', 'versets');
        if (!fs.existsSync(versetsDir)) {
            return res.status(200).json({ success: true, count: 0, versets: [] });
        }

        const files = fs.readdirSync(versetsDir);
        const verseFiles = files
            .filter(f => /\.(jpe?g|png)$/i.test(f))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
            .map(f => `assets/versets/${f}`);

        return res.status(200).json({
            success: true,
            count: verseFiles.length,
            versets: verseFiles
        });
    } catch (err) {
        console.error("Erreur api/versets:", err);
        return res.status(500).json({ success: false, error: err.message, versets: [] });
    }
}
