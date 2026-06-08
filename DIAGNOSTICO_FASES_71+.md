# EntrenaMatch — Revisión post fases 31–70 + Diagnóstico fases 71+

**Versión actual:** v0.1.200 · **Deploy:** https://entrenamatch.web.app  
**Fecha:** Jun 2026

---

## 1. Revisión de lo implementado (31–70)

### Lo que está sólido y listo para escalar

| Área | Estado | Notas |
|------|--------|-------|
| **Navegación & activación** | ✅ Fuerte | 5 tabs, sub-tabs Hoy/Muro, first live, geo, pact wizard |
| **Social graph** | ✅ Bueno | Bond graph, sync replays, city challenge, squad invite |
| **Chat & safety** | ✅ Funcional | Menú `…`, icebreakers, match breakdown, safety sheet |
| **Fuel AI base** | ✅ Producto real | TDEE Mifflin-St Jeor, logs Firestore, Gemini foto/texto, semana |
| **EntrenaLog** | ✅ Estructurado | `workouts/` con sets, volumen, tipo, sync/arena |
| **EntrenaCoach** | ✅ MVP | Calendario, dispatch ETA, panel ingresos PT |
| **Tech** | ⚠️ Parcial | Lazy tabs en Explore/Matches/Profile/Home; error boundaries |

### Lo que quedó “delgado” (entregable pero incompleto)

| Fase | Entregable | Gap real |
|------|------------|----------|
| **57** | Fuel × workout insight | Solo texto genérico por `WorkoutType` (`push`/`legs`/`cardio`). **No hay cálculo calórico ni ajuste de target.** |
| **61** | Lazy load ALL tabs | Home/Explore/Matches/Profile lazy; Squads/Sessions aún import estático → chunks inefectivos |
| **62** | Sync module | `syncArenaState.ts` = tipos + helpers mínimos; lógica sigue en `App.tsx` (~13k líneas) |
| **67** | Partner gym dashboard | UI estática; métricas simuladas, sin backend partner |
| **68** | Moments reel | Highlights derivados de contadores del día, no de datos reales agregados |
| **69** | Constancia store | UI en perfil; sin economía persistente ni compras reales |
| **70** | ASO / landing EN | `landing-en.html` estático; Play Store listing no automatizado |

### Deuda técnica prioritaria (antes de features “inteligentes”)

1. **`App.tsx` monolito** — dificulta cruzar Fuel + Workout sin duplicar estado.
2. **Sin modelo `DailyEnergy`** — Fuel y Workouts viven en colecciones separadas sin join diario.
3. **`WorkoutStats` sin `kcalBurned`** — solo volumen/sets/duración.
4. **Live (`trainingNowSince`) no alimenta Fuel** — sesión en vivo no suma gasto calórico al día.
5. **E2E** — smoke ampliado pero no cubre flujo Fuel post-entreno.

---

## 2. Diagnóstico: Fuel × Entrenamiento hoy

### Flujo actual (desconectado)

```
FuelProfile (TDEE estático + activityLevel genérico)
        ↓
targetKcal / macros fijos del día
        ↓
FuelLogs (consumo)  ←→  NO CRUCE  ←→  Workouts / Live / Sync
        ↓
getPostWorkoutFuelTip(type) → string fijo en FuelDayCard
```

### Datos que YA existen y no se cruzan

| Fuente | Campos útiles | Uso potencial |
|--------|---------------|---------------|
| `fuelProfiles/{uid}` | peso, objetivo, TDEE, macros | Base + peso para MET |
| `fuelLogs` | kcal, P/C/G por comida | Consumo acumulado |
| `workouts/{id}` | `type`, `exercises[]`, `stats.durationMin`, `stats.totalVolumeKg` | Gasto + tipo muscular |
| `EXERCISE_LIBRARY` | `muscle`, `type` (compound/cardio) | Inferir “día pecho” vs “piernas” |
| Live profile | `trainingNowSince` | Duración sesión aún activa |
| EntrenaSync | duración sync + log ejercicios | Gasto compartido / post-sync fuel |

### Lo que el usuario pide (Energy Balance inteligente)

> *“Si hice pecho y gasté X kcal, calcular cuántas necesito hoy para cumplir mi objetivo.”*

Eso requiere **target dinámico del día**:

```
targetKcalHoy = targetBase(objetivo, TDEE)
              + kcalQuemadasEntrenoHoy
              ± ajusteMacroPostEntreno(tipo, volumen, objetivo)

restanteKcal = targetKcalHoy - sum(fuelLogsHoy)
restanteProteína = targetProteínaAjustada - sum(proteínaLogsHoy)
```

---

## 3. Propuesta de sistema: **FuelBalance Engine**

Nombre producto sugerido: **FuelBalance** o **Balance del día** (visible en `FuelDayCard`).

### 3.1 Capa de dominio (pure functions, testeable)

Nuevo módulo: `src/domain/fuelBalance/`

