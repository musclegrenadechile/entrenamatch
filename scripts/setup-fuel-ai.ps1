# Configura Fuel AI (Gemini) en Firebase Cloud Functions para EntrenaMatch.
# Requiere: firebase CLI logueado + API key de Google AI Studio (https://aistudio.google.com/apikey)
#
# Uso:
#   .\scripts\setup-fuel-ai.ps1 -ApiKey "AIza..."
#   .\scripts\setup-fuel-ai.ps1   # lee GEMINI_API_KEY del entorno

param(
  [string]$ApiKey = $env:GEMINI_API_KEY
)

if (-not $ApiKey) {
  Write-Host "ERROR: Falta GEMINI_API_KEY." -ForegroundColor Red
  Write-Host "  Opción A: `$env:GEMINI_API_KEY='tu-key'; .\scripts\setup-fuel-ai.ps1"
  Write-Host "  Opción B: .\scripts\setup-fuel-ai.ps1 -ApiKey 'tu-key'"
  exit 1
}

Write-Host "Configurando secret GEMINI_API_KEY..."
$ApiKey | firebase functions:secrets:set GEMINI_API_KEY --data-file -
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Desplegando analyzeFood + reglas storage fuel/..."
firebase deploy --only functions:analyzeFood,storage
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Desplegando índice fuelLogs (si falta)..."
firebase deploy --only firestore:indexes

Write-Host "Fuel AI listo. Prueba en app: Hoy -> Fuel -> Registrar comida -> Analizar foto/texto." -ForegroundColor Green
