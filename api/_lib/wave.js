// ==============================================================================
// api/_lib/wave.js
// Passerelle Officielle Wave Mobile Money (Wave Checkout API)
// Documentation : https://docs.wave.com/
// ==============================================================================

const crypto = require('crypto');
const https = require('https');

// Configuration
const WAVE_API_BASE = 'https://api.wave.com/v1';

// Strict business constants
const FIXED_TICKET_AMOUNT = '10000';
const FIXED_CURRENCY = 'XOF';

// Lien Officiel Wave Mobile Money de déduction directe (Marchand Pitchou maillots - 10 000 FCFA)
const OFFICIAL_WAVE_PAYMENT_URL = 'https://pay.wave.com/m/M_ci_5Ak1intPKX_j/c/ci/?amount=10000';
const OFFICIAL_WAVE_MERCHANT_NAME = 'Pitchou maillots';
const OFFICIAL_WAVE_MERCHANT_ID = 'M_ci_5Ak1intPKX_j';

/**
 * Récupère les clés Wave depuis les variables d'environnement
 */
function getWaveConfig() {
    const apiKey = process.env.WAVE_API_KEY || process.env.WAVE_SECRET_KEY || '';
    const webhookSecret = process.env.WAVE_WEBHOOK_SECRET || '';
    const env = process.env.WAVE_ENV || (apiKey.startsWith('wave_ci_prod_') ? 'production' : 'test');
    const paymentUrl = process.env.WAVE_PAYMENT_URL || OFFICIAL_WAVE_PAYMENT_URL;

    return {
        apiKey,
        webhookSecret,
        env,
        paymentUrl,
        merchantName: OFFICIAL_WAVE_MERCHANT_NAME,
        merchantId: OFFICIAL_WAVE_MERCHANT_ID,
        fixedAmount: FIXED_TICKET_AMOUNT,
        currency: FIXED_CURRENCY
    };
}

/**
 * Effectue un appel HTTP HTTPS sécurisé vers l'API Wave
 */
function waveRequest(endpoint, method = 'GET', data = null, apiKeyOverride = null) {
    const config = getWaveConfig();
    const apiKey = apiKeyOverride || config.apiKey;

    return new Promise((resolve, reject) => {
        const url = new URL(`${WAVE_API_BASE}${endpoint}`);
        const payload = data ? JSON.stringify(data) : null;

        const options = {
            hostname: url.hostname,
            port: 443,
            path: `${url.pathname}${url.search}`,
            method: method,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Projet-MyTicket/1.0 (Wave Integration)'
            }
        };

        if (payload) {
            options.headers['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(body);
                } catch (e) {
                    parsed = { raw: body };
                }

                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(parsed);
                } else {
                    const error = new Error(parsed?.message || `Wave API error HTTP ${res.statusCode}`);
                    error.statusCode = res.statusCode;
                    error.data = parsed;
                    reject(error);
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (payload) {
            req.write(payload);
        }
        req.end();
    });
}

/**
 * Crée une session de paiement Wave Checkout
 * RÈGLE STRICTE DU CAHIER DES CHARGES :
 * - Montant verrouillé à 10 000 FCFA
 * - Devise verrouillée à XOF
 * - Génération d'une référence unique
 */
