@echo off
setlocal
set "ADB=C:\Android\platform-tools\adb.exe"
set "PKG=com.entrenamatch.app"
set "APK=%~dp0EntrenaMatch-debug.apk"

echo === EntrenaMatch smoke test (USB) v0.1.320 ===
"%ADB%" devices | findstr /i "device$" | findstr /v "List" >nul
if errorlevel 1 (
  echo ERROR: No hay celular conectado. Activa Depuracion USB y modo Transferencia de archivos.
  exit /b 2
)

if not exist "%APK%" (
  echo APK no encontrado. Ejecuta usb-test-device.bat primero.
  exit /b 1
)

echo Instalando...
"%ADB%" install -r "%APK%"
if errorlevel 1 (
  echo Reintentando tras desinstalar build Play...
  "%ADB%" uninstall %PKG%
  "%ADB%" install "%APK%"
  if errorlevel 1 exit /b 1
)

echo Lanzando app...
"%ADB%" shell am force-stop %PKG%
"%ADB%" shell am start -n %PKG%/.MainActivity

echo.
echo Capturando 45s de logs (errores)...
"%ADB%" logcat -c
timeout /t 3 /nobreak >nul
"%ADB%" logcat -v time -d -T 45s 2>nul | findstr /i "FATAL AndroidRuntime entrenamatch Firebase chromium ERROR Exception com.entrenamatch" > "%~dp0usb-smoke-log.txt"
if not exist "%~dp0usb-smoke-log.txt" (
  "%ADB%" logcat -v time -d | findstr /i "FATAL AndroidRuntime entrenamatch Firebase chromium ERROR Exception com.entrenamatch" > "%~dp0usb-smoke-log.txt"
)

echo Log guardado: %~dp0usb-smoke-log.txt
type "%~dp0usb-smoke-log.txt" 2>nul | more
echo.
echo En el celular: login -^> Hoy -^> Mapa -^> LIVE. Luego revisa usb-smoke-log.txt
exit /b 0
