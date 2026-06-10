@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo EntrenaMatch - PLAY STORE RELEASE (v0.1.324)
echo ==========================================

set "MODE=%~1"
set "TRACK=%~2"
if "%MODE%"=="" set MODE=build
if "%TRACK%"=="" set TRACK=internal

set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
set "ANDROID_HOME=C:\Android"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

cd /d "%~dp0"

if not exist "android\keystore.properties" (
  echo [ERROR] android\keystore.properties not found.
  echo Copy android\keystore.properties.example and configure release keystore.
  pause
  exit /b 1
)

if not exist "android\app\google-services.json" (
  echo [WARN] android\app\google-services.json missing — Firebase native may fail.
)

echo.
echo [1/4] Version alignment check...
call npm run version:check
if errorlevel 1 (
  echo Fix version mismatch before Play upload.
  pause
  exit /b 1
)

echo.
echo [2/4] Production web build + Capacitor sync (no CAP_DEV)...
set CAP_DEV=
set CAPACITOR=1
call npm run build:web
if errorlevel 1 goto :fail
call npx cap sync android
if errorlevel 1 goto :fail

echo.
echo [3/4] Signed release AAB (bundleRelease)...
cd android
call gradlew.bat bundleRelease
if errorlevel 1 goto :fail
cd ..

set "AAB=android\app\build\outputs\bundle\release\app-release.aab"
if not exist "%AAB%" (
  echo [ERROR] AAB not found at %AAB%
  goto :fail
)

copy /y "%AAB%" "EntrenaMatch-release.aab" >nul
for %%A in ("%AAB%") do set "AAB_SIZE=%%~zA"
echo.
echo ************************************************
echo SUCCESS — Signed AAB ready for Play Store
echo   File: %CD%\EntrenaMatch-release.aab
echo   Also: %CD%\%AAB%
echo   Size: !AAB_SIZE! bytes
echo   versionCode 324 / versionName 0.1.324
echo.
echo Manual upload: Play Console ^> Testing ^> Create release
echo Release notes: PLAY_INTERNAL_v0.1.324.md
echo ************************************************

if /i "%MODE%"=="publish" (
  if not exist "android\play-service-account.json" (
    echo [ERROR] play-service-account.json missing for auto-publish.
    pause
    exit /b 1
  )
  echo.
  echo [4/4] Publishing to Play track %TRACK%...
  cd android
  call gradlew.bat publishBundle "-Pplay.track=%TRACK%" --stacktrace
  set "PUB_ERR=!ERRORLEVEL!"
  cd ..
  if not "!PUB_ERR!"=="0" goto :fail
  echo Published to track %TRACK%. Review in Play Console.
) else (
  echo.
  echo To auto-upload: build-play-store.bat publish internal
)

pause
exit /b 0

:fail
echo.
echo RELEASE BUILD FAILED — see errors above.
pause
exit /b 1