```ts
// Entrada
interface DailyEnergyInput {
  profile: FuelProfile
  fuelLogs: FuelLogEntry[]
  workouts: Workout[]           // del día (local date)
  liveSessionMin?: number       // si trainingNow, now - trainingNowSince
}

// Salida
interface DailyEnergyBalance {
  baseTargetKcal: number
  workoutBurnKcal: number
  adjustedTargetKcal: number
  consumedKcal: number
  remainingKcal: number
  macroTargets: { proteinG; carbsG; fatG }      // ajustados post-entreno
  macroRemaining: { proteinG; carbsG; fatG }
  workoutInsights: WorkoutFuelInsight[]         // por sesión
  coachingLine: string                          // reemplaza tips sueltos
}
```

### 3.2 Estimación de gasto calórico (3 niveles)

| Nivel | Método | Precisión | Costo | Fase |
|-------|--------|-----------|-------|------|
| **L1** | MET × peso × horas | Media | $0 | **71** |
| **L2** | MET + volumen (kg×reps) + compuestos | Media-alta | $0 | **72** |
| **L3** | Gemini context + historial usuario | Alta (subjetiva) | API | **75** |
| **L4** | Apple Health / Health Connect | Alta | Integración | **80+** |

#### L1 — MET (recomendado para MVP)

Fórmula estándar:

```
kcal = MET × pesoKg × (duraciónHoras)
```

MET por `WorkoutType` (valores conservadores):

| Tipo | MET | Ejemplo 75 kg, 60 min |
|------|-----|------------------------|
| push / pull | 6.0 | ~450 kcal |
| legs | 7.0 | ~525 kcal |
| full | 6.5 | ~490 kcal |
| cardio | 8.0 | ~600 kcal |
| other | 5.0 | ~375 kcal |

Para **live sin EntrenaLog** (solo toggle live): usar duración desde `trainingNowSince` + MET `moderate` (5.5) hasta que guarden workout.

#### L2 — Refinar con ejercicios reales

Por cada ejercicio en el log:

1. Resolver músculo desde `EXERCISE_LIBRARY` (fuzzy match nombre).
2. Sumar “stress score” = sets × (compound ? 1.2 : 0.8) × avgWeight factor.
3. Boost MET si volumen > umbral (ej. > 8000 kg total).
4. **Macro shift post-entreno:** piernas/full → +15–25g proteína ventana 4h; push pecho → +carbs moderados si objetivo músculo.

#### L3 — IA como capa, no como verdad

Extender `buildFuelAnalyzeContext()` con:

```ts
workoutBurnToday: number
dominantMuscle: 'Pecho' | 'Piernas' | ...
adjustedRemainingKcal: number
```

Gemini en `analyzeFood` puede decir: *“Post-pecho te quedan 680 kcal; este plato cubre 35g de los 45g proteína que te faltan.”*

---

## 4. UX propuesta (Mi día)

### FuelDayCard v2 — “Balance del día”

```
┌─────────────────────────────────────┐
│ Fuel del día                        │
│ Consumido 1,840 / Objetivo 2,450    │
│   ↑ base 2,100  + 350 entreno pecho │
│ ████████████░░░░  75%               │
│                                     │
│ 🏋️ Pecho · 52 min · ~350 kcal       │
│ Restan ~610 kcal · ~38g proteína    │
│ 💡 Ventana post-entreno: prioriza   │
│    proteína en la cena              │
│ [+ Registrar comida]                │
└─────────────────────────────────────┘
```

### Momentos de activación

1. **Al guardar EntrenaLog** → toast + abrir Fuel con target ya ajustado.
2. **Al terminar Live** (toggle off) → modal opcional “¿Cuánto entrenaste?” → estimación rápida.
3. **Post EntrenaSync** → insight compartido en resumen sync (social + fuel).
4. **Al analizar foto comida** → IA ve balance del día completo.

---

## 5. Modelo de datos (Firestore)

### Opción A — Sin nueva colección (fase 71)

Calcular `DailyEnergyBalance` **on read** en cliente desde `fuelLogs` + `workouts` query por `date`.

Pros: cero migración. Contras: queries extra.

### Opción B — `dailyEnergy/{uid}_{YYYY-MM-DD}` (fase 73)

Documento agregado escrito al:

- guardar workout
- guardar fuel log
- toggle live off

```ts
{
  userId, date,
  baseTargetKcal, workoutBurnKcal, adjustedTargetKcal,
  consumed: { kcal, proteinG, carbsG, fatG },
  workoutIds: string[],
  liveMinutes: number,
  updatedAt
}
```

Pros: feed Moments, squads, coach ven el mismo número. Contras: sync writes.

**Recomendación:** A en fase 71, B cuando Moments/coach necesiten el dato.

---

## 6. Roadmap propuesto — Fases 71–90

### Bloque 9 — FuelBalance (71–75) · **P0 diferenciador**

