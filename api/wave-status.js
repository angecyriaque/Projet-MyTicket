// ==============================================================================
// api/wave-status.js
// Endpoint de vérification, synchronisation et confirmation du paiement Wave
// ==============================================================================

const { getCheckoutSession, FIXED_TICKET_AMOUNT, FIXED_CURRENCY } = require('./_lib/wave');
const { getTransactionByRef, getTransactionBySessionId, getTransactionByWaveTxId, saveTransaction } = require('./_lib/db');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Traitement de la confirmation par identifiant de reçu Wave (POST)
    if (req.method === 'POST') {
        try {
            const body = req.body || {};
            const { ref, waveTransactionId, customer, ticketId } = body;

            if (!waveTransactionId || !/^T_[A-Za-z0-9_-]{6,}$/i.test(String(waveTransactionId).trim())) {
                return res.status(400).json({
                    error: "L'identifiant de transaction Wave est invalide. Il doit impérativement commencer par 'T_' (ex: T_QM32635D7KIPMJGH)."
                });
            }

            const cleanWaveId = String(waveTransactionId).trim().toUpperCase();

            // RÈGLE ANTI-FRAUDE : Un même reçu Wave ne peut pas être utilisé pour deux billets distincts
            const existing = await getTransactionByWaveTxId(cleanWaveId);
            if (existing && existing.clientReference !== ref && existing.status === 'Payé') {
                return res.status(409).json({
                    error: `Ce reçu Wave (${cleanWaveId}) a déjà été validé pour émettre le billet #${existing.ticketId || 'existant'}. Chaque paiement de 10 000 FCFA ne peut servir qu'une seule fois.`
                });
            }

            // Récupération ou création de la transaction
            let transaction = ref ? await getTransactionByRef(ref) : null;
            if (!transaction) {
                transaction = {
                    id: ref || `MYT-WV-${Date.now()}`,
                    clientReference: ref || `MYT-WV-${Date.now()}`,
                    waveSessionId: null,
                    amount: 10000,
                    currency: FIXED_CURRENCY,
                    status: 'En attente',
                    paymentMethod: 'Wave',
                    merchant: 'Pitchou maillots',
                    merchantId: 'M_ci_5Ak1intPKX_j',
                    customer: customer || {},
                    createdAt: new Date().toISOString()
                };
            }

            transaction.status = 'Payé';
            transaction.waveTransactionId = cleanWaveId;
            transaction.confirmedAt = new Date().toISOString();
            transaction.ticketId = ticketId || transaction.ticketId;
            transaction.merchant = 'Pitchou maillots';
            transaction.merchantId = 'M_ci_5Ak1intPKX_j';
            transaction.amount = 10000;
            transaction.currency = FIXED_CURRENCY;
            transaction.history = transaction.history || [];
            transaction.history.push({
                status: 'Payé',
                timestamp: new Date().toISOString(),
                note: `Paiement Wave de 10 000 FCFA déduit et validé au marchand Pitchou maillots (Réf: ${cleanWaveId}).`
            });

            await saveTransaction(transaction);

            return res.status(200).json({
                ok: true,
                status: 'Payé',
                transaction: transaction,
                ticketId: transaction.ticketId
            });

        } catch (err) {
            console.error("Erreur POST wave-status:", err);
            return res.status(500).json({ error: "Erreur serveur lors de la validation du paiement Wave." });
        }
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée. Utilisez GET ou POST.' });
    }

    try {
        const ref = req.query.ref || req.query.client_reference;
        const sessionId = req.query.session_id || req.query.wave_session_id;

        if (!ref && !sessionId) {
            return res.status(400).json({ error: 'Référence de transaction ou identifiant de session manquant.' });
        }

        // 1. Recherche de la transaction en base
        let transaction = null;
        if (ref) transaction = await getTransactionByRef(ref);
        if (!transaction && sessionId) transaction = await getTransactionBySessionId(sessionId);

        if (!transaction) {
            return res.status(404).json({
                ok: false,
                status: 'Non trouvé',
                message: 'Transaction introuvable.'
            });
        }

        // 2. Si déjà payé, retour direct
        if (transaction.status === 'Payé') {
            return res.status(200).json({
                ok: true,
                status: 'Payé',
                transaction: transaction,
                ticketId: transaction.ticketId
            });
        }

        // 3. SYNCHRONISATION ACTIVE AUPRÈS DE WAVE (RÉSOLUTION DU CAS 6 DU CAHIER DES CHARGES)
        // Si la notification Webhook a été retardée ou manquée, interroger directement l'API Wave
        if (transaction.waveSessionId) {
            try {
                const waveSession = await getCheckoutSession(transaction.waveSessionId);
                
                if (waveSession && waveSession.checkout_status === 'complete') {
                    const paidAmount = String(waveSession.amount || '').trim();
                    const currency = String(waveSession.currency || '').trim().toUpperCase();

                    // Vérification stricte du montant de 10 000 FCFA
                    if (paidAmount === FIXED_TICKET_AMOUNT && (!currency || currency === FIXED_CURRENCY)) {
                        const confirmedAt = new Date().toISOString();
                        transaction.status = 'Payé';
                        transaction.waveTransactionId = waveSession.transaction_id || `T_WV_${Date.now()}`;
                        transaction.confirmedAt = confirmedAt;

                        if (!transaction.ticketId) {
                            const seq = Math.floor(1 + Math.random() * 200);
                            transaction.ticketId = `MYT-${String(seq).padStart(4, '0')}`;
                        }

                        transaction.history.push({
                            status: 'Payé',
                            timestamp: confirmedAt,
                            note: 'Statut synchronisé directement depuis l\'API Wave Checkout (Paiement 10 000 FCFA validé).'
                        });

                        await saveTransaction(transaction);
                        console.log(`✅ Rattrapage réussi pour ${transaction.clientReference} -> Ticket ${transaction.ticketId}`);
                    }
                } else if (waveSession && waveSession.checkout_status === 'expired') {
                    transaction.status = 'Expiré';
                    await saveTransaction(transaction);
                } else if (waveSession && waveSession.checkout_status === 'cancelled') {
                    transaction.status = 'Annulé';
                    await saveTransaction(transaction);
                }
            } catch (pollErr) {
                console.warn("Notice interrogation Wave API:", pollErr.message);
            }
        }

        return res.status(200).json({
            ok: true,
            status: transaction.status,
            transaction: transaction,
            ticketId: transaction.ticketId
        });
    } catch (err) {
        console.error("Erreur api/wave-status:", err);
        return res.status(500).json({ error: err.message });
    }
};
