# Orden de ataque — Marketing & GTM (Fases 331 → 340)

**Versión actual:** v0.1.330 · **Meta:** v0.1.340  
**Preparación:** `PREPARACION_FASE_MARKETING_GTM.md`

Secuencia de ejecución **real** (no necesariamente 331→340 numérico).  
Cada fila = 1 commit + bump + deploy web.

---

## Oleada 0 — Fundamentos de mensaje (Semana 1) · P0

| Orden | Fase | Versión | Entregable | Depende de |
|-------|------|---------|------------|------------|
| 1 | **331** | 0.1.331 | `BRAND_COPY` inclusivo multi-deporte | — |
| 2 | **333** | 0.1.333 | Deportes en `TRAINING_OPTIONS` + onboarding chips | 331 |
| 3 | **332** | 0.1.332 | Barrido glosario visible (GymPulse → Mapa LIVE) | 331 |

**Done cuando:** un usuario de pádel se registra, se identifica en chips, y no ve “GymPulse” en UI.

---

## Oleada 1 — Adquisición honesta (Semana 1–2) · P0

| Orden | Fase | Versión | Entregable | Depende de |
|-------|------|---------|------------|------------|
| 4 | **335** | 0.1.335 | Landing sin stats falsas + deportes en hero | 331 |
| 5 | **336** | 0.1.336 | Play Store ES + spec screenshots | 332, 335 |
| 6 | **339** | 0.1.339 | Empty states inclusivos | 331 |

**Done cuando:** landing + Play dicen lo mismo que la app; piloto honesto.

**Ops paralelo (no es fase código):** Play Console → Funciones de salud → `publish-play.bat alpha` con AAB v0.1.340+.

---

## Oleada 2 — Activación & viral (Semana 2) · P1

| Orden | Fase | Versión | Entregable | Depende de |
|-------|------|---------|------------|------------|
| 7 | **334** | 0.1.334 | Intro onboarding 3 pilares antes del form | 331 |
| 8 | **337** | 0.1.337 | Invites club/equipo/cancha | 331, 333 |
| 9 | **338** | 0.1.338 | `GUIA_EMBAJADORES.md` | 331, 337 |

**Done cuando:** embajador de club de rugby tiene guía de 1 página y link de invitación coherente.

---

## Oleada 3 — Cierre operativo (Semana 3) · P2

| Orden | Fase | Versión | Entregable | Depende de |
|-------|------|---------|------------|------------|
| 10 | **340** | 0.1.340 | Template release notes + checklist QA marketing | 331–339 |

**Done cuando:** próximo upload Play incluye notas “para humanos” y checklist verde.

---

## Paralelo ops (no bloquea fases 331–339)

| Tarea | Responsable | Notas |
|-------|-------------|-------|
| Play Console health features | Jorge | Bloquea API publish |
| Screenshots reales post-332 | Jorge/agente | 6 capturas: Hoy, Mapa, Explorar, Sync, Muro, Perfil |
| Seeding 1 cancha pádel + 1 club fútbol Viña | Ops piloto | Densidad > copy |
| `npm run bots:pause` en máquina con credenciales | Ops | Menos ruido en mapa |

---

## Checklist rápido pre-cada deploy marketing

```
[ ] pitch no dice solo "gym"
[ ] al menos 1 ejemplo deporte equipo en copy nuevo
[ ] sin GymPulse user-facing en diff
[ ] sin números inventados (matches, rating, live count)
[ ] npm test && npm run build
[ ] PLAY_INTERNAL_v0.1.XXX.md actualizado si sube Play
```

---

## Relación con otras oleadas

| Oleada | Convive con marketing |
|--------|----------------------|
| Perf (Fase 2–3, v0.1.329–330) | ✅ Completada — no mezclar en commits marketing |
| App.tsx split | Paralelo — no bloquea copy |
| Densidad piloto | **Crítico** — marketing sin gente = churn igual |

---

*Orden de ataque marketing — jun 2026.*
