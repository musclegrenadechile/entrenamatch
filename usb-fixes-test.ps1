# EntrenaMatch — USB verification for share/mic/profile/cuenta fixes
$ErrorActionPreference = "Continue"
$adb = "C:\Android\platform-tools\adb.exe"
$pkg = "com.entrenamatch.app"
$activity = "$pkg/.MainActivity"
$apk = Join-Path $PSScriptRoot "EntrenaMatch-debug.apk"
$report = Join-Path $PSScriptRoot "usb-fixes-report.txt"

function Write-Report([string]$line) {
    $ts = Get-Date -Format "HH:mm:ss"
    $msg = "[$ts] $line"
    Add-Content -Path $report -Value $msg -Encoding utf8
    Write-Host $msg
}

function Get-ScreenSize {
    $out = & $adb shell wm size 2>$null
    if ($out -match '(\d+)x(\d+)') {
        return @{ W = [int]$Matches[1]; H = [int]$Matches[2] }
    }
    return @{ W = 1080; H = 2400 }
}

function Tap([int]$x, [int]$y, [string]$label) {
    & $adb shell input tap $x $y | Out-Null
    Write-Report "TAP $label ($x,$y)"
    Start-Sleep -Milliseconds 1500
}

function Dump-Ui([string]$outFile) {
    & $adb shell uiautomator dump /sdcard/entrenamatch-fixes.xml 2>$null | Out-Null
    & $adb pull /sdcard/entrenamatch-fixes.xml $outFile 2>$null | Out-Null
    return (Test-Path $outFile)
}

function Ui-Contains([string]$xmlPath, [string]$pattern) {
    if (-not (Test-Path $xmlPath)) { return $false }
    return (Select-String -Path $xmlPath -Pattern $pattern -Quiet)
}

function Find-TapByText([string]$xmlPath, [string]$pattern) {
    if (-not (Test-Path $xmlPath)) { return $null }
    $xml = Get-Content $xmlPath -Raw -Encoding utf8
    $re = [regex]::new(
        '<node[^>]*(?:text|content-desc)="[^"]*' + [regex]::Escape($pattern) + '[^"]*"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"',
        'IgnoreCase'
    )
    $m = $re.Match($xml)
    if (-not $m.Success) { return $null }
    return @{
        X = [int](([int]$m.Groups[1].Value + [int]$m.Groups[3].Value) / 2)
        Y = [int](([int]$m.Groups[2].Value + [int]$m.Groups[4].Value) / 2)
    }
}

Remove-Item $report -ErrorAction SilentlyContinue
Write-Report "=== USB fixes verification ==="

if (-not (Test-Path $apk)) {
    Write-Report "FAIL: Run usb-test-device.bat first (APK missing)"
    exit 1
}

$devices = & $adb devices | Select-String 'device$' | Where-Object { $_ -notmatch 'List' }
if (-not $devices) {
    Write-Report "FAIL: No USB device"
    exit 2
}
Write-Report "Device: $($devices.Line.Trim())"

$install = & $adb install -r $apk 2>&1 | Out-String
Write-Report $install.Trim()
if ($install -notmatch 'Success') { exit 3 }

& $adb shell am force-stop $pkg | Out-Null
& $adb logcat -c | Out-Null
& $adb shell am start -n $activity | Out-Null
Write-Report "Boot wait 18s..."
Start-Sleep -Seconds 18

$size = Get-ScreenSize
$w = $size.W
$h = $size.H
$navY = [int]($h * 0.965)
$colW = [int]($w / 6)
$profileX = [int]($colW * 5.5)

# Mic permission declared in manifest
$permDump = & $adb shell dumpsys package $pkg 2>$null | Out-String
$hasRecordAudio = $permDump -match 'android\.permission\.RECORD_AUDIO'
Write-Report ("RECORD_AUDIO in manifest: " + $(if ($hasRecordAudio) { 'YES' } else { 'NO' }))

# --- Perfil / Cuenta: APK banner removed ---
Tap $profileX $navY 'Perfil'
$uiProfile = Join-Path $PSScriptRoot "usb-fixes-profile.xml"
Dump-Ui $uiProfile | Out-Null

