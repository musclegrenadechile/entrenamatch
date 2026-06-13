# Preparación de fase — Marketing & GTM (EntrenaMatch)

**Versión base:** v0.1.330 · **Meta cierre oleada:** v0.1.340  
**Fecha:** Junio 2026  
**Origen:** Revisión experto marketing (conversación jun 2026) + alineación visión inclusiva (todos los deportes, no solo gym)  
**Roadmap detalle:** `ROADMAP_FASES_MARKETING_331_340.md`  
**Orden de ejecución:** `ORDEN_ATAQUE_MARKETING.md`  
**DoD operativo:** `SISTEMA_IMPLEMENTACION_FASES.md` (misma regla: 1 fase = 1 bump = 1 deploy)

---

## 1. Diagnóstico (estado actual)

| Dimensión | Nota | Hallazgo clave |
|-----------|------|----------------|
| Propuesta de valor | 8.5/10 | EntrenaSync + Mapa LIVE es wedge real y vendible |
| Brand copy interno | 7.5/10 | `BRAND_COPY` unificado; vocabulario legacy (GymPulse, Leyenda) aún visible |
| Onboarding / activación | 6.5/10 | Formulario antes del “wow”; intro de 3 pilares desactivada |
| Retención / loops | 8/10 | Pacto, Copa Zona, Sync Hour — bien diseñados |
| Confianza / credibilidad | 5.5/10 | Landing con stats aspiracionales vs mapa vacío en beta |
| GTM readiness | 5.5/10 | Play desalineado; release notes técnicas; guía beta desactualizada |
| Audiencia | 8/10 | 18+, entreno serio, Chile — claro |
| **Inclusión deportes** | 6/10 | Discurso dice “lo que muevas”; onboarding solo lista gym/running/etc. |

**Veredicto:** producto con **historia de marca fuerte** y **ejecución GTM incompleta**. La oleada no añade features core — **alinea mensaje, producto y tienda** para que cualquier deportista (fútbol, pádel, rugby, running, gym…) se sienta invitado.

---

## 2. North Star de marca (acordado)

### Categoría
Red social del **movimiento en vivo** — no app de gym, no dating, no Strava.

### Mensaje hero (90 días)
> **La red donde ves quién entrena ahora cerca de ti — en la cancha, la pista o donde sea — y puedes conectar, chatear y sincronizar una sesión con EntrenaSync.**

### Reglas de copy
1. **Momento > deporte** — vender presencia en vivo + compañía + sesión compartida, no un deporte único.
2. **Ejemplos inclusivos** — fútbol, pádel, rugby, running, gym… como ilustración, no como definición.
3. **Nunca acotar a “tu gym”** en mensaje principal (válido solo en canal B2B gym como sub-mensaje).
4. **Honestidad beta** — piloto Viña × Santiago; sin métricas inventadas en landing/Play.
5. **Glossary único** — Mapa LIVE, Comunidad, EntrenaPartner, EntrenaSync (cero GymPulse/Leyenda visible).

### Tagline (mantener)
`Tu Comunidad en vivo` — funciona para cualquier deporte.

### Pitch corto (Play / ads)
`Encuentra quién entrena cerca, haz match y sincroniza sesiones con EntrenaSync.`

### Pitch largo (store / landing)
`Fútbol, pádel, gym, running, rugby… quien se mueve con intención cerca de ti, ahora. Conecta, chatea y entrena acompañado/a con EntrenaSync.`

---

## 3. Oleada Marketing — 10 fases (331 → 340)

