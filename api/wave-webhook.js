// ==============================================================================
// api/wave-webhook.js
// Endpoint Webhook Officiel Wave Mobile Money
// Reçoit, authentifie cryptographiquement et synchronise les paiements
// ==============================================================================

const { verifyWebhookSignature, FIXED_TICKET_AMOUNT, FIXED_CURRENCY } = require('./_lib/wave');
const { getTransactionByRef, saveTransaction } = require('./_lib/db');

// Helper pour lire le corps brut de la requête (requis pour le calcul HMAC-SHA256)
function getRawBody(req) {
    return new Promise((resolve) => {
        if (req.rawBody) return resolve(req.rawBody);
        let buffer = '';
        req.on('data', chunk => buffer += chunk);
        req.on('end', () => resolve(buffer));
    });
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée. Seul POST est accepté pour le Webhook.' });
    }

    try {
        const rawBody = await getRawBody(req);
        const signatureHeader = req.headers['wave-signature'] || req.headers['Wave-Signature'] || '';

        // 1. VÉRIFICATION DE LA SIGNATURE CRYPTOGRAPHIQUE
        // Protège l'application contre les fausses requêtes
        const isAuthentic = verifyWebhookSignature({
            signatureHeader,
            rawBody
        });

        if (!isAuthentic) {
            console.error("⛔ Signature Webhook Wave INVALIDE. Rejet immédiat.");
            return res.status(401).json({ error: 'Signature Wave non authentique ou expirée.' });
        }

        let event = null;
        try {
            event = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(rawBody);
        } catch (e) {
            return res.status(400).json({ error: 'Corps JSON invalide.' });
        }

        console.log("🔔 Événement Webhook Wave reçu:", event?.type, "ID:", event?.id);

        // Seul l'événement checkout.session.completed nous intéresse pour valider le ticket
        if (event.type !== 'checkout.session.completed') {
            return res.status(200).json({ received: true, note: `Événement ${event.type} ignoré sans erreur.` });
        }

        const sessionData = event.data || {};
        const clientReference = sessionData.client_reference;
        const waveTransactionId = sessionData.transaction_id || sessionData.id || `T_WV_${Date.now()}`;
        const paidAmount = String(sessionData.amount || '').trim();
        const currency = String(sessionData.currency || '').trim().toUpperCase();

        if (!clientReference) {
            console.warn("⚠️ Webhook Wave sans client_reference:", sessionData);
            return res.status(200).json({ received: true, warning: 'Aucune client_reference présente.' });
        }

        // 2. RÉCUPÉRATION DE LA TRANSACTION EN BASE
        const transaction = await getTransactionByRef(clientReference);
        if (!transaction) {
            console.warn(`⚠️ Transaction non trouvée pour la référence: ${clientReference}`);
            return res.status(200).json({ received: true, warning: 'Transaction introuvable.' });
        }

        // 3. PROTECTION CONTRE LES DOUBLES NOTIFICATIONS (IDEMPOTENCE - CAS 4 DU CAHIER DES CHARGES)
        // "Notification reçue plusieurs fois : Une seule validation doit être effectuée. Aucun double enregistrement."
        if (transaction.status === 'Payé') {
            console.log(`ℹ️ Transaction ${clientReference} DÉJÀ confirmée. Idempotence appliquée.`);
            return res.status(200).json({ received: true, already_processed: true });
        }

        // 4. VÉRIFICATION DU MONTANT STRICT DE 10 000 FCFA (CAS 5 DU CAHIER DES CHARGES)
        // "Montant incorrect : Rejet de la validation automatique. Enregistrement de l'anomalie. Alerte à l'administrateur."
        if (paidAmount !== FIXED_TICKET_AMOUNT || (currency && currency !== FIXED_CURRENCY)) {
            console.error(`🚨 ANOMALIE MONTANT ! Attendu: ${FIXED_TICKET_AMOUNT} ${FIXED_CURRENCY}, Reçu: ${paidAmount} ${currency}`);
            transaction.status = 'À vérifier';
            transaction.waveTransactionId = waveTransactionId;
            transaction.anomalyNote = `Montant reçu non conforme : ${paidAmount} ${currency} au lieu de ${FIXED_TICKET_AMOUNT} ${FIXED_CURRENCY}`;
            transaction.history.push({
                status: 'À vérifier',
                timestamp: new Date().toISOString(),
                note: `Alerte: Montant incorrect détecté (${paidAmount} ${currency}). Validation suspendue.`
            });
            await saveTransaction(transaction);
            return res.status(200).json({ received: true, anomaly: true });
        }

        // 5. VALIDATION DU PAIEMENT (CAS 1 DU CAHIER DES CHARGES)
        const confirmedAt = new Date().toISOString();
        transaction.status = 'Payé';
        transaction.waveTransactionId = waveTransactionId;
        transaction.confirmedAt = confirmedAt;
        
        // Attribution du numéro de billet officiel si non déjà fait
        if (!transaction.ticketId) {
            const seq = Math.floor(1 + Math.random() * 200);
            transaction.ticketId = `MYT-${String(seq).padStart(4, '0')}`;
        }

        transaction.history.push({
            status: 'Payé',
            timestamp: confirmedAt,
            note: `Paiement Wave de 10 000 FCFA confirmé avec succès (ID Wave: ${waveTransactionId}).`
        });

        await saveTransaction(transaction);
        console.log(`✅ PAIEMENT CONFIRMÉ pour ${transaction.customer?.nom} ${transaction.customer?.prenom} (${clientReference}) -> Ticket ${transaction.ticketId}`);

        return res.status(200).json({
            received: true,
            status: 'Payé',
            client_reference: clientReference,
            ticket_id: transaction.ticketId
        });
    } catch (err) {
        console.error("Erreur api/wave-webhook:", err);
        return res.status(500).json({ error: err.message });
    }
};
