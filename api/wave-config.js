// ==============================================================================
// api/wave-config.js
// Endpoint d'état et de paramétrage de la passerelle Wave (Section 9)
// ==============================================================================

const { getWaveConfig, FIXED_TICKET_AMOUNT, FIXED_CURRENCY } = require('./_lib/wave');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const config = getWaveConfig();
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'projet-myticket.vercel.app';
        const webhookUrl = `${protocol}://${host}/api/wave-webhook`;

        // Masquage sécurisé des clés (ne jamais renvoyer les clés brutes au navigateur)
        const hasApiKey = !!config.apiKey;
        const apiKeyMasked = hasApiKey ? `${config.apiKey.substring(0, 12)}...${config.apiKey.substring(config.apiKey.length - 4)}` : 'Non configurée';
        const hasWebhookSecret = !!config.webhookSecret;

        return res.status(200).json({
            ok: true,
            gateway: 'Wave Mobile Money',
            enabled: true,
            environment: config.env,
            payment_url: config.paymentUrl,
            merchant_name: config.merchantName,
            merchant_id: config.merchantId,
            webhook_url: webhookUrl,
            fixed_amount: parseInt(FIXED_TICKET_AMOUNT, 10),
            currency: FIXED_CURRENCY,
            api_key_status: {
                configured: hasApiKey,
                preview: apiKeyMasked
            },
            webhook_secret_status: {
                configured: hasWebhookSecret
            },
            server_enforcement_active: true
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
