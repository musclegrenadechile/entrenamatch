@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo EntrenaMatch - Build SIGNED RELEASE AAB (Play Store)
echo For HIDDEN Internal/Closed Testing
echo ==========================================

set "MODE=%~1"
set "TRACK=%~2"
if "%MODE%"=="" set MODE=build
if "%TRACK%"=="" set TRACK=closed

set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
set "ANDROID_HOME=C:\Android"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

cd /d "%~dp0\android"

if not exist "keystore.properties" (
    echo.
    echo [SETUP REQUIRED] No keystore.properties found.
    echo.
    echo 1. Copy keystore.properties.example to keystore.properties
    echo 2. Generate a release keystore (we will help):
    echo.
    set /p DO_GEN="Do you want to generate a new release-key.keystore now? (Y/N): "
    if /i "!DO_GEN!"=="Y" (
        echo.
        echo Generating keystore... You will be prompted for passwords and info.
        echo IMPORTANT: Remember the passwords and alias you choose!
        keytool -genkey -v -keystore release-key.keystore -alias entrenamatch -keyalg RSA -keysize 2048 -validity 10000
        echo.
        echo Now edit keystore.properties with the details you just entered.
        echo Example:
        echo storeFile=release-key.keystore
        echo storePassword=thepassword
        echo keyAlias=entrenamatch
        echo keyPassword=thepassword
        echo.
        pause
        exit /b 0
    )
    echo Please create keystore.properties and run this script again.
    pause
    exit /b 1
)

echo.
echo Building RELEASE AAB (best for Play Store)...
call gradlew.bat bundleRelease

set "AAB_PATH=app\build\outputs\bundle\release\app-release.aab"
if exist "%AAB_PATH%" (
    echo.
    echo ************************************************
    echo SUCCESS! Signed Release AAB ready for Play Store:
    echo %CD%\%AAB_PATH%
    echo ************************************************
    copy /y "%AAB_PATH%" "%~dp0EntrenaMatch-release.aab" >nul 2>&1
    echo Also copied to easy location: %~dp0EntrenaMatch-release.aab
    echo.
    if /i "%MODE%"=="publish" (
        echo Publishing to Play track %TRACK% using publish-play.bat...
        cd /d "%~dp0"
        call publish-play.bat %TRACK%
    ) else (
        echo NEXT: Upload EntrenaMatch-release.aab to Google Play Console
        echo in the Internal testing track (completely hidden except for your tester emails).
        echo (Or run: build-release.bat publish closed  to auto-publish via service account)
    )
) else (
    echo.
    echo Could not find AAB. Check for errors above.
    echo You may need to run this from a developer command prompt with full Android setup.
)

endlocal
pause
