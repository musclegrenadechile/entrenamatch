# publish-play.ps1
# Launcher to run publish-play.bat reliably from PowerShell (sets env and forces cmd.exe)
param(
    [string]$Track = "closed"
)

$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:ANDROID_HOME = "C:\Android"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:PATH"

Write-Host "Launching publish-play.bat $Track via cmd.exe (clean batch execution)..."
cmd /c "cd /d $PSScriptRoot && .\publish-play.bat $Track"
$exit = $LASTEXITCODE
if ($exit -ne 0) {
  Write-Host "Publish failed with exit code $exit" -ForegroundColor Red
  exit $exit
}
Write-Host "Publish launcher completed successfully." -ForegroundColor Green
