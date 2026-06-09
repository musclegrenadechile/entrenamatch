@echo off
setlocal enabledelayedexpansion

REM Run from cmd.exe:
REM   cd /d C:\Users\muscl\fitvina
REM   publish-play.bat closed

cd /d "%~dp0"

set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
set "ANDROID_HOME=C:\Android"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

echo ==========================================
echo EntrenaMatch - PUBLISH to Google Play
echo Track: alpha (closed) / internal beta
echo ==========================================

set "TRACK=%~1"
if "%TRACK%"=="" set "TRACK=alpha"
if /i "%TRACK%"=="close" set "TRACK=alpha"
if /i "%TRACK%"=="closed" set "TRACK=alpha"
if /i "%TRACK%"=="cerrada" set "TRACK=alpha"
echo Target track = %TRACK%

if not exist "android\keystore.properties" goto missing_keystore
if not exist "android\play-service-account.json" goto missing_key

if not exist "android\app\google-services.json" (
  echo [WARN] android\app\google-services.json NOT FOUND.
  echo This build may crash on launch - Firebase/push init fails.
  echo See ANDROID_PROJECTS_OVERVIEW.md for package com.entrenamatch.app
  echo Continuing anyway.
  timeout /t 4 >nul
)

echo.
echo Preparing full release - web + Capacitor sync + publish...
call npm run android:build
if errorlevel 1 goto build_failed

cd /d "%~dp0android"
echo.
echo Publishing AAB to Play track=%TRACK%
call gradlew.bat publishBundle "-Pplay.track=%TRACK%" --stacktrace
set "PUBLISH_ERR=!ERRORLEVEL!"
cd /d "%~dp0"

if not "!PUBLISH_ERR!"=="0" (
  if /i "%TRACK%"=="alpha" (
    echo.
    echo [WARN] Track "alpha" failed — retrying on "internal" ...
    cd /d "%~dp0android"
    call gradlew.bat publishBundle "-Pplay.track=internal" --stacktrace
    set "PUBLISH_ERR=!ERRORLEVEL!"
    set "TRACK=internal"
    cd /d "%~dp0"
  )
)

if not "!PUBLISH_ERR!"=="0" goto publish_failed

echo.
echo ************************************************
echo SUCCESS! AAB published to Play Console track %TRACK%.
echo.
echo NEXT:
echo - Play Console ^> Testing ^> %TRACK% testing
echo - Review release + release notes + rollout
echo.
echo AAB: android\app\build\outputs\bundle\release\app-release.aab
echo ************************************************
endlocal
exit /b 0

:missing_keystore
echo [ERROR] android\keystore.properties not found. Run build-release.bat first.
pause
exit /b 1

:missing_key
echo [ERROR] android\play-service-account.json not found.
echo Setup: Play Console ^> Setup ^> API access ^> Release manager role.
pause
exit /b 1

:build_failed
cd /d "%~dp0"
echo [ERROR] android:build failed - web sync or cap sync.
exit /b 1

:publish_failed
echo.
echo [ERROR] publishBundle failed. Common causes:
echo - Version code already used - bump versionCode in android\app\build.gradle
echo - Service account missing Release manager permission
echo - Closed testing track not created in Play Console
echo.
echo Upload manually if needed:
echo   android\app\build\outputs\bundle\release\app-release.aab
exit /b 1
