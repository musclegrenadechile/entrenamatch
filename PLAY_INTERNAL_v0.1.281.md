# Play Internal — v0.1.281 (versionCode 281)

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
| Track `internal` — release `completed` | ✅ |
| Crashlytics nativo en build | ✅ (`MainActivity.java` + Gradle plugin) |
| Crash-free 7 días | ⏳ Pendiente — medir desde instalación testers |

## Play Console — siguientes pasos manuales

1. [Play Console](https://play.google.com/console) → **EntrenaMatch** → **Pruebas** → **Prueba interna**
2. Verificar release **281 (0.1.281)** visible
3. Agregar testers (emails) o lista existente
4. Compartir link de opt-in interno
5. **What's new** (copiar abajo)
6. Tras 24–48 h: [Firebase Crashlytics](https://console.firebase.google.com/project/entrenamatch/crashlytics) — confirmar sesiones

## What's new (ES — Play Console)

```
v0.1.281 — Open beta interna
• EntrenaSync: fix crash al iniciar sync (merge en vivo)
• EntrenaSync: filtro de ejercicios por grupo muscular corregido (Pecho, Espalda, Cardio…)
• Mapa GymPulse + reto semanal por ciudad
• Fuel wizard + balance del día
• Share post-sync y deep links de notificaciones
• Crashlytics activo para reportes de estabilidad en beta
```

## What's new (EN)

```
v0.1.281 — Internal open beta
• EntrenaSync: fix crash on sync start
• EntrenaSync: muscle-group exercise filter fixed
• GymPulse live map + weekly city challenge
• Fuel setup wizard + daily balance
• Post-sync share cards + notification deep links
• Crashlytics enabled for beta stability monitoring
```

## Matriz QA piloto (mínima)

| # | Flujo | Pass |
|---|-------|------|
| 1 | Instalar desde link internal → abre sin crash | ☐ |
| 2 | Login / demo → Tab Hoy | ☐ |
| 3 | LIVE → visible en mapa (2 dispositivos) | ☐ |
| 4 | EntrenaSync completo → sin crash | ☐ |
| 5 | Filtro ejercicios Pecho solo muestra pecho | ☐ |
| 6 | Post-sync share → muro | ☐ |
| 7 | Push → abre pantalla correcta | ☐ |
| 8 | Crashlytics: forzar crash test (opcional dev) → aparece en consola | ☐ |

## Crashlytics — verificación

- **Nativo:** `FirebaseCrashlytics.setCrashlyticsCollectionEnabled(true)` en `MainActivity.java`
- **Gradle:** plugin `com.google.firebase.crashlytics` + BOM 33.1.2
- **JS:** errores autenticados → colección `clientErrorReports` (Firestore)
- **Meta fase 100:** crash-free sessions > **99%** durante 7 días con este build

## Comando reproducir publicación

```powershell
cd C:\Users\muscl\fitvina
.\publish-play.bat internal
# o:
npm run publish:play:internal
```

## Métricas a registrar (7 días)

| Métrica | Día 1 | Día 7 | Meta |
|---------|-------|-------|------|
| Instalaciones internal | | | ≥10 testers |
| Crash-free % (Crashlytics) | | | ≥99% |
| Syncs reales (2 usuarios distintos) | | | ≥1/semana |
| Ciudad piloto activa | | | Viña o Santiago |

Registrar resultados en `OPEN_BETA_INFORME.md` (revisión jun 2026 +7 días).

## Syncs reales — instrumentación (v0.1.282+)

Cada EntrenaSync **≥2 min** entre **2 usuarios Firebase reales** en ciudad piloto (Viña, Santiago, Valparaíso, Concón) registra:

| Colección | Contenido |
|-----------|-----------|
| `pilotSyncSessions/{sessionId}` | Sesión idempotente (`sync_uidA_uidB`) |
| `pilotWeeklyMetrics/{city__weekKey}` | Contador semanal `realSyncCount` + minutos |

### Consultar en Firebase Console

```
pilotWeeklyMetrics  →  filtrar weekKey == "2026-06-09"
pilotSyncSessions   →  filtrar weekKey == "2026-06-09"  →  order by endedAt desc
```

### Reporte CLI

```powershell
node scripts/pilot-sync-report.mjs
node scripts/pilot-sync-report.mjs --week=2026-06-09
```

**Meta Fase 100:** `realSyncCount >= 1` en Viña o Santiago en la semana actual.

Desplegar reglas antes de probar:

```powershell
npx -y firebase-tools@latest deploy --only firestore:rules --project entrenamatch
```
