@echo off
echo ==========================================
echo EntrenaMatch - Build Android APK (Debug)
echo ==========================================
echo.

echo [1/3] Building web assets for Capacitor (relative paths)...
call npm run build:web
if errorlevel 1 (
  echo ERROR: Web build failed.
  pause
  exit /b 1
)

echo.
echo [2/3] Syncing web assets to Android project...
call npx cap sync android
if errorlevel 1 (
  echo ERROR: Capacitor sync failed.
  pause
  exit /b 1
)

echo.
echo [3/3] Building APK with Gradle...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
  echo.
  echo ERROR: Gradle build failed.
  echo This usually means Android Studio / SDK is not installed or JAVA_HOME not set.
  echo.
  echo Please:
  echo 1. Install Android Studio from https://developer.android.com/studio
  echo 2. Open the project with: npx cap open android
  echo 3. Or set JAVA_HOME and ANDROID_HOME environment variables.
  echo.
  pause
  exit /b 1
)

echo.
echo SUCCESS! APK generated.
echo Location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo You can install it on your Android device (enable "Install from unknown sources").
echo For release version, use Android Studio to generate signed AAB/APK.
pause