| # | Fase | Versión | Entregable | P | Archivos clave |
|---|------|---------|------------|---|----------------|
| **331** | Mensaje inclusivo en `BRAND_COPY` | 0.1.331 | Actualizar pitch, explore, invites, activation con “cancha/pista/parque/club” + ejemplos multi-deporte | P0 | `src/constants/brandCopy.ts` |
| **332** | Glosario visible — cero legacy | 0.1.332 | Barrido user-facing: GymPulse → Mapa LIVE, Leyenda/Red ritual → Comunidad/EntrenaSync | P0 | `App.tsx`, componentes mapa/feed/perfil |
| **333** | Deportes en onboarding | 0.1.333 | Ampliar `TRAINING_OPTIONS`: Fútbol, Pádel, Rugby, Básquet, Tenis, Otro | P0 | `src/constants/index.ts`, `OnboardingFlow.tsx`, chips UI |
| **334** | Intro “Qué es” antes del formulario | 0.1.334 | Re-activar paso intro (3 pilares) en create flow; video/GIF opcional después | P1 | `OnboardingFlow.tsx` |
| **335** | Landing honesta | 0.1.335 | Quitar stats no verificables; copy piloto + CTA web/app; alinear colores naranja | P0 | `public/landing.html` |
| **336** | Play Store ES + assets spec | 0.1.336 | `PLAY_STORE_ASSETS.md` unificado ES; short/full description; prompts screenshots actuales | P0 | `assets/play-store/ASSETS.md`, `PLAY_OPEN_BETA.md` |
| **337** | Invites inclusivos | 0.1.337 | QR/share: “Invita a tu club / equipo / cancha”; `gymInvite` → copy neutro | P1 | `brandCopy.ts`, `GymInviteQrSheet`, referral cards |
| **338** | Guía embajadores (1 página) | 0.1.338 | `GUIA_EMBAJADORES.md` — qué decir en cancha/club/gym; no guía técnica | P1 | nuevo doc |
| **339** | Empty states inclusivos | 0.1.339 | Mapa, Explorar, Muro: “cancha, pista, costanera, club” además de gym | P1 | `brandCopy.ts`, `ExploreTab`, `HomeTab` |
| **340** | Release notes + QA marketing | 0.1.340 | Plantilla `PLAY_INTERNAL_vX` user-facing; checklist pre-upload Play | P2 | `PLAY_RELEASE_REGISTRY.md`, template |

---

## 4. Convención de versión (fases 331–340)

```
Fase N  →  0.1.N
Ejemplo: Fase 331 → 0.1.331 · versionCode 331
```

Archivos a bump **siempre juntos:**
- `package.json`
- `src/constants/index.ts` (`APP_VERSION`)
- `android/app/build.gradle`

Comando verificación:
```powershell
npm run version:check
```

---

## 5. Definition of Done — Marketing (extiende DoD estándar)

Además de test + build + deploy, cada fase marketing está ✅ solo si:

- [ ] Copy revisado en **español claro** (sin jerga dev: FTUE, seed, GymPulse)
- [ ] **No** métricas inventadas en textos user-facing nuevos
- [ ] Al menos **1 deporte de equipo** mencionado donde haya ejemplos (fútbol/pádel/rugby)
- [ ] `npm test` verde (si hay tests de copy: `brandCopy.test.ts`, `genderedCopy.test.ts`)
- [ ] Screenshot o nota en `PLAY_INTERNAL_v0.1.XXX.md` si la fase afecta Play
- [ ] Fila marcada ✅ en `ROADMAP_FASES_MARKETING_331_340.md`

---

## 6. Banco de copy listo para implementar (Fase 331)

### `BRAND_COPY.pitch` (propuesto)
```
Encuentra quién entrena cerca — fútbol, pádel, gym, running, rugby o lo que muevas — haz match y entrena acompañado/a con EntrenaSync.
```

### `BRAND_COPY.explore.emptyBody` (propuesto)
```
En {city} aún hay pocos perfiles. Invita a tu club, cancha o grupo — o activa LIVE para que te encuentren en el Mapa LIVE.
```

### `BRAND_COPY.gymInvite` → renombrar concepto a `invite` (propuesto)
```
title: 'Invita a tu equipo'
subtitle: 'Comparte el enlace — más gente en tu zona = más matches y EntrenaSync'
```

