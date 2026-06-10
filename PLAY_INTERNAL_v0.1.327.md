# Play Store — v0.1.327 (versionCode 327)

**Fecha:** 10 junio 2026  
**Paquete:** `com.entrenamatch.app`  
**Motivo bump:** Fix build nativo — plugins Capacitor + banner PWA solo en web

## What's new (es-CL) — notas para testers

**Fix crítico — APK / Play Store**
- Corregido build Android: los plugins nativos (Spotify Browser, cámara, etc.) ya cargan bien en la APK
- El banner "Instalar app" ya no aparece en la versión instalada desde Play — solo en navegador web
- Error `@capacitor/browser` al conectar Spotify resuelto

**Incluye v0.1.326**
- Admin comunidad, Muro F1/F2, GymSound LIVE, beta bots

## Checklist Play Console

1. Testing → Prueba cerrada → Create release
2. Subir `EntrenaMatch-release.aab`
3. Notas: copiar sección "What's new" de arriba
