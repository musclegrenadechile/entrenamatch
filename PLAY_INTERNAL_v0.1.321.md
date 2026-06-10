# Play Store — v0.1.321 (versionCode 321)

**Fecha:** 9 junio 2026  
**Paquete:** `com.entrenamatch.app`  
**Track recomendado:** `internal` o `closed` (beta cerrada)  
**AAB local:** `android/app/build/outputs/bundle/release/app-release.aab`  
**Copia raíz (subir a Console):** `EntrenaMatch-release.aab`

## Cambios incluidos

### Explorar (móvil)
- **Más compatibles** y **TOP REDES** visibles en celular (antes ocultos en pantallas pequeñas)
- Carrusel horizontal en móvil; scroll vertical para ver secciones inferiores
- Tarjeta de swipe más compacta para dejar espacio al contenido

### GymSound — Fase 1 (Spotify)
- Conectar Spotify desde Perfil → Cuenta → GymSound
- Mostrar qué escuchas en LIVE (opt-in) en mapa, chat y popup LIVE
- OAuth PKCE; tokens solo en el dispositivo

### GymSound — Fase 2
- **Control remoto Spotify:** play / pausa / anterior / siguiente (requiere Premium + permisos nuevos)
- **YouTube Music:** pega link de YT/YT Music como himno manual en LIVE
- Strip GymSound en **Hoy** mientras estás en LIVE con controles compactos

### Chat y entreno
- Lista de chats ordenada por última actividad (estilo WhatsApp, fechas visibles)
- Compartir entreno de hoy a un chat sin terminar sesión (+ → Entreno)

### FTUE / polish (heredado 0.1.320)
- Guía 3 pasos + tour 4 tabs, LIVE unificado, derby visible, demo etiquetado
- Menos ruido día 1; coach/shop tras 2 syncs

## Subir a Play Console (manual)

1. [Play Console](https://play.google.com/console) → **EntrenaMatch**
2. **Pruebas** → **Prueba interna** (o **Prueba cerrada**)
3. **Crear nueva versión**
4. Subir **`EntrenaMatch-release.aab`** (raíz del repo)
5. Pegar **What's new** (abajo)
6. Revisar y **Publicar** al track

## Generar AAB en esta PC

```cmd
cd /d C:\Users\muscl\fitvina
build-play-store.bat build
```

AAB + upload automático (requiere `android\play-service-account.json`):

```cmd
build-play-store.bat publish internal
```

## What's new (ES — Play Console)

```
v0.1.321 — Explorar móvil + GymSound + chat
• Explorar: ahora ves Más compatibles y TOP REDES en el celular
• GymSound: conecta Spotify y comparte tu música en LIVE
• GymSound: control remoto (play/pausa/skip) y himno YouTube Music
• Chats ordenados por última actividad con fecha
• Comparte un entreno de hoy al chat sin cerrar la sesión
• Mejoras FTUE, mapa LIVE y estabilidad general
```

## What's new (EN)

```
v0.1.321 — Mobile Explore + GymSound + chat
• Explore: Most Compatible and TOP NETWORKS now visible on phone
• GymSound: connect Spotify and share what you play while LIVE
• GymSound: remote controls (play/pause/skip) + YouTube Music anthem link
• Chats sorted by last activity with timestamps
• Share today's workout to chat without ending your session
• FTUE polish, LIVE map improvements, general stability
```

## Matriz QA mínima

| # | Flujo | Pass |
|---|-------|------|
| 1 | Instalar desde Play → abre sin crash | ☐ |
| 2 | Explorar → scroll abajo → Más compatibles + TOP REDES | ☐ |
| 3 | Perfil → GymSound → Conectar Spotify | ☐ |
| 4 | LIVE + Compartir música → visible en mapa/chat | ☐ |
| 5 | GymSound control remoto (Premium) play/pausa | ☐ |
| 6 | YouTube Music: pegar link + guardar tema + LIVE | ☐ |
| 7 | Chats: orden por última actividad + fechas | ☐ |
| 8 | Chat + → Entreno → compartir log de hoy | ☐ |

## Versiones alineadas

| Archivo | Valor |
|---------|--------|
| `package.json` | 0.1.321 |
| `APP_VERSION` | 0.1.321 |
| `versionCode` | 321 |
| `versionName` | 0.1.321 |

Verificar: `npm run version:check`

## Spotify (testers con GymSound)

Redirect URIs en Spotify Dashboard:
- `https://entrenamatch.web.app/`
- `https://localhost/` (APK)
