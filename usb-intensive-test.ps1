# EntrenaMatch — intensive USB smoke / navigation test (v0.1.320)
$ErrorActionPreference = "Continue"
$adb = "C:\Android\platform-tools\adb.exe"
$pkg = "com.entrenamatch.app"
$activity = "$pkg/.MainActivity"
$apk = Join-Path $PSScriptRoot "EntrenaMatch-debug.apk"
$report = Join-Path $PSScriptRoot "usb-intensive-report.txt"
$logRaw = Join-Path $PSScriptRoot "usb-intensive-logcat.txt"

function Write-Report([string]$line) {
    $ts = Get-Date -Format "HH:mm:ss"
    $msg = "[$ts] $line"
    Add-Content -Path $report -Value $msg -Encoding utf8
    Write-Host $msg
}

function Get-ForegroundPkg {
    $out = & $adb shell dumpsys activity activities 2>$null | Select-String 'mResumedActivity' | Select-Object -First 1
    if ($out -match 'com\.entrenamatch\.app') { return 'com.entrenamatch.app' }
    if ($out -match '([\w\.]+)/') { return $Matches[1] }
    return 'unknown'
}

function Tap([int]$x, [int]$y, [string]$label) {
    $fg = Get-ForegroundPkg
    if ($fg -ne 'com.entrenamatch.app') {
        & $adb shell input keyevent KEYCODE_WAKEUP | Out-Null
        & $adb shell am start -n $activity | Out-Null
        Start-Sleep -Seconds 2
        Write-Report "WARN: foreground was $fg - relaunched app before tap $label"
    }
    & $adb shell input tap $x $y | Out-Null
    Write-Report "TAP $label ($x,$y)"
    Start-Sleep -Milliseconds 1400
}

function Get-ScreenSize {
    $out = & $adb shell wm size 2>$null
    if ($out -match '(\d+)x(\d+)') {
        return @{ W = [int]$Matches[1]; H = [int]$Matches[2] }
    }
    return @{ W = 1080; H = 2400 }
}

function Dump-Ui([string]$outFile) {
    & $adb shell uiautomator dump /sdcard/entrenamatch-ui.xml 2>$null | Out-Null
    & $adb pull /sdcard/entrenamatch-ui.xml $outFile 2>$null | Out-Null
}

function Find-TapByText([string]$xmlPath, [string]$pattern) {
    if (-not (Test-Path $xmlPath)) { return $null }
    $xml = Get-Content $xmlPath -Raw -Encoding utf8
    $re = [regex]::new(
        '<node[^>]*text="[^"]*' + [regex]::Escape($pattern) + '[^"]*"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"',
        'IgnoreCase'
    )
    $m = $re.Match($xml)
    if (-not $m.Success) { return $null }
    $cx = [int](([int]$m.Groups[1].Value + [int]$m.Groups[3].Value) / 2)
    $cy = [int](([int]$m.Groups[2].Value + [int]$m.Groups[4].Value) / 2)
    return @{ X = $cx; Y = $cy }
}

function Analyze-Logcat([string]$path) {
    if (-not (Test-Path $path)) { return @{} }
    $lines = Get-Content $path -Encoding utf8
    return @{
        Fatal = ($lines | Select-String -Pattern 'FATAL EXCEPTION|AndroidRuntime.*FATAL' -CaseSensitive:$false).Count
        Errors = ($lines | Select-String -Pattern 'Capacitor/Console.*\bE\b|Capacitor/Console.*Error|Uncaught' -CaseSensitive:$false).Count
        TriggerEvent = ($lines | Select-String -Pattern 'triggerEvent').Count
        GymPulseRadar = ($lines | Select-String -Pattern 'GymPulseRadar').Count
        PushPrompt = ($lines | Select-String -Pattern 'receive.*prompt|Push permission not yet').Count
        FirestoreErr = ($lines | Select-String -Pattern 'Firestore.*error|PERMISSION_DENIED' -CaseSensitive:$false).Count
        MaxDepth = ($lines | Select-String -Pattern 'Maximum update depth').Count
        AppDied = ($lines | Select-String -Pattern 'Process com\.entrenamatch\.app.*has died|FATAL EXCEPTION.*com\.entrenamatch' -CaseSensitive:$false).Count
        AuthTimeout = ($lines | Select-String -Pattern '\[Auth\] Boot timeout').Count
        GoogleAuthFail = ($lines | Select-String -Pattern 'Google redirect sign-in failed|GoogleAuthError').Count
        HomeTabReload = ($lines | Select-String -Pattern 'HomeTab-.*\.js').Count
    }
}

# --- start ---
Remove-Item $report, $logRaw -ErrorAction SilentlyContinue
Write-Report "=== EntrenaMatch intensive USB test ==="

if (-not (Test-Path $apk)) {
    Write-Report "FAIL: APK not found at $apk - run usb-test-device.bat first"
    exit 1
}

