# Piloto cerrado — Costa central (Viña · Valpo · Concón) × Santiago

**Versión:** `0.1.402` (Play internal v402)  
**Meta:** 50–200 MAU en zona costera antes de abrir más comunas  
**Programa:** `PILOT_PROGRAM_TITLE` en app = **Piloto costa central**

---

## 1. Ciudades abiertas

| Ciudad | `cityNorm` |
|--------|------------|
| Viña del Mar | `vina del mar` |
| Valparaíso | `valparaiso` |
| Santiago | `santiago` |
| Concón | `concon` |

Cualquier otra ciudad → **lista de espera** (`cityWaitlist` + formulario en Explorar).

---

## 2. Qué hace la app (código)

| Pieza | Función |
|-------|---------|
| `PilotProgramStrip` (Tab Hoy) | Muestra contador de cohorte + barra hacia meta 50 MAU + invitar |
| `pilotCohort` Firestore | Registro automático al guardar perfil en ciudad piloto |
| `pilotSyncSessions` | Syncs reales ≥2 min entre 2 usuarios Firebase |
| Onboarding | Solo ciudades piloto en el selector |
| `CityDerbyCard` (Tab Hoy) | Duelo semanal Viña vs Santiago — barras + CTA mapa/LIVE |
| `GymPulseMap` overlay | Hex Costa (Viña/Valpo/Concón) vs Santiago — verde/azul/rojo según líder |
| `cityDerby.ts` | Agrega `cityWeeklyStats` + minutos locales; listeners Firestore en tiempo real |
| `syncShareWeekly` | Funnel post-sync: offers / publishes / skips / opt-out (`scripts/sync-share-report.mjs`) |

### Firestore

```
pilotCohort/{cityNorm}           → memberCount, activeLast7d
pilotCohort/{cityNorm}/members/{uid}
pilotSyncSessions/{sessionId}
pilotWeeklyMetrics/{city__week}
cityWaitlist/{autoId}
```

---

## 3. Onboarding de testers (checklist)

### A. Play Internal (APK)

1. Publicar build: `.\publish-play.bat internal` → **v0.1.402** ✅
2. Play Console → **Prueba interna** → agregar emails
3. Compartir link opt-in + `GUIA_PILOTO_RAPIDA.md` + matriz `PLAY_INTERNAL_v0.1.402.md`

### B. Grupos sugeridos

| Grupo | Tamaño | Ciudad |
|-------|--------|--------|
| Gym SmartFit Viña | 15–30 | Viña |
| Gym SmartFit Stgo centro | 15–30 | Santiago |
| Amigos founders | 10–20 | Mixto |
| **Total objetivo** | **50–200** | — |

### C. Mensaje de invitación (copiar)

```
Estamos probando EntrenaMatch en beta cerrada (Viña · Valpo · Concón).

1. Instala desde el link de Play internal (v0.1.402)
2. Elige tu ciudad real en el registro
3. Activa LIVE cuando entrenes
4. Haz un EntrenaSync ≥2 min con un amigo
5. Prueba Dictar entreno en Tab Hoy

Tu ciudad suma al piloto — meta 50 personas activas.
Guía: GUIA_PILOTO_RAPIDA.md en el repo.
```

---

## 4. Métricas semanales

| Métrica | Fuente | Meta semana 1 |
|---------|--------|---------------|
| Miembros cohorte | `pilotCohort` | ≥10 por ciudad |
| MAU piloto | `memberCount` + actividad | ≥50 total |
| Syncs reales | `pilotWeeklyMetrics` | ≥1 entre 2 usuarios distintos |
| Crash-free | Crashlytics | ≥99% |

### Reportes CLI

```powershell
node scripts/pilot-cohort-report.mjs
node scripts/pilot-sync-report.mjs
```

### Firebase Console

```
pilotCohort → ver memberCount por ciudad
pilotWeeklyMetrics → realSyncCount semana actual
```

---

## 5. Criterios para abrir otra ciudad

No abrir Concepción / La Serena hasta:

- [ ] ≥50 MAU en **Viña** o **Santiago**
- [ ] ≥1 sync real/semana sostenido 4 semanas
- [ ] Crash-free ≥99% (7 días)
- [x] Derby Viña vs Santiago lanzado (v0.1.284 — `CityDerbyCard` en Hoy + banner/hex en mapa LIVE)

---

## 6. Roles operativos

| Rol | Tarea |
|-----|-------|
| **Producto** | Revisar reportes lunes — `pilot-cohort-report` + `pilot-sync-report` |
| **QA** | 2 dispositivos sync + filtro ejercicios (matriz PLAY_INTERNAL) |
| **Community** | Grupo WhatsApp piloto — feedback 24h |
| **Deploy** | Bump + `publish-play.bat internal` cada fix P0 |

---

## 7. Comandos deploy piloto

```powershell
cd C:\Users\muscl\fitvina
npm test
npx -y firebase-tools@latest deploy --only firestore:rules --project entrenamatch
npm run build
npx -y firebase-tools@latest deploy --only hosting --project entrenamatch
.\publish-play.bat internal
```

---

*Documento operativo — orden 4 open beta. Actualizar métricas cada lunes.*
