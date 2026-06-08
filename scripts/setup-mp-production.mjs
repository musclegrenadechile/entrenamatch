#!/usr/bin/env node
/**
 * EntrenaMatch — Mercado Pago marketplace (producción).
 * Uso: node scripts/setup-mp-production.mjs
 */
console.log(`
╔══════════════════════════════════════════════════════════╗
║  EntrenaMatch — Mercado Pago marketplace                 ║
╚══════════════════════════════════════════════════════════╝

Modelo: Cliente paga → cuenta EntrenaMatch → liquidación al PT

1. Obtén APP_USR-... en https://www.mercadopago.cl/developers

2. Windows (recomendado):
   .\\scripts\\setup-mp-production.ps1 -AccessToken "APP_USR-..."

   O manual:
   firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN --project entrenamatch
   firebase deploy --only functions:createTrainerMpCheckout,functions:mercadoPagoWebhook,functions:createMarketplaceMpCheckout,functions:checkMpHealth,functions:markTrainerPayoutStatus --project entrenamatch

3. Webhook en MP Developers → URL:
   https://us-central1-entrenamatch.cloudfunctions.net/mercadoPagoWebhook
   Eventos: payment

4. Admin Ops → MP (estado cuenta) → Liquidaciones (transferir al PT)

5. QA: EntrenaCoach → sesión completada → Pagar con tarjeta (EntrenaMatch)
`)
