#!/usr/bin/env node
/**
 * Fase 11 — guía + verificación Mercado Pago producción.
 * Uso: node scripts/setup-mp-production.mjs
 */
console.log(`
╔══════════════════════════════════════════════════════════╗
║  EntrenaMatch — Mercado Pago producción (Fase 11)        ║
╚══════════════════════════════════════════════════════════╝

1. Obtén APP_USR-... desde https://www.mercadopago.cl/developers

2. Configura el secret (recomendado):
   firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN --project entrenamatch

   O legacy:
   firebase functions:config:set mercadopago.access_token="APP_USR-..."

3. Webhook en MP Developers → URL:
   https://us-central1-entrenamatch.cloudfunctions.net/mercadoPagoWebhook
   Eventos: payment

4. Deploy functions:
   firebase deploy --only functions --project entrenamatch

5. QA manual:
   - EntrenaCoach → sesión completada → Pagar con MP
   - Tienda → checkout → webhook marca paid
   - Admin Ops → pestaña MP / Revenue

6. Admin callable checkMpHealth (v0.1.160+):
   Desde app admin o Firebase Console → Functions → checkMpHealth
`)