async function createCheckoutSession({ clientReference, successUrl, errorUrl, customerInfo = {} }) {
    const config = getWaveConfig();

    // Validation stricte de la référence
    if (!clientReference) {
        throw new Error("client_reference obligatoire pour initier le paiement Wave.");
    }

    // Si les clés API Wave Checkout sont configurées, on appelle l'API Wave
    if (config.apiKey && !config.apiKey.startsWith('demo_')) {
        const payload = {
            amount: FIXED_TICKET_AMOUNT, // STRICTEMENT 10000 FCFA côté serveur
            currency: FIXED_CURRENCY,   // STRICTEMENT XOF
            client_reference: clientReference,
            success_url: successUrl,
            error_url: errorUrl
        };

        const response = await waveRequest('/checkout/sessions', 'POST', payload);
        return {
            id: response.id,
            wave_launch_url: response.wave_launch_url,
            checkout_status: response.checkout_status || 'open',
            amount: FIXED_TICKET_AMOUNT,
            currency: FIXED_CURRENCY,
            client_reference: clientReference,
            when_created: response.when_created || new Date().toISOString(),
            is_mock: false,
            merchant_name: config.merchantName,
            merchant_id: config.merchantId
        };
    }

    // Intégration du Lien Officiel Wave Mobile Money de déduction directe
    // Marchand officiel : Pitchou maillots (10 000 FCFA)
    // Ouvre directement l'application Wave de l'utilisateur pour déduire 10 000 FCFA
    const sessionId = `wave_pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
        id: sessionId,
        wave_launch_url: config.paymentUrl,
        checkout_status: 'open',
        amount: FIXED_TICKET_AMOUNT,
        currency: FIXED_CURRENCY,
        client_reference: clientReference,
        when_created: new Date().toISOString(),
        is_mock: false,
        merchant_name: config.merchantName,
        merchant_id: config.merchantId
    };
}

/**
 * Récupère le statut d'une session auprès de Wave
 */
async function getCheckoutSession(sessionId) {
    const config = getWaveConfig();

    if (config.apiKey && !sessionId.startsWith('cos_mock_')) {
        return await waveRequest(`/checkout/sessions/${sessionId}`, 'GET');
    }

    // Mock response pour sessions de test
    return {
        id: sessionId,
        amount: FIXED_TICKET_AMOUNT,
        currency: FIXED_CURRENCY,
        checkout_status: 'complete',
        payment_status: 'successful',
        transaction_id: `T_MOCK_${Date.now()}`,
        client_reference: 'MYT-TX-MOCK'
    };
}

/**
 * Vérifie la signature cryptographique du Webhook Wave
 * Header Wave-Signature officiel : "t=TIMESTAMP,v1=SIGNATURE"
 */
function verifyWebhookSignature({ signatureHeader, rawBody }) {
    const config = getWaveConfig();

    // Si aucune clé secrète n'est configurée et qu'on est en dev/sandbox
    if (!config.webhookSecret) {
        console.warn("⚠️ WAVE_WEBHOOK_SECRET non configuré. Validation sans signature en environnement dev/test.");
        return true;
    }

    if (!signatureHeader) {
        return false;
    }

    try {
        // Extraction du timestamp t et de la signature v1
        const parts = signatureHeader.split(',');
        let timestamp = '';
        let signature = '';

        for (const part of parts) {
            const [key, val] = part.trim().split('=');
            if (key === 't') timestamp = val;
            if (key === 'v1') signature = val;
        }

        if (!timestamp || !signature) {
            return false;
        }

        // Calcul de la signature HMAC-SHA256 attendue : hmac(secret, timestamp + '.' + rawBody)
        const payloadToSign = `${timestamp}.${rawBody}`;
        const hmac = crypto.createHmac('sha256', config.webhookSecret);
        hmac.update(payloadToSign, 'utf8');
        const expectedSignature = hmac.digest('hex');

        // Comparaison sécurisée contre les attaques de timing (timing-safe equal)
        const sigBuf = Buffer.from(signature, 'hex');
        const expectedBuf = Buffer.from(expectedSignature, 'hex');

        if (sigBuf.length !== expectedBuf.length) {
            return false;
        }

        return crypto.timingSafeEqual(sigBuf, expectedBuf);
    } catch (e) {
        console.error("Erreur vérification signature Webhook Wave:", e.message);
        return false;
    }
}

module.exports = {
    FIXED_TICKET_AMOUNT,
    FIXED_CURRENCY,
    getWaveConfig,
    createCheckoutSession,
    getCheckoutSession,
    verifyWebhookSignature
};
