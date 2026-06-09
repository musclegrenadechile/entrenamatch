# Informe EntrenaMatch — Revisión usuario nuevo + fases a seguir

**Fecha:** 9 jun 2026  
**Versión en producción:** v0.1.298 (`https://entrenamatch.web.app`)  
**Alcance:** Auditoría como usuario que recién entra + plan de fases priorizado para piloto Viña × Santiago

---

## Resumen ejecutivo

EntrenaMatch tiene el **loop técnico completo** (registro → onboarding → Home → mapa LIVE → Explore → EntrenaSync → derby regional). El producto ya no necesita “más features” para arrancar el piloto; necesita **cerrar fricción de primera sesión**, **alinear expectativas con la realidad de una beta cerrada** y **medir retención con datos reales**.

La brecha más grave para un usuario nuevo no es un bug: es la **promesa vs. vacío** — auth dice “142 entrenando en vivo”, pero Explore y el mapa pueden estar vacíos con 5–20 testers reales.

**Prioridad inmediata:** validación operativa Fase 100 (crash-free, sync real 2 dispositivos, D1/D7) antes de abrir más ciudades o monetización.

---

## Parte 1 — Journey del usuario nuevo (revisión paso a paso)

### A. Arranque (0–15 s)

| Paso | Qué ve | Evaluación |
|------|--------|------------|
| Abre la app | `BootShell`: “Cargando tu cuenta…” → “Cargando tu perfil…” → “Preparando tu arena…” | ✅ Claro, en español |
| Red lenta / Firebase | Timeout 10 s → Reintentar o **Modo prueba** | ✅ Buen escape |
| Sin sesión | `AuthScreen` con registro, login, Google, demo | ✅ Bien estructurado |

**Fricción:** versión `v0.1.298` visible en barra superior — sensación pre-alpha para usuario final.

---

### B. Pantalla de auth (primera impresión)

**Funciona bien:**
- Tabs Crear cuenta / Iniciar sesión
- Errores amigables (email en uso, contraseña débil)
- Modo prueba sin cuenta (explorar sin Firebase)
- Google deshabilitado con gracia si Firebase no está configurado

**Problemas críticos:**

1. **“142 entrenando en vivo ahora”** — hardcodeado en `AuthScreen.tsx`. Tras registrarse, el mapa puede estar vacío → **pérdida de confianza inmediata**.
2. **Copy de “acceso exclusivo” / beta** choca con comunidad pequeña real.
3. **Modo prueba** no deja claro después que los matches no cruzan dispositivos reales.

---

### C. Onboarding (5 pasos, obligatorio)

**Flujo:** Intro → Presencia (nombre, fotos, ciudad piloto, GPS, bio) → Esencia (tipos, objetivos, nivel) → Pulso vivo (opt-in LIVE) → Consentimientos (+18, ubicación).

**Funciona bien:**
- Preview de perfil en vivo
- Ciudades piloto acotadas: Viña, Valparaíso, Santiago, Concón (`pilotProgram.ts`)
- Validación estricta antes de entrar
- Bios sugeridas y UX cuidada

**Problemas:**

| # | Problema | Impacto |
|---|----------|---------|
| 1 | **5 pasos sin “completar después”** | Abandono en móvil |
| 2 | **`wantsToGoLive: true` por defecto** → al terminar queda `trainingNow: true` | Usuario en mapa sin entender privacidad |
| 3 | **`isProfileComplete` solo exige nombre + foto** (`profileComplete.ts`) | Login Google puede **saltar onboarding** sin bio/ciudad/consentimientos |
| 4 | Copy aún muy “marketing” (“LA MAGIA”, “PULSO VIVO”) | Menos credibilidad para público serio +18 |
| 5 | Botón cámara nativa en web muestra error | Confusión en desktop |
| 6 | Modo demo fuerza onboarding aunque el perfil demo ya está completo | Fricción innecesaria para testers |

---

### D. Post-registro — capa de guías (riesgo alto)

Secuencia actual en `App.tsx`:

1. **`ActivationGuide`** — modal “Tu rutina en 5 pasos”
2. Tras cerrar (~1,5 s): **`AppFeatureTour`** — 3 pasos (mapa, explore, live)
3. Hint one-time en Home: “Dos vistas en Hoy”
4. Banner PWA a los 3 s y 5 s

**Problema:** sensación de **modal sobre modal** antes de tocar la app. El tour no ancla visualmente la bottom nav (promete resaltar tabs pero es un modal centrado).

