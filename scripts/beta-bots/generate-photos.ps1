# Genera retratos realistas para beta bots con Grok Imagine (image_gen).
# Uso:
#   .\generate-photos.ps1
#   .\generate-photos.ps1 -From 1 -To 3
#   .\generate-photos.ps1 -Force

param(
  [int]$From = 1,
  [int]$To = 15,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Repo = (Resolve-Path (Join-Path $Root '..\..')).Path
$PhotosDir = Join-Path $Root 'photos'
$PersonasPath = Join-Path $Root 'personas.json'

if (-not (Test-Path $PersonasPath)) {
  Write-Error "No se encontro personas.json en $Root"
}

New-Item -ItemType Directory -Force -Path $PhotosDir | Out-Null
$data = Get-Content $PersonasPath -Raw | ConvertFrom-Json
$bots = @($data.bots)

Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' EntrenaMatch - Beta bot photos (Grok)' -ForegroundColor Cyan
Write-Host " Rango: $From .. $To | Force: $Force" -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan

$idx = 0
foreach ($bot in $bots) {
  $idx++
  if ($idx -lt $From -or $idx -gt $To) { continue }

  $uid = $bot.uid
  $outRel = "scripts/beta-bots/photos/${uid}_primary.png"
  $outAbs = Join-Path $Repo $outRel

  if ((Test-Path $outAbs) -and -not $Force) {
    Write-Host "[skip] $uid - ya existe" -ForegroundColor DarkGray
    continue
  }

  Write-Host ''
  Write-Host "[$idx/$To] Generando $uid ($($bot.name))..." -ForegroundColor Yellow

  $prompt = "Generate one photorealistic fitness app profile portrait using image_gen. Subject (fictional invented person, not a celebrity): $($bot.photoPrompt) Save the image file to $outRel in the workspace (PNG). Confirm the exact saved path and file size."

  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  grok -p $prompt --always-approve --fs-write --cwd $Repo --output-format plain 2>&1 | ForEach-Object { Write-Host $_ }
  $sw.Stop()

  if (Test-Path $outAbs) {
    $size = (Get-Item $outAbs).Length
    $secs = $sw.Elapsed.TotalSeconds.ToString('0')
    Write-Host "[ok] $uid - $size bytes - ${secs}s" -ForegroundColor Green
  } else {
    Write-Host "[fail] $uid - no se creo $outAbs" -ForegroundColor Red
  }

  Start-Sleep -Seconds 3
}

Write-Host ''
Write-Host 'Listo. Revisa scripts/beta-bots/photos/' -ForegroundColor Cyan
Write-Host 'Siguiente: node scripts/beta-bots/seed-bots.mjs --skip-auth' -ForegroundColor Cyan
