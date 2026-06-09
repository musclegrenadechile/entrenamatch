@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0usb-intensive-test.ps1"
set EXITCODE=%ERRORLEVEL%
echo.
echo Report: %~dp0usb-intensive-report.txt
echo Logcat: %~dp0usb-intensive-logcat.txt
exit /b %EXITCODE%