**Tab default:** app abre en **Hoy**, pero la bottom nav empieza visualmente en **Mapa** — pequeña desorientación.

---

### E. Tab Hoy — primera impresión dentro de la app

**Qué ve un usuario nuevo en “Mi día” (`DailyHome.tsx`):**

- Saludo + **HomeLoopStepper** (Live → Equipo → Sync → Meta)
- **PilotProgramStrip** (piloto Viña × Santiago)
- **CityDerbyCard** — *solo si hay datos* (`cityDerby` no null)
- Hero LIVE, Fuel, semana, equipo, sync, meta semanal, EntrenoLog, PRs, red local

**Funciona bien:**
- Loop principal claro con CTAs contextuales
- Empty state equipo → “Buscar gym partner”
- Sub-tab Muro con CTA “Sé el primero en {ciudad}”

**Problemas:**

| # | Problema |
|---|----------|
| 1 | **Demasiadas secciones en día 1** — Fuel, EntrenoLog, PRs compiten con “activa LIVE + explora” |
| 2 | **Derby invisible al inicio** si aún no hay agregación de minutos |
| 3 | Fuel pide setup sin haber sido introducido en onboarding ni ActivationGuide |

---

### F. Otras tabs — usuario sin red

| Tab | Empty state | CTA | Evaluación |
|-----|-------------|-----|------------|
| **Mapa (GymPulse)** | “Aún no hay nadie entrenando cerca” | Activar LIVE | ✅ Bueno; overlay derby si hay datos |
| **Explorar** | Deck vacío (cuenta real) | Invitar, waitlist, LIVE | ⚠️ Beta cerrada = frustración si auth prometió comunidad |
| **Matches** | Sin matches + guía 3 pasos | Ir a Explorar | ✅ |
| **Mensajes** | Explicativo | Sin botón a Explorar | ⚠️ Menor |
| **Squads** | Sin sesiones | — | ✅ Aceptable |
| **Perfil** | Modo progresivo 7 días | Secciones avanzadas colapsadas | ✅ Buena decisión |

**Derby en mapa (v0.1.298):** Región de Valparaíso vs Santiago (solo comuna), score por **índice/100k habitantes** — competitivo y justo. Bien para piloto costa vs capital.

---

### G. Mapa de fricciones — usuario nuevo real

```
Auth promete comunidad activa
        ↓
Onboarding largo + LIVE ON por defecto
        ↓
3 modales de guía seguidos
        ↓
Home denso (muchas cards)
        ↓
Explore / Mapa vacíos
        ↓
Usuario pregunta: "¿Dónde está todo el mundo?"
```

---

## Parte 2 — Inventario de lo que tenemos (v0.1.298)

### Loop core ✅

| Área | Estado | Archivos clave |
|------|--------|----------------|
| Mapa LIVE (MapLibre) | ✅ Prod | `GymPulseMap.tsx`, `gymPulseMapConfig.ts` |
| EntrenaSync / Arena | ✅ Extraído | `useArenaSyncController.ts`, `SyncArenaHost` |
| Derby regional | ✅ Deployed | `cityDerby.ts`, `CityDerbyCard`, overlay mapa |
| Piloto Viña × Santiago | ✅ | `pilotProgram.ts`, `pilotCohort.ts` |
| Verificación facial IA | ✅ | `VerificationFaceCapture`, CF `verifyIdentity` |
| Badge verificado en fotos | ✅ | `VerifiedProfilePhoto.tsx` |
| Story EntrenaSync branded | ✅ | `syncStoryShare.ts` |
| Chat + typing/read | ✅ | `chatPresence.ts` |
| CI (vitest + build + E2E) | ✅ | `.github/workflows/ci.yml` |
| Crashlytics nativo | ✅ | `crashReporting.ts` |

### Piloto instrumentado ✅

- Cohortes Firestore (`pilotCohort.ts`)
- Métricas sync ≥2 min (`pilotSyncMetrics.ts`)
- Scripts reporte: `pilot-cohort-report.mjs`, `pilot-sync-report.mjs`
- Waitlist ciudades (`cityWaitlist.ts`)

### Deuda técnica visible ⚠️

| Item | Estado |
|------|--------|
| `App.tsx` ~11.9k líneas | Monolito; extracción parcial |
| 9 archivos `@ts-nocheck` | Fase 76 incompleta |
| `versionCode` 296 vs `0.1.298` | Desalineado en Android |
| Docs obsoletos (`CURRENT_ROADMAP` 0.1.86, `P0_BETA` 0.1.147) | Riesgo de decisiones erróneas |
| FCM tokens | Stub en App |
| Health import | Stub |
| Marketplace MP producción | CF existe; checkout real incierto |

