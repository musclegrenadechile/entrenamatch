# Play Internal — v0.1.402 (versionCode 402)

**Fecha publicación:** 9 junio 2026  
**Track:** `internal` (Prueba interna)  
**Paquete:** `com.entrenamatch.app`  
**AAB local:** `android/app/build/outputs/bundle/release/app-release.aab`

## Estado publicación

| Paso | Estado |
|------|--------|
| Build web + Capacitor sync | ✅ |
| `bundleRelease` firmado | ✅ |
| Upload Play API (`publishBundle`) | ✅ |
| Track `internal` — release `completed` | ✅ (versionCode 402) |
| Crashlytics nativo en build | ✅ (heredado) |
| Cloud Functions dictado voz | ✅ `parseWorkoutVoice` + `parseWorkoutVoiceText` |
| Firestore rules | ✅ |
| Crash-free 7 días | ⏳ Pendiente |

## What's new (ES — Play Console)

```
v0.1.402 — Piloto costero + dictado estable
• Dictar entreno: grabación audio nativa en Android (Parar responde al instante)
• Piloto Viña · Valparaíso · Concón — copy y landing alineados
• Home simplificado 7 días para nuevos usuarios
• UI: Conectar / ¡Conectaron! (menos “match” visible)
• Copa Zona solo en comunas participantes del piloto
```

## What's new (EN)

```
v0.1.402 — Coastal pilot + stable voice dictation
• Workout dictation: native audio capture on Android (instant stop)
• Pilot Viña · Valparaíso · Concón — aligned copy and landing
• Simplified 7-day home for new users
• UI: Connect / Connected celebration (less “match” wording)
• Zone Cup only in participating pilot cities
```

## Matriz QA piloto (mínima)

| # | Flujo | Pass |
|---|-------|------|
| 1 | Instalar desde link internal → abre sin crash | ☐ |
| 2 | Login → Tab Hoy (home compacto día 1) | ☐ |
| 3 | Explorar: badge CONECTAR | ☐ |
| 4 | LIVE → visible en mapa (2 dispositivos, <60 s) | ☐ |
| 5 | EntrenaSync completo → sin crash | ☐ |
| 6 | Dictar entreno → Grabando audio → Parar → preview | ☐ |
| 7 | Usuario fuera piloto: sin Copa Zona | ☐ |
| 8 | Usuario Viña: con Copa Zona | ☐ |
| 9 | Invitar amigo (strip / QR) | ☐ |
| 10 | Crashlytics sesiones visibles tras 24 h | ☐ |

## Comando reproducir publicación

```powershell
cd C:\Users\muscl\fitvina
node scripts/version-check.mjs
.\publish-play.bat internal
```

## Play Console — siguientes pasos manuales

1. [Play Console](https://play.google.com/console) → **EntrenaMatch** → **Pruebas** → **Prueba interna**
2. Verificar release **402 (0.1.402)** visible
3. Pegar **What's new** (arriba)
4. Agregar testers o lista existente
5. Compartir link de opt-in interno
6. Tras 24–48 h: [Firebase Crashlytics](https://console.firebase.google.com/project/entrenamatch/crashlytics)