### Play short description (80 chars, propuesto)
```
Quien entrena cerca, ahora. Match, chat y EntrenaSync. Fútbol, pádel, gym y más. +18.
```

### Play full description — primer párrafo (propuesto)
```
EntrenaMatch es la red donde ves quién entrena ahora cerca de ti — en la cancha, la pista, el gym o la costanera — y puedes conectar con personas compatibles por deporte, horario e intensidad.

No es dating. Es entrenamiento en serio: Mapa LIVE, match por compatibilidad y EntrenaSync para moverse juntos con minutos que suman a tu Comunidad y la Copa Zona de tu región.

Piloto en Chile (Viña del Mar y Santiago). Beta cerrada.
```

### Landing hero sub (propuesto)
```
Fútbol, pádel, rugby, running, funcional… quien se mueve con intención cerca de ti, en este momento. Conecta y sincroniza con EntrenaSync.
```

### Landing social proof (propuesto — honesto)
```
Beta cerrada · Piloto Viña × Santiago · Sé de los primeros en tu zona
```
*(Reemplaza bloques con 3.2k matches / 4.9★ si no están auditados.)*

---

## 7. Qué NO hacer en esta oleada

| Evitar | Por qué |
|--------|---------|
| Nuevas features de producto (Fuel, marketplace, coach) | Desenfoca GTM |
| Campañas pagadas masivas | Sin densidad local primero |
| Mensaje “solo gym” en hero | Contradice visión inclusiva |
| Más tablas de deportes en nav | Ya hay suficiente superficie |
| Renombrar identificadores de código (`GymPulseMap`) | Solo copy user-facing en esta oleada |

---

## 8. Métricas de éxito (post fase 340)

| Métrica | Target piloto |
|---------|----------------|
| % usuarios que eligen deporte ≠ gym en onboarding | >25% en 30 días |
| Time to first LIVE desde registro | <3 min (sin empeorar) |
| Churn D1 por “no hay gente” (encuesta delete) | −20% vs baseline |
| Play listing coherente con app (audit manual) | 100% checklist |
| Strings user-facing con “GymPulse” | 0 |

---

## 9. Dependencias y bloqueos

| Bloqueo | Acción |
|---------|--------|
| Play API “health features” | Completar formulario Play Console antes de `publish-play.bat` |
| Screenshots reales | Capturar post-fase 332–333 (UI sin GymPulse) |
| Densidad local | Oleada marketing **no sustituye** seeding en clubes/canchas (ops paralelo) |

---

## 10. Comandos por fase

```powershell
# 1. Implementar entregable de la fase
# 2. Bump versión manual o:
#    (editar package.json, APP_VERSION, build.gradle → 0.1.XXX)

npm test
npm run build
npm run deploy                    # web Firebase
npm run version:check

# Si fase toca APK:
npm run build:web:native
.\publish-play.bat alpha          # tras health features OK
```

---

## 11. Documentos relacionados

| Documento | Uso |
|-----------|-----|
| `ROADMAP_FASES_MARKETING_331_340.md` | Tabla fases + estado ✅ |
| `ORDEN_ATAQUE_MARKETING.md` | Secuencia real de implementación |
| `src/constants/brandCopy.ts` | SSOT copy user-facing |
| `PLAY_RELEASE_REGISTRY.md` | Registro Play + bloqueos |
| `INFORME_PROBLEMA_COMUNICACION_USUARIOS_REALES.md` | Contexto histórico comunicación |
| `PILOTO_VINA_SANTIAGO.md` | Geo y cohorte piloto |

---

## 12. Próxima acción

**Empezar Fase 331** — mensaje inclusivo en `BRAND_COPY` + tests de strings si aplica.

Orden recomendado: ver `ORDEN_ATAQUE_MARKETING.md` (331 → 333 → 332 → 335 → 336 en paralelo ops Play).

---

*Documento de preparación — no implementa código. Ejecutar fases con el mismo ciclo PLAN → IMPLEMENT → TEST → BUMP → DEPLOY → DOC del resto del proyecto.*