### Fase 100 — criterios operativos 🔄

| Criterio | Código | Validación real |
|----------|--------|-----------------|
| Crash-free >99% (7 días) | Instrumentado | **Pendiente medir** |
| ≥1 sync real/semana piloto | Wired | **Pendiente forzar con testers** |
| CI verde | ✅ | Automático |
| App.tsx <8k líneas | ❌ ~11.9k | Deuda |
| Retención D7 piloto | — | **Sin dashboard** |

---

## Parte 3 — Qué debemos mejorar (priorizado)

### 🔴 P0 — Primera sesión (antes de más testers)

Objetivo: que el usuario nuevo **entienda, confíe y haga 1 acción** en los primeros 10 minutos.

| # | Mejora | Por qué |
|---|--------|---------|
| 1 | **Quitar o dinamizar “142 live”** en auth | Confianza |
| 2 | **Unificar guías** en una sola secuencia (ActivationGuide OR tour, no ambos + PWA) | Menos fricción |
| 3 | **LIVE opt-in explícito** — no activar `trainingNow` automático al terminar onboarding | Privacidad + control |
| 4 | **Endurecer `isProfileComplete`** — exigir ciudad piloto, bio, tipos entreno, consentimientos | Evitar perfiles huecos |
| 5 | **Simplificar tab Hoy día 1** — Piloto → Derby → LIVE → Sync arriba; Fuel/EntrenoLog/PRs colapsados | Un solo foco |
| 6 | **Mostrar derby siempre** con estado “0 vs 0 — sé el primero” en lugar de ocultar card | Competencia visible desde día 1 |
| 7 | **Eliminar botón duplicado** “Cerrar sesión” / “Cambiar cuenta” | Parece bug |
| 8 | **Onboarding demo:** pre-rellenar + “Entrar ya” en modo prueba | Testers internos más rápidos |

### 🟠 P1 — Retención piloto (semanas 1–3)

Objetivo: **10–20 usuarios activos por ciudad**, ≥1 sync real/semana, D1 >40%.

| # | Mejora |
|---|--------|
| 9 | Push **“Tu rival te superó”** cuando cambia líder del derby (2×/semana) |
| 10 | CTA fin de semana: “Sábado LIVE” desde `PilotProgramStrip` + deep link mapa |
| 11 | Invitar 1 amigo como paso obligatorio del loop (share link piloto) |
| 12 | Ocultar marketplace/coach hasta 7 días o 2º sync |
| 13 | Script/dashboard **D1/D7** por cohorte (`pilot-cohort-report.mjs` ampliado) |
| 14 | QA matriz 2 dispositivos actualizada a v0.1.298 |
| 15 | AAB Play internal con `versionCode` 298 alineado |

### 🟡 P2 — Producto + técnico (post-piloto estable)

| # | Mejora |
|---|--------|
| 16 | Badge “Defensor de [ciudad]” al ganar derby semanal |
| 17 | Feature tour anclado a bottom nav (highlight real) |
| 18 | Quitar `@ts-nocheck` de `GymPulseMap.tsx` |
| 19 | Seguir extrayendo `App.tsx` (chat, notificaciones, squads) |
| 20 | E2E sync real 2 dispositivos (hoy solo mock en CI) |
| 21 | Mercado Pago producción — solo con ≥50 MAU sostenido |
| 22 | Actualizar/archivar docs obsoletos; crear `GESTION_FASES_101_120.md` |

---

## Parte 4 — Plan de fases a seguir

### Fase 101 — Primera impresión (1–2 semanas)

**DoD:**
- [ ] Auth sin números falsos; copy honesto para beta cerrada
- [ ] Una sola guía post-registro (max 3 pasos)
- [ ] LIVE no se activa solo al terminar onboarding
- [ ] `isProfileComplete` incluye ciudad + bio + tipos + consentimientos
- [ ] Tab Hoy día 1: máximo 4 bloques visibles
- [ ] Derby visible con estado cero
- [ ] Deploy v0.1.299+

### Fase 102 — Cierre operativo Fase 100 (paralelo, 1 semana)

**DoD:**
- [ ] AAB 0.1.298+ en Play internal (`versionCode` alineado)
- [ ] 2 testers: registro → LIVE → visible mapa → EntrenaSync ≥2 min
- [ ] Crashlytics 7 días >99%
- [ ] `pilot-sync-report.mjs` con ≥1 sesión real documentada
- [ ] `P0_BETA_RELEASE.md` actualizado a 0.1.298

