@echo off
echo ==========================================
echo EntrenaMatch - Build Android APK (Debug)
echo ==========================================
echo.
echo Usando npm run android:apk (CAPACITOR=1 + cap sync + assembleDebug)
echo.
call npm run android:apk
if errorlevel 1 (
  echo ERROR: Build failed.
  pause
  exit /b 1
)
echo.
echo SUCCESS! APK: android\app\build\outputs\apk\debug\app-debug.apk
pause