$cuentaBtn = Find-TapByText $uiProfile 'Cuenta'
if ($cuentaBtn) {
    Tap $cuentaBtn.X $cuentaBtn.Y 'Cuenta section'
    $uiCuenta = Join-Path $PSScriptRoot "usb-fixes-cuenta.xml"
    Dump-Ui $uiCuenta | Out-Null
    $apkGone = -not (Ui-Contains $uiCuenta 'Descargar APK')
    $shareInvite = Ui-Contains $uiCuenta 'Compartir invitación'
    Write-Report ("APK download removed from Cuenta: " + $(if ($apkGone) { 'PASS' } else { 'FAIL' }))
    Write-Report ("Compartir invitación visible: " + $(if ($shareInvite) { 'PASS' } else { 'WARN (scroll?)' }))
} else {
    Write-Report "WARN: Cuenta tab not found - scrolling profile nav"
    & $adb shell input swipe $([int]($w*0.8)) $([int]($h*0.12)) $([int]($w*0.2)) $([int]($h*0.12)) 200 | Out-Null
    Start-Sleep -Seconds 1
    Dump-Ui $uiProfile | Out-Null
    $cuentaBtn2 = Find-TapByText $uiProfile 'Cuenta'
    if ($cuentaBtn2) {
        Tap $cuentaBtn2.X $cuentaBtn2.Y 'Cuenta section (retry)'
        $uiCuenta = Join-Path $PSScriptRoot "usb-fixes-cuenta.xml"
        Dump-Ui $uiCuenta | Out-Null
        $apkGone = -not (Ui-Contains $uiCuenta 'Descargar APK')
        Write-Report ("APK download removed: " + $(if ($apkGone) { 'PASS' } else { 'FAIL' }))
    }
}

# --- Construir mi red: opens muro composer ---
Tap $profileX $navY 'Perfil'
& $adb shell input swipe $([int]($w/2)) $([int]($h*0.55)) $([int]($w/2)) $([int]($h*0.25)) 350 | Out-Null
Start-Sleep -Seconds 1
$uiScroll = Join-Path $PSScriptRoot "usb-fixes-scroll.xml"
Dump-Ui $uiScroll | Out-Null
$redBtn = Find-TapByText $uiScroll 'CONSTRUIR MI RED'
if ($redBtn) {
    Tap $redBtn.X $redBtn.Y 'Construir mi red'
    $uiMuro = Join-Path $PSScriptRoot "usb-fixes-muro.xml"
    Dump-Ui $uiMuro | Out-Null
    $composer = Ui-Contains $uiMuro 'Motiva a la comunidad|Caption para la foto|280'
    Write-Report ("Muro composer visible after CTA: " + $(if ($composer) { 'PASS' } else { 'FAIL' }))
} else {
    Write-Report "WARN: CONSTRUIR MI RED button not in UI dump (profile may be complete)"
}

# --- Hoy: EntrenaPlan share buttons ---
$homeX = [int]($colW * 0.5)
Tap $homeX $navY 'Hoy'
for ($i = 0; $i -lt 3; $i++) {
    & $adb shell input swipe $([int]($w/2)) $([int]($h*0.65)) $([int]($w/2)) $([int]($h*0.35)) 300 | Out-Null
    Start-Sleep -Milliseconds 700
}
$uiHome = Join-Path $PSScriptRoot "usb-fixes-home.xml"
Dump-Ui $uiHome | Out-Null
$planShare = Ui-Contains $uiHome 'Compartir fuera'
$planMuro = Ui-Contains $uiHome 'Publicar en muro'
Write-Report ("EntrenaPlan Compartir fuera: " + $(if ($planShare) { 'PASS' } else { 'WARN (plan empty?)' }))
Write-Report ("EntrenaPlan Publicar en muro: " + $(if ($planMuro) { 'PASS' } else { 'WARN' }))

# --- Logcat scan ---
$logPath = Join-Path $PSScriptRoot "usb-fixes-logcat.txt"
& $adb logcat -d -v time | Out-File $logPath -Encoding utf8
$log = Get-Content $logPath -Raw -Encoding utf8
$fatal = ([regex]::Matches($log, 'FATAL EXCEPTION|AndroidRuntime.*FATAL', 'IgnoreCase')).Count
$micErr = ([regex]::Matches($log, 'Mic error|No se pudo acceder al micr', 'IgnoreCase')).Count
$maxDepth = ([regex]::Matches($log, 'Maximum update depth')).Count
Write-Report "Logcat FATAL: $fatal | Mic errors: $micErr | MaxDepth: $maxDepth"

$pass = $hasRecordAudio -and ($fatal -eq 0) -and ($maxDepth -eq 0)
if ($pass) {
    Write-Report "RESULT: PASS - see $report"
    exit 0
}
Write-Report "RESULT: PARTIAL/FAIL - see $report and $logPath"
exit 4
