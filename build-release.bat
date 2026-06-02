@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo EntrenaMatch - Build SIGNED RELEASE AAB/APK
echo (For Play Store Internal/Closed Testing)
echo ==========================================

set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
set "ANDROID_HOME=C:\Android"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

echo JAVA_HOME=%JAVA_HOME%
echo ANDROID_HOME=%ANDROID_HOME%

if not exist "android\keystore.properties" (
    echo.
    echo ERROR: android\keystore.properties not found!
    echo.
    echo 1. Copy android\keystore.properties.example to android\keystore.properties
    echo 2. Edit it with your actual keystore details.
    echo 3. Generate a keystore if you don't have one:
    echo    keytool -genkey -v -keystore release-key.keystore -alias yourkey -keyalg RSA -keysize 2048 -validity 10000
    echo    (Run the above in cmd, put the .keystore next to the properties file or update the path).
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0\android"

echo.
echo Building RELEASE BUNDLE (AAB recommended for Play Store)...
call gradlew.bat bundleRelease

set "AAB_PATH=app\build\outputs\bundle\release\app-release.aab"
if exist "%AAB_PATH%" (
    echo.
    echo ************************************************
    echo SUCCESS! Signed Release AAB generated:
    echo %CD%\%AAB_PATH%
    echo ************************************************
    copy /y "%AAB_PATH%" "%~dp0EntrenaMatch-release.aab" >nul
    echo Also copied to: %~dp0EntrenaMatch-release.aab (easy to find)
) else (
    echo.
    echo AAB not found, trying APK instead...
    call gradlew.bat assembleRelease
    set "APK_PATH=app\build\outputs\apk\release\app-release-unsigned.apk"
    if exist "%APK_PATH%" (
        echo APK (unsigned) at %CD%\%APK_PATH%
        echo You still need to sign it manually or use the properties correctly.
    )
)

echo.
echo Next steps for Play Store (hidden testing):
echo 1. Go to Google Play Console (play.google.com/console)
echo 2. Create new app (or use existing)
echo 3. Go to "Internal testing" or "Closed testing" track
echo 4. Upload the .aab file
echo 5. Add your tester emails (they will get a link, app stays hidden from public)
echo 6. Save and roll out to internal testers.
echo.
echo The app will be "oculto" (only for invited testers).

endlocal
pause
