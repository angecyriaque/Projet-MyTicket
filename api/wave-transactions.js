// ==============================================================================
// api/wave-transactions.js
// Endpoint de consultation, filtrage et exportation des transactions Wave (Admin)
// ==============================================================================

const { listTransactions, getTransactionStats } = require('./_lib/db');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée. Utilisez GET.' });
    }

    try {
        const { status = 'ALL', search = '', limit = 100, format = 'json' } = req.query;

        const transactions = await listTransactions({
            status,
            search,
            limit: parseInt(limit, 10) || 100
        });

        const stats = await getTransactionStats();

        // Exportation au format CSV (Section 5 du Cahier des Charges)
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="transactions_wave_myticket.csv"');

            let csv = '\uFEFF'; // BOM UTF-8 pour Excel
            csv += 'Reference_Interne;ID_Transaction_Wave;Nom;Prenom;Contact;Eglise;Montant_FCFA;Moyen_Paiement;Statut;Date_Initiation;Date_Confirmation;Billet_Assigne\r\n';

            transactions.forEach(t => {
                const ref = t.clientReference || '';
                const waveId = t.waveTransactionId || '--';
                const nom = t.customer?.nom || '';
                const prenom = t.customer?.prenom || '';
                const contact = t.customer?.contact1 || '';
                const eglise = t.customer?.eglise || '';
                const montant = t.amount || 10000;
                const moyen = t.paymentMethod || 'Wave';
                const statut = t.status || 'En attente';
                const dateInit = t.createdAt || '';
                const dateConf = t.confirmedAt || '--';
                const ticket = t.ticketId || '--';

                csv += `"${ref}";"${waveId}";"${nom}";"${prenom}";"${contact}";"${eglise}";${montant};"${moyen}";"${statut}";"${dateInit}";"${dateConf}";"${ticket}"\r\n`;
            });

            return res.status(200).send(csv);
        }

        // Format JSON standard avec KPIs
        return res.status(200).json({
            ok: true,
            stats: stats,
            count: transactions.length,
            transactions: transactions
        });
    } catch (err) {
        console.error("Erreur api/wave-transactions:", err);
        return res.status(500).json({ error: err.message });
    }
};