| # | Fase | Entregable | P |
|---|------|------------|---|
| **71** | `estimateWorkoutBurn()` MET + duración | Función pura + tests | P0 |
| **72** | `computeDailyEnergyBalance()` | Join profile + logs + workouts del día | P0 |
| **73** | FuelDayCard “Balance del día” | UI target dinámico + línea entreno | P0 |
| **74** | Hook post-EntrenaLog → Fuel | CTA automático tras guardar workout | P1 |
| **75** | Gemini context enriquecido | `analyzeFood` recibe burn + músculo dominante | P1 |

### Bloque 10 — Live & Sync cruzado (76–80)

| # | Fase | Entregable | P |
|---|------|------------|---|
| **76** | Live duration → burn estimado | `trainingNowSince` alimenta balance | P1 |
| **77** | Inferencia músculo desde ejercicios | Pecho vs piernas en insight | P1 |
| **78** | Post-sync Fuel insight en `SyncDuelSummary` | “Quemaron X juntos” | P2 |
| **79** | Squad weekly: kcal + volumen agregado | Leaderboard nutrición opcional | P2 |
| **80** | Health Connect / Apple Health (import kcal) | Wearables | P3 |

### Bloque 11 — Consolidación producto (81–85)

| # | Fase | Entregable | P |
|---|------|------------|---|
| **81** | Extraer Fuel state de App.tsx | `hooks/useFuelBalance.ts` | P1 |
| **82** | Lazy Squads/Sessions real | Quitar imports estáticos | P2 |
| **83** | `dailyEnergy` Firestore cache | Opción B persistida | P2 |
| **84** | E2E: workout → fuel ajustado | Playwright | P0 |
| **85** | Fuel semanal report v2 | Gráfico consumo vs burn vs target | P2 |

### Bloque 12 — Monetización inteligente (86–90)

| # | Fase | Entregable | P |
|---|------|------------|---|
| **86** | EntrenaCoach ve FuelBalance cliente | Panel PT | P2 |
| **87** | Plan nutricional PT (prescripción macros) | B2B | P2 |
| **88** | Constancia economy real | Firestore + reglas | P2 |
| **89** | Partner gym: check-ins reales | Integración backend | P3 |
| **90** | Open beta pública v1.0 | Store + analytics | P1 |

---

## 7. Alternativas evaluadas

| Enfoque | Pros | Contras | Veredicto |
|---------|------|---------|-----------|
| **Solo reglas MET locales** | Rápido, barato, offline | No personaliza por FC | ✅ **MVP fase 71** |
| **Solo Gemini** | Texto rico | Caro, inconsistente, no auditable | ❌ Como fuente primaria |
| **MyFitnessPal API** | Datos reales | Dependencia externa, TOS | ❌ No alineado |
| **Compendium MET por ejercicio** | Preciso | Tabla grande, mantenimiento | ✅ Fase 72 parcial |
| **WHOOP / Garmin** | Muy preciso | Pocos usuarios, OAuth | Fase 80+ |

---

## 8. Plan de implementación sugerido (fase 71)

**Objetivo:** en 1 deploy, el usuario ve target calórico **subir** después de registrar pecho 50 min.

### Archivos a tocar

1. `src/domain/fuelBalance/estimateWorkoutBurn.ts` — MET × peso × h
2. `src/domain/fuelBalance/computeDailyEnergyBalance.ts` — orquestador
3. `src/utils/fuelCalculator.ts` — delegar coaching a balance
4. `src/components/fuel/FuelDayCard.tsx` — UI “+ X entreno”
5. `src/App.tsx` — pasar `todayWorkouts` a HomeTab/FuelDayCard
6. `src/services/workouts.ts` — `fetchWorkoutsForDate(db, uid, date)`
7. Tests vitest para MET y balance

### Criterio de éxito (DoD)

- Usuario con objetivo músculo, TDEE 2500, entrena push 60 min → target ~2950 (±50).
- FuelDayCard muestra desglose base + entreno.
- `npm test` + build + deploy.

---

## 9. Resumen ejecutivo

**EntrenaMatch ya tiene las piezas** (Fuel AI, EntrenaLog, live, sync, biblioteca de ejercicios) pero operan en **silos**. El diferenciador natural vs MyFitnessPal/Strava es:

> **Social + gym live + nutrición en un solo balance del día**, ajustado por lo que *realmente* entrenaste en EntrenaMatch — solo o en sync.

La fase **71** es el cimiento de bajo riesgo (funciones puras + UI). Las fases **75–78** añaden IA y social. **80+** wearables.

**Prioridad recomendada:** 71 → 73 → 74 → 84 (E2E) antes de más growth features.

---

## Relación con roadmaps

| Doc | Fases | Estado |
|-----|-------|--------|
| `ROADMAP_30_FASES.md` | 1–30 | ✅ |
| `ROADMAP_40_FASES.md` | 31–70 | ✅ v0.1.200 |
| **`DIAGNOSTICO_FASES_71+.md`** | **71–90 propuesto** | 📋 Este doc |