$devices = & $adb devices | Select-String 'device$' | Where-Object { $_ -notmatch 'List' }
if (-not $devices) {
    Write-Report "FAIL: No USB device"
    exit 2
}
Write-Report "Device: $($devices.Line.Trim())"

Write-Report "Installing APK..."
$install = & $adb install -r $apk 2>&1 | Out-String
Write-Report $install.Trim()
if ($install -notmatch 'Success') {
    Write-Report "Install failed - aborting"
    exit 3
}

& $adb shell svc power stayon usb | Out-Null
& $adb shell input keyevent KEYCODE_WAKEUP | Out-Null
& $adb shell input keyevent 82 | Out-Null
& $adb logcat -c | Out-Null
Write-Report "Launching app (screen stay-on enabled)..."
& $adb shell am force-stop $pkg | Out-Null
Start-Sleep -Seconds 1
& $adb shell am start -n $activity | Out-Null

Write-Report "Boot wait 20s (auth + hydrate)..."
Start-Sleep -Seconds 20

$size = Get-ScreenSize
$w = $size.W
$h = $size.H
Write-Report "Screen: ${w}x${h}"

$navY = [int]($h * 0.965)
$cols = 6
$colW = [int]($w / $cols)
$navTabs = @(
    @{ Name = 'Hoy'; X = [int]($colW * 0.5) },
    @{ Name = 'Mapa'; X = [int]($colW * 1.5) },
    @{ Name = 'Explorar'; X = [int]($colW * 2.5) },
    @{ Name = 'Matches'; X = [int]($colW * 3.5) },
    @{ Name = 'Squads'; X = [int]($colW * 4.5) },
    @{ Name = 'Perfil'; X = [int]($colW * 5.5) }
)

$ui1 = Join-Path $PSScriptRoot "usb-ui-boot.xml"
Dump-Ui $ui1
if (Test-Path $ui1) {
    $loginBtn = Find-TapByText $ui1 'Google'
    $demoBtn = Find-TapByText $ui1 'prueba'
    if ($loginBtn) { Write-Report "Login screen detected (Google button)" }
    elseif ($demoBtn) { Write-Report "Login screen detected (demo)" }
    else { Write-Report "Likely authenticated (no login buttons in UI dump)" }
}

Write-Report "--- Tab cycle x2 ---"
foreach ($round in 1..2) {
    Write-Report "Round $round"
    foreach ($tab in $navTabs) {
        Tap $tab.X $navY $tab.Name
    }
}

Write-Report "--- Scroll stress on Hoy ---"
Tap $navTabs[0].X $navY 'Hoy'
for ($i = 0; $i -lt 4; $i++) {
    & $adb shell input swipe $([int]($w/2)) $([int]($h*0.7)) $([int]($w/2)) $([int]($h*0.35)) 280 | Out-Null
    Start-Sleep -Milliseconds 600
}
& $adb shell input swipe $([int]($w/2)) $([int]($h*0.35)) $([int]($w/2)) $([int]($h*0.7)) 280 | Out-Null
Start-Sleep -Seconds 1

Write-Report "--- Map soak 25s ---"
Tap $navTabs[1].X $navY 'Mapa'
Start-Sleep -Seconds 25

Write-Report "--- Explore soak 15s ---"
Tap $navTabs[2].X $navY 'Explorar'
Start-Sleep -Seconds 15

Write-Report "--- Profile soak 10s ---"
Tap $navTabs[5].X $navY 'Perfil'
Start-Sleep -Seconds 10

Write-Report "--- Back to Hoy ---"
Tap $navTabs[0].X $navY 'Hoy'
Start-Sleep -Seconds 8

$ui2 = Join-Path $PSScriptRoot "usb-ui-final.xml"
Dump-Ui $ui2

Write-Report "Dumping logcat..."
& $adb logcat -d -v time | Out-File $logRaw -Encoding utf8

$stats = Analyze-Logcat $logRaw
Write-Report "--- Log analysis ---"
foreach ($k in $stats.Keys) {
    Write-Report "$k : $($stats[$k])"
}

$pass = ($stats.Fatal -eq 0 -and $stats.MaxDepth -eq 0 -and $stats.AppDied -eq 0)
if ($stats.GymPulseRadar -gt 30) {
    Write-Report ("WARN: GymPulseRadar chunk requested {0} times - possible map remount loop" -f $stats.GymPulseRadar)
}
if ($stats.TriggerEvent -gt 0) {
    Write-Report ("WARN: Capacitor triggerEvent error at startup ({0} times)" -f $stats.TriggerEvent)
}
if ($stats.PushPrompt -gt 15) {
    Write-Report ("WARN: Push permission check repeated {0} times - possible App remounts" -f $stats.PushPrompt)
}

if ($pass) {
    Write-Report "RESULT: PASS (no fatal crashes / React max-depth)"
} else {
    Write-Report "RESULT: FAIL - see usb-intensive-logcat.txt"
}

Write-Report "Reports: $report , $logRaw"
exit $(if ($pass) { 0 } else { 4 })