### Fase 103 — Activación piloto (semanas 2–4)

**DoD:**
- [ ] ≥10 miembros por cohorte Viña y Santiago
- [ ] 1 sábado coordinado LIVE + invitación amigo
- [ ] Push derby implementado
- [ ] Reporte semanal D1/D7 automatizado
- [ ] Meta: ≥3 syncs reales/semana en cohorte

### Fase 104 — Competencia regional (semanas 4–6)

**DoD:**
- [ ] Derby con histórico semanal (quién ganó la semana pasada)
- [ ] Badge ganador ciudad/región
- [ ] Story share derby (“Valpo vs Stgo esta semana”)
- [ ] Copy piloto alineado con índice población (ya en v0.1.298)

### Fase 105 — Estabilidad y escala (6–8 semanas)

**DoD:**
- [ ] `App.tsx` <9k líneas (meta intermedia)
- [ ] 0 `@ts-nocheck` en mapa y explore
- [ ] FCM tokens en colección dedicada
- [ ] Decisión go/no-go segunda ciudad (Concepción u otra) con datos D7

### Fase 106 — Monetización (solo si piloto cumple)

**Criterios de entrada:** ≥50 MAU, crash-free >99%, D7 >25%, ≥10 syncs/semana agregados.

**DoD:**
- [ ] Mercado Pago checkout real
- [ ] EntrenaCoach dispatch con pin “en camino”
- [ ] Partner gym dashboard mínimo

---

## Parte 5 — Matriz impacto vs esfuerzo

```
                    ESFUERZO BAJO          ESFUERZO ALTO
                 ┌─────────────────────┬─────────────────────┐
IMPACTO ALTO     │ Quitar 142 live     │ Simplificar tab Hoy │
                 │ Unificar guías      │ Push derby          │
                 │ Derby estado cero   │ Dashboard D1/D7     │
                 │ versionCode fix     │ App.tsx extracción  │
                 ├─────────────────────┼─────────────────────┤
IMPACTO MEDIO    │ LIVE opt-in         │ E2E 2 dispositivos  │
                 │ isProfileComplete   │ Badge defensor      │
                 │ Ocultar MP/coach    │ MP producción       │
                 └─────────────────────┴─────────────────────┘
```

**Quick wins esta semana (≤2 días dev):** fila superior izquierda + LIVE opt-in + derby cero.

---

## Parte 6 — Checklist “usuario nuevo” para QA manual

Usar en cada release del piloto:

- [ ] Registro email → onboarding completo → llega a Hoy sin pantalla negra >15 s
- [ ] Ciudad piloto seleccionable; GPS opcional no bloquea
- [ ] Tras onboarding, usuario **no** está LIVE sin haberlo elegido explícitamente
- [ ] Máximo 1 modal de guía antes de interactuar
- [ ] CityDerbyCard visible (aunque 0–0)
- [ ] Mapa carga; overlay Valpo vs Santiago visible
- [ ] Explore: empty state con invitar/waitlist (cuenta real)
- [ ] Activar LIVE → aparece en mapa (2º dispositivo o cuenta test)
- [ ] EntrenaSync ≥2 min → minutos suman al derby
- [ ] Perfil muestra badge verificado solo si verificó
- [ ] Modo demo claramente etiquetado

---

## Documentos de referencia

| Usar ✅ | Archivar / actualizar ⚠️ |
|---------|--------------------------|
| `GESTION_FASES_1_100.md` | `CURRENT_ROADMAP_AND_NEXT_STEPS.md` (0.1.86) |
| `OPEN_BETA_INFORME.md` | `P0_BETA_RELEASE.md` (0.1.147) |
| `PILOTO_VINA_SANTIAGO.md` | `TODAY_TASKS_2026-06-05.md` |
| Este informe | `ROADMAP_30_FASES.md` (histórico) |

---

## Conclusión

EntrenaMatch **ya es usable para piloto cerrado**. El siguiente salto no es construir más, sino **pulir la primera hora del usuario**, **medir con rigor** y **empujar el loop LIVE → Sync → Derby** con 10–20 personas reales por ciudad.

**Siguiente acción recomendada:** Fase 101 (quick wins UX) en paralelo con Fase 102 (QA 2 dispositivos + métricas Play) — luego convocar un sábado de activación coordinada con el derby Valparaíso vs Santiago ya en producción.
