@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo EntrenaMatch - USB device test (v0.1.320)
echo ==========================================

set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
set "ANDROID_HOME=C:\Android"
set "ADB=%ANDROID_HOME%\platform-tools\adb.exe"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

cd /d "%~dp0"

echo.
echo [1/5] Version check...
call npm run version:check
if errorlevel 1 (
  echo ERROR: Version mismatch. Fix package.json / constants / build.gradle first.
  pause
  exit /b 1
)

echo.
echo [2/5] Build web + Capacitor sync (CAP_DEV=1 for USB WebView debug)...
set CAP_DEV=1
set CAPACITOR=1
call npm run build:web
if errorlevel 1 goto :fail
call npx cap sync android
if errorlevel 1 goto :fail

echo.
echo [3/5] Gradle assembleDebug...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 goto :fail
cd ..

set "APK=android\app\build\outputs\apk\debug\app-debug.apk"
if not exist "%APK%" (
  echo ERROR: APK not found at %APK%
  goto :fail
)

copy /y "%APK%" "EntrenaMatch-debug.apk" >nul
echo APK: %CD%\EntrenaMatch-debug.apk

echo.
echo [4/5] ADB devices...
"%ADB%" devices
"%ADB%" devices | findstr /i "device$" | findstr /v "List" >nul
if errorlevel 1 (
  echo.
  echo No Android device detected. On your phone:
  echo   - Enable Developer options + USB debugging
  echo   - Accept "Allow USB debugging" popup
  echo   - Use "File transfer" USB mode
  echo.
  echo APK is ready at EntrenaMatch-debug.apk — install manually when connected.
  pause
  exit /b 2
)

echo.
echo [5/5] Install + launch on device...
"%ADB%" install -r "%APK%"
if errorlevel 1 (
  echo.
  echo Install failed — often because Play Store build has a different signature.
  echo Uninstalling old com.entrenamatch.app and retrying...
  "%ADB%" uninstall com.entrenamatch.app
  "%ADB%" install "%APK%"
  if errorlevel 1 goto :fail
)

"%ADB%" shell am start -n com.entrenamatch.app/.MainActivity

echo.
echo ==========================================
echo OK — EntrenaMatch installed and launched.
echo.
echo Quick test checklist on phone:
echo   1. Login or Modo prueba
echo   2. ActivationGuide -^> tour 4 pasos
echo   3. Activar LIVE -^> mapa
echo   4. Explorar -^> swipe/match
echo   5. Perfil -^> toggle Live sin toast
echo.
echo Live logs (optional, new terminal):
echo   %ADB% logcat -v time ^| findstr /i "entrenamatch Firebase Capacitor AndroidRuntime chromium"
echo.
echo Chrome inspect WebView: chrome://inspect
echo ==========================================
pause
exit /b 0

:fail
echo.
echo BUILD/INSTALL FAILED — see errors above.
pause
exit /b 1
