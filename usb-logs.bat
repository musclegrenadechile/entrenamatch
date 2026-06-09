@echo off
setlocal
set "ADB=C:\Android\platform-tools\adb.exe"
echo EntrenaMatch live logs — Ctrl+C to stop
echo Device:
"%ADB%" devices
echo.
"%ADB%" logcat -v time | findstr /i "entrenamatch Firebase Capacitor AndroidRuntime chromium WebView FATAL com.entrenamatch.app"
