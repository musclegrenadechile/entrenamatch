@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo EntrenaMatch APK Builder (using JDK 21)
echo ==========================================

set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
set "ANDROID_HOME=C:\Android"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

echo JAVA_HOME=%JAVA_HOME%
echo ANDROID_HOME=%ANDROID_HOME%

cd /d "%~dp0\android"

echo.
echo Running Gradle to build debug APK...
call gradlew.bat assembleDebug

set "APK_PATH=app\build\outputs\apk\debug\app-debug.apk"
if exist "%APK_PATH%" (
    echo.
    echo ************************************************
    echo SUCCESS! The APK has been generated on your computer:
    echo %CD%\%APK_PATH%
    echo ************************************************
    dir "%APK_PATH%"

    echo.
    echo Copying to project root for easy access...
    copy /y "%APK_PATH%" "%~dp0EntrenaMatch-debug.apk" >nul
    echo Copied to: %~dp0EntrenaMatch-debug.apk
) else (
    echo.
    echo Build completed but APK not found at expected location.
    echo Check the log for details.
)

endlocal
echo Build complete. Press any key if you want to close manually...

