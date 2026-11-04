// ==============================================================================
// api/_lib/db.js
// Système de persistance des transactions Wave & Tickets
// Supporte Firestore REST API & Cache en mémoire / Fallback
// ==============================================================================

const https = require('https');

// Cache en mémoire pour fonctionnement ultra-rapide et résilience
const memoryTransactions = new Map();

// Configuration Firebase Firestore REST API
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'myticket-cdd9e';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

/**
 * Convertit un document Firestore REST en objet JavaScript classique
 */
function fromFirestore(doc) {
    if (!doc || !doc.fields) return null;
    const result = {};
    for (const [key, valObj] of Object.entries(doc.fields)) {
        if ('stringValue' in valObj) result[key] = valObj.stringValue;
        else if ('integerValue' in valObj) result[key] = parseInt(valObj.integerValue, 10);
        else if ('doubleValue' in valObj) result[key] = parseFloat(valObj.doubleValue);
        else if ('booleanValue' in valObj) result[key] = valObj.booleanValue;
        else if ('timestampValue' in valObj) result[key] = valObj.timestampValue;
        else if ('nullValue' in valObj) result[key] = null;
        else if ('mapValue' in valObj) result[key] = fromFirestore(valObj.mapValue);
        else if ('arrayValue' in valObj) {
            result[key] = (valObj.arrayValue.values || []).map(v => {
                if ('stringValue' in v) return v.stringValue;
                if ('integerValue' in v) return parseInt(v.integerValue, 10);
                if ('mapValue' in v) return fromFirestore(v.mapValue);
                return v;
            });
        }
    }
    return result;
}

/**
 * Convertit un objet JavaScript classique vers le format Firestore REST
 */
function toFirestore(obj) {
    const fields = {};
    for (const [key, val] of Object.entries(obj)) {
        if (val === null || val === undefined) {
            fields[key] = { nullValue: null };
        } else if (typeof val === 'string') {
            fields[key] = { stringValue: val };
        } else if (typeof val === 'number') {
            if (Number.isInteger(val)) fields[key] = { integerValue: val.toString() };
            else fields[key] = { doubleValue: val };
        } else if (typeof val === 'boolean') {
            fields[key] = { booleanValue: val };
        } else if (Array.isArray(val)) {
            fields[key] = {
                arrayValue: {
                    values: val.map(item => {
                        if (typeof item === 'string') return { stringValue: item };
                        if (typeof item === 'object') return { mapValue: { fields: toFirestore(item) } };
                        return { stringValue: String(item) };
                    })
                }
            };
        } else if (typeof val === 'object') {
            fields[key] = { mapValue: { fields: toFirestore(val) } };
        }
    }
    return fields;
}

/**
 * Requête HTTP vers Firestore REST API
 */
function firestoreRequest(path, method = 'GET', data = null) {
    return new Promise((resolve) => {
        try {
            const url = new URL(`${FIRESTORE_BASE}${path}`);
            const payload = data ? JSON.stringify(data) : null;

            const options = {
                hostname: url.hostname,
                port: 443,
                path: `${url.pathname}${url.search}`,
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (payload) {
                options.headers['Content-Length'] = Buffer.byteLength(payload);
            }

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(body));
                        } catch(e) {
                            resolve(null);
                        }
                    } else {
                        resolve(null); // Fallback silencieux vers memory cache
                    }
                });
            });

            req.on('error', () => resolve(null));
            req.setTimeout(3500, () => {
                req.destroy();
                resolve(null);
            });

            if (payload) req.write(payload);
            req.end();
        } catch(e) {
            resolve(null);
        }
    });
}

/**
 * Enregistre ou met à jour une transaction
 */
async function saveTransaction(tx) {
    if (!tx || !tx.clientReference) return null;

    // Toujours mettre à jour le cache mémoire
    const existing = memoryTransactions.get(tx.clientReference) || {};
    const merged = { ...existing, ...tx, updatedAt: new Date().toISOString() };
    memoryTransactions.set(tx.clientReference, merged);

    // Persister dans Firestore (Collection wave_transactions)
    try {
        const firestoreFields = toFirestore(merged);
        await firestoreRequest(`/wave_transactions/${encodeURIComponent(tx.clientReference)}`, 'PATCH', {
            fields: firestoreFields
        });
    } catch (e) {
        console.warn("Firestore sync notice (using memory fallback):", e.message);
    }

    return merged;
}

