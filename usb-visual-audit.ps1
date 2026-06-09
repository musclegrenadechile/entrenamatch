# EntrenaMatch - visual marketing audit capture (USB)
$ErrorActionPreference = "Continue"
$adb = "C:\Android\platform-tools\adb.exe"
$pkg = "com.entrenamatch.app"
$activity = "$pkg/.MainActivity"
$outDir = Join-Path $PSScriptRoot "usb-visual-audit"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function Tap([int]$x, [int]$y) {
    & $adb shell input tap $x $y | Out-Null
    Start-Sleep -Milliseconds 1600
}

function Swipe-Up {
    param([int]$w, [int]$h, [int]$times = 1)
    for ($i = 0; $i -lt $times; $i++) {
        & $adb shell input swipe $([int]($w/2)) $([int]($h*0.72)) $([int]($w/2)) $([int]($h*0.28)) 420 | Out-Null
        Start-Sleep -Milliseconds 900
    }
}

function Capture([string]$name, [int]$w, [int]$h) {
    $remote = "/sdcard/em-$name.png"
    $local = Join-Path $outDir "$name.png"
    & $adb shell screencap -p $remote | Out-Null
    & $adb pull $remote $local 2>$null | Out-Null
    Write-Host "CAPTURE $name -> $local"
}

$sizeOut = & $adb shell wm size 2>$null
if ($sizeOut -match '(\d+)x(\d+)') { $w = [int]$Matches[1]; $h = [int]$Matches[2] } else { $w = 1080; $h = 2400 }
$navY = [int]($h * 0.965)
$colW = [int]($w / 6)

& $adb shell am force-stop $pkg | Out-Null
Start-Sleep -Seconds 1
& $adb shell am start -n $activity | Out-Null
Write-Host "Boot 16s..."
Start-Sleep -Seconds 16

Capture "01-boot" $w $h

# Bottom nav tabs
$tabs = @(
    @{ Name = '02-hoy'; X = [int]($colW * 0.5) },
    @{ Name = '03-mapa'; X = [int]($colW * 1.5) },
    @{ Name = '04-explorar'; X = [int]($colW * 2.5) },
    @{ Name = '05-matches'; X = [int]($colW * 3.5) },
    @{ Name = '06-squads'; X = [int]($colW * 4.5) },
    @{ Name = '07-perfil-top'; X = [int]($colW * 5.5) }
)

foreach ($t in $tabs) {
    Tap $t.X $navY
    Capture $t.Name $w $h
}

# Hoy scroll (derby, plan, feed)
Tap $tabs[0].X $navY
Swipe-Up $w $h 3
Capture "08-hoy-scroll" $w $h
Swipe-Up $w $h 2
Capture "09-hoy-feed" $w $h

# Perfil sections
Tap $tabs[5].X $navY
Start-Sleep -Seconds 1
# tap Cuenta approx center-top nav pills
Tap ([int]($w * 0.78)) ([int]($h * 0.11))
Capture "10-perfil-cuenta" $w $h
Tap ([int]($w * 0.5)) ([int]($h * 0.11))
Capture "11-perfil-rendimiento" $w $h
Tap ([int]($w * 0.22)) ([int]($h * 0.11))
Capture "12-perfil-actividad" $w $h
Swipe-Up $w $h 4
Capture "13-perfil-muro" $w $h

# Mapa zoomed interaction
Tap $tabs[1].X $navY
Start-Sleep -Seconds 3
Capture "14-mapa-live" $w $h

Write-Host "DONE: $outDir"
