# Configura Mercado Pago (marketplace EntrenaMatch) en Firebase Cloud Functions.
# El dinero entra a la cuenta EntrenaMatch; la plataforma liquida al entrenador.
#
# Requisitos:
#   - firebase CLI logueado (firebase login)
#   - Access Token de producción APP_USR-... desde https://www.mercadopago.cl/developers
#
# Uso:
#   .\scripts\setup-mp-production.ps1 -AccessToken "APP_USR-..."
#   $env:MERCADOPAGO_ACCESS_TOKEN='APP_USR-...'; .\scripts\setup-mp-production.ps1

param(
  [string]$AccessToken = $env:MERCADOPAGO_ACCESS_TOKEN,
  [string]$WebhookSecret = $env:MERCADOPAGO_WEBHOOK_SECRET,
  [string]$Project = "entrenamatch"
)

$ErrorActionPreference = "Stop"

if (-not $AccessToken -or $AccessToken.Length -lt 12) {
  Write-Host ""
  Write-Host "ERROR: Falta MERCADOPAGO_ACCESS_TOKEN (producción APP_USR-...)." -ForegroundColor Red
  Write-Host ""
  Write-Host "  1. Entra a https://www.mercadopago.cl/developers/panel/app"
  Write-Host "  2. Tu aplicación EntrenaMatch -> Credenciales -> Access Token de producción"
  Write-Host "  3. Ejecuta:"
  Write-Host '     .\scripts\setup-mp-production.ps1 -AccessToken "APP_USR-..."'
  Write-Host ""
  exit 1
}

if (-not $AccessToken.StartsWith("APP_USR-") -and -not $AccessToken.StartsWith("TEST-")) {
  Write-Host "AVISO: El token no parece APP_USR- (prod) ni TEST- (sandbox)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== EntrenaMatch — Mercado Pago marketplace ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] Guardando secret MERCADOPAGO_ACCESS_TOKEN en Firebase..."
$AccessToken | firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN --project $Project --data-file -
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($WebhookSecret -and $WebhookSecret.Length -ge 16) {
  Write-Host "[2/5] Guardando secret MERCADOPAGO_WEBHOOK_SECRET..."
  $WebhookSecret | firebase functions:secrets:set MERCADOPAGO_WEBHOOK_SECRET --project $Project --data-file -
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Host "[2/5] AVISO: Sin WebhookSecret — configura la clave de firma en MP Developers." -ForegroundColor Yellow
}

Write-Host "[3/5] Desplegando functions de pago..."
firebase deploy --only `
  "functions:createTrainerMpCheckout,functions:mercadoPagoWebhook,functions:createMarketplaceMpCheckout,functions:checkMpHealth,functions:markTrainerPayoutStatus" `
  --project $Project
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$webhookUrl = "https://us-central1-$Project.cloudfunctions.net/mercadoPagoWebhook"

Write-Host ""
Write-Host "[4/5] Configura el webhook en Mercado Pago Developers:" -ForegroundColor Yellow
Write-Host "  URL: $webhookUrl"
Write-Host "  Eventos: payment (Pagos)"
Write-Host "  Modo: Producción (mismo token APP_USR-)"
Write-Host ""

Write-Host "[5/5] Verificación rápida del token contra API MP..."
try {
  $headers = @{ Authorization = "Bearer $AccessToken" }
  $me = Invoke-RestMethod -Uri "https://api.mercadopago.com/users/me" -Headers $headers -Method Get
  Write-Host "  Cuenta MP OK — id: $($me.id) nickname: $($me.nickname)" -ForegroundColor Green
} catch {
  Write-Host "  No se pudo verificar el token (revisa que sea válido)." -ForegroundColor Red
  Write-Host "  $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Listo. Flujo:" -ForegroundColor Green
Write-Host "  Cliente paga -> cuenta EntrenaMatch (checkout)"
Write-Host "  Webhook -> booking paid_card + payoutStatus pending"
Write-Host "  Admin Ops -> pestaña MP -> liquidar al entrenador"
Write-Host ""
Write-Host "QA: EntrenaCoach -> sesión completada -> Pagar con tarjeta (EntrenaMatch)"
Write-Host ""