/**
 * Récupère une transaction par sa référence interne (ex: MYT-WV-...)
 */
async function getTransactionByRef(ref) {
    if (!ref) return null;

    // 1. Chercher dans le cache mémoire
    if (memoryTransactions.has(ref)) {
        return memoryTransactions.get(ref);
    }

    // 2. Chercher dans Firestore
    const res = await firestoreRequest(`/wave_transactions/${encodeURIComponent(ref)}`, 'GET');
    if (res && res.fields) {
        const tx = fromFirestore(res);
        if (tx) {
            memoryTransactions.set(ref, tx);
            return tx;
        }
    }

    return null;
}

/**
 * Récupère une transaction par son session_id Wave (ex: cos_...)
 */
async function getTransactionBySessionId(sessionId) {
    if (!sessionId) return null;

    for (const tx of memoryTransactions.values()) {
        if (tx.waveSessionId === sessionId) return tx;
    }

    return null;
}

/**
 * Récupère une transaction par son identifiant de reçu Wave (ex: T_...)
 * Utilisé pour la protection anti-doublon / anti-fraude (un reçu = un seul ticket)
 */
async function getTransactionByWaveTxId(waveTxId) {
    if (!waveTxId) return null;
    const cleanId = String(waveTxId).trim().toUpperCase();

    // 1. Chercher d'abord en mémoire
    for (const tx of memoryTransactions.values()) {
        if ((tx.waveTransactionId || '').toUpperCase() === cleanId) {
            return tx;
        }
    }

    // 2. Si non trouvé en mémoire, interroger Firestore
    try {
        const all = await listTransactions({ status: 'ALL', limit: 200 });
        return all.find(t => (t.waveTransactionId || '').toUpperCase() === cleanId) || null;
    } catch (e) {
        return null;
    }
}

/**
 * Liste toutes les transactions avec filtrage optionnel
 */
async function listTransactions({ status = 'ALL', search = '', limit = 100 } = {}) {
    // 1. Tenter de charger depuis Firestore
    try {
        const res = await firestoreRequest('/wave_transactions?pageSize=100', 'GET');
        if (res && res.documents) {
            res.documents.forEach(doc => {
                const tx = fromFirestore(doc);
                if (tx && tx.clientReference) {
                    memoryTransactions.set(tx.clientReference, tx);
                }
            });
        }
    } catch(e) {}

    let list = Array.from(memoryTransactions.values());

    // Tri antéchronologique (plus récent d'abord)
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // Filtrage par statut
    if (status && status !== 'ALL') {
        list = list.filter(t => (t.status || '').toLowerCase() === status.toLowerCase());
    }

    // Recherche plein texte
    if (search) {
        const q = search.toLowerCase().trim();
        list = list.filter(t => 
            (t.clientReference || '').toLowerCase().includes(q) ||
            (t.waveTransactionId || '').toLowerCase().includes(q) ||
            (t.customer?.nom || '').toLowerCase().includes(q) ||
            (t.customer?.prenom || '').toLowerCase().includes(q) ||
            (t.customer?.contact1 || '').includes(q) ||
            (t.ticketId || '').toLowerCase().includes(q)
        );
    }

    if (limit > 0) {
        list = list.slice(0, limit);
    }

    return list;
}

/**
 * Calcule les indicateurs clés (KPIs) des transactions Wave
 */
async function getTransactionStats() {
    const all = await listTransactions({ status: 'ALL', limit: 1000 });

    let totalVolumePaid = 0;
    let countPaid = 0;
    let countPending = 0;
    let countFailed = 0;
    let countToReview = 0;

    for (const t of all) {
        if (t.status === 'Payé') {
            totalVolumePaid += (t.amount || 10000);
            countPaid++;
        } else if (t.status === 'En attente') {
            countPending++;
        } else if (t.status === 'Échoué' || t.status === 'Annulé' || t.status === 'Expiré') {
            countFailed++;
        } else if (t.status === 'À vérifier') {
            countToReview++;
        }
    }

    return {
        totalVolumePaid,
        countTotal: all.length,
        countPaid,
        countPending,
        countFailed,
        countToReview
    };
}

module.exports = {
    saveTransaction,
    getTransactionByRef,
    getTransactionBySessionId,
    getTransactionByWaveTxId,
    listTransactions,
    getTransactionStats
};
