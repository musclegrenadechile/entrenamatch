# Deploy Cloud Functions for real background FCM pushes to your Red de EntrenaSync

This enables **true push notifications (even when app is closed or backgrounded)** when someone in your training network (Red) goes live or starts an EntrenaSync.

## Steps (run once)

1. Make sure you have Firebase CLI:
   npm install -g firebase-tools

2. Login:
   firebase login

3. From project root:
   cd functions
   npm install

4. Deploy only functions:
   firebase deploy --only functions --project entrenamatch

   (Or without --project if default is set)

## What it does
- Listens to updates on /profiles/{userId}
- When trainingNow flips to true OR trainingSyncWith is set for a user who has syncBonds (your red)
- Looks up the FCM tokens of all bonded partners (from /userPushTokens/{partnerId})
- Sends high-priority FCM with title/body + data payload
- On receiver device: OS shows the notification (background). Tapping opens the app and the action listener deep-links to the live map + auto-offers the sync.

## Notes
- Tokens are saved by the client on registration (see App.tsx push 'registration' listener).
- The function uses admin SDK so it bypasses Firestore rules.
- If a token is invalid/stale, it is logged but the send continues for others.
- For production, you can add token cleanup on send failure (canonical ids etc).
- Test: toggle "Entrenando ahora" on one account that has a bond with another logged-in device (background or closed). You should get the push.

## If you want more events
You can extend the function to also listen on syncSessions or other collections.

After deploy, rebuild the AAB (the functions are server-side, client AAB is unchanged for this feature).

## EntrenaCoach Fase 2 (v0.1.144+) — Marketplace Mercado Pago

**Modelo:** el cliente paga a **EntrenaMatch** (cuenta plataforma). EntrenaMatch retiene 15% y liquida al entrenador desde Admin Ops.

```powershell
# Desde la raíz del repo (Windows)
.\scripts\setup-mp-production.ps1 -AccessToken "APP_USR-..."

# O manual:
firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN --project entrenamatch
firebase deploy --only functions:createTrainerMpCheckout,functions:mercadoPagoWebhook,functions:createMarketplaceMpCheckout,functions:checkMpHealth,functions:markTrainerPayoutStatus --project entrenamatch
```

**Webhook Mercado Pago** (Developers → Webhooks → evento `payment`):
```
https://us-central1-entrenamatch.cloudfunctions.net/mercadoPagoWebhook
```

Functions:
- `createTrainerMpCheckout` — checkout EntrenaCoach (cuenta EntrenaMatch)
- `mercadoPagoWebhook` — confirma `paid_card` + `payoutStatus: pending`
- `createMarketplaceMpCheckout` — checkout tienda
- `checkMpHealth` — admin: token + ping API MP
- `markTrainerPayoutStatus` — admin: liquidación al PT

Sin `MERCADOPAGO_ACCESS_TOKEN` los pagos con tarjeta no están disponibles (no hay pago directo al entrenador).

## EntrenaCoach Fase 3 + P0 engagement (v0.1.147+)

Functions added:
- `onTrainerDispatchCreated`, `respondToTrainerDispatch`, `advanceTrainerDispatch`
- `advanceExpiredDispatchesScheduled` — cron cada 1 min (ofertas expiradas)
- `onDirectMessageCreated` — push mensaje 1:1
- `onMatchCreated` — push nuevo match
- `onSessionGroupMessageCreated` / `onSquadGroupMessageCreated` — push chat grupal
- `createMarketplaceMpCheckout` — checkout tienda
- `onMarketplaceOrderUpdated` — push al comprador (paid/shipped/delivered/cancelled)
- `mercadoPagoWebhook` — confirma `paid_card` (bookings) y `paid` (marketplaceOrders)

Deploy:
```bash
firebase deploy --only functions,firestore:indexes,firestore:rules --project entrenamatch
```
