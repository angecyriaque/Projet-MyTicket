// ==============================================================================
// api/wave-create-checkout.js
// Endpoint d'initiation de paiement Wave Checkout
// ==============================================================================

const { createCheckoutSession, FIXED_TICKET_AMOUNT, FIXED_CURRENCY } = require('./_lib/wave');
const { saveTransaction } = require('./_lib/db');

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
    }

    try {
        const body = req.body || {};
        const { nom, prenom, contact1, contact2, eglise, categorie, returnUrl } = body;

        // Validation des champs indispensables du participant
        if (!nom || !prenom || !contact1) {
            return res.status(400).json({
                error: 'Coordonnées incomplètes. Nom, prénom et contact téléphonique sont obligatoires.'
            });
        }

        // RÈGLE OBLIGATOIRE DU CAHIER DES CHARGES (SECTION 2.2) :
        // "Le montant de chaque transaction doit être strictement fixé à 10 000 FCFA.
        // Le montant doit être défini côté serveur. L'utilisateur ne doit pas pouvoir modifier le montant."
        const amount = FIXED_TICKET_AMOUNT; // "10000"
        const currency = FIXED_CURRENCY;   // "XOF"

        // Génération d'une référence unique de transaction
        const timestamp = Date.now();
        const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
        const clientReference = `MYT-WV-${timestamp}-${rand}`;

        // Détermination de l'URL racine de l'application (support multi-hébergement : Vercel & GitHub Pages)
        let baseUrl = 'https://projet-myticket.vercel.app';
        if (returnUrl && typeof returnUrl === 'string' && returnUrl.startsWith('https://')) {
            baseUrl = returnUrl.replace(/\/$/, '');
        } else {
            const protocol = req.headers['x-forwarded-proto'] || 'https';
            const host = req.headers['x-forwarded-host'] || req.headers.host || 'projet-myticket.vercel.app';
            if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
                baseUrl = `${protocol}://${host}`.replace(/\/$/, '');
            }
        }

        const successUrl = `${baseUrl}/?wave_status=success&ref=${clientReference}`;
        const errorUrl = `${baseUrl}/?wave_status=error&ref=${clientReference}`;

        // Appel Wave Checkout API côté serveur
        const session = await createCheckoutSession({
            clientReference,
            successUrl,
            errorUrl,
            customerInfo: { nom, prenom, contact1, contact2, eglise, categorie }
        });

        // Enregistrement de la transaction avec le statut initial "En attente"
        const initialTx = {
            id: clientReference,
            clientReference: clientReference,
            waveSessionId: session.id,
            waveTransactionId: null,
            amount: parseInt(amount, 10), // 10000
            currency: currency,          // XOF
            status: 'En attente',        // Statut initial obligatoire
            paymentMethod: 'Wave',
            merchant: 'Pitchou maillots',
            merchantId: 'M_ci_5Ak1intPKX_j',
            customer: {
                nom: String(nom).trim(),
                prenom: String(prenom).trim(),
                contact1: String(contact1).trim(),
                contact2: String(contact2 || '').trim(),
                eglise: String(eglise || 'EMCI Horeb').trim(),
                categorie: String(categorie || 'Classique').trim()
            },
            createdAt: new Date().toISOString(),
            confirmedAt: null,
            ticketId: null,
            history: [
                {
                    status: 'En attente',
                    timestamp: new Date().toISOString(),
                    note: 'Session de paiement Wave créée avec succès (10 000 FCFA).'
                }
            ],
            isMock: !!session.is_mock
        };

        await saveTransaction(initialTx);

        // Réponse au frontend
        return res.status(200).json({
            ok: true,
            client_reference: clientReference,
            session_id: session.id,
            wave_launch_url: session.wave_launch_url,
            amount: 10000,
            currency: 'XOF',
            status: 'En attente',
            is_mock: session.is_mock
        });
    } catch (err) {
        console.error("Erreur api/wave-create-checkout:", err);
        return res.status(500).json({
            error: err.message || "Erreur interne lors de la création de la session Wave."
        });
    }
};
