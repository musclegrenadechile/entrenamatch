@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo EntrenaMatch - PUBLISH to Google Play (via Gradle Play Publisher)
echo For HIDDEN Internal/Closed Testing (beta cerrada)
echo Uses pre-configured play plugin + service account
echo ==========================================

set "TRACK=%~1"
if "%TRACK%"=="" set TRACK=closed
echo Target track: %TRACK%

set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
set "ANDROID_HOME=C:\Android"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

cd /d "%~dp0"

:: Check prerequisites (secrets never in repo)
if not exist "android\keystore.properties" (
    echo [ERROR] android\keystore.properties not found. Run build-release.bat first to set up signing.
    pause
    exit /b 1
)

if not exist "android\play-service-account.json" (
    echo [ERROR] android\play-service-account.json not found.
    echo.
    echo One-time setup required (do this in your browser via Google Play Console):
    echo 1. Play Console > Setup > API access > Create/link service account (or Google Cloud Console).
    echo 2. Create service account (e.g. name: entrenamatch-publisher).
    echo 3. Grant it "Release manager" role (or at minimum edit/publish permissions) for the EntrenaMatch app.
    echo 4. Generate and download JSON key.
    echo 5. Copy the JSON to android\play-service-account.json (this file is gitignored - NEVER commit it).
    echo.
    echo After setup, re-run this script. The key gives limited publish access (no full account login needed).
    echo See PRODUCTION_AND_APK.md for detailed clicks + security notes.
    pause
    exit /b 1
)

echo.
echo Preparing full release (web + Capacitor sync + publish)...
call npm run android:build
if errorlevel 1 (
    echo [ERROR] android:build failed (web sync or cap sync).
    pause
    exit /b 1
)

cd android

echo.
echo Publishing AAB to Play (track=%TRACK%)...
call gradlew.bat publishBundle -Pplay.track=%TRACK% --stacktrace
if errorlevel 1 (
    echo [ERROR] publishBundle failed. Common causes:
    echo - Service account key invalid/expired or missing permissions.
    echo - App not created in Play Console yet, or no prior release in the track.
    echo - Version code not bumped (must be > previous uploads).
    echo - First upload must often be manual to Internal testing before service account works.
    echo.
    echo Fix and retry. Check Play Console > Setup > API access for the service account.
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ************************************************
echo SUCCESS! AAB published to Play Console track "%TRACK%".
echo.
echo NEXT:
echo - Go to Play Console > Testing > %TRACK% testing.
echo - Review the new release (add release notes if needed).
echo - Roll out to testers (add emails or Google Group for closed beta).
echo - Testers install via private link (app stays hidden).
echo.
echo The AI (Grok) can run this script for you in future: just say "sube la nueva version a closed" after bumping versionCode.
echo (Run via terminal tools on your machine - full access to gradle/npm once key is placed.)
echo ************************************************

endlocal
pause
