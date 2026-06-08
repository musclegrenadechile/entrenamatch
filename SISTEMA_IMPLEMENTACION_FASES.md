# Sistema de implementación de fases — EntrenaMatch

Playbook operativo para ejecutar las **40 fases (31–70)** de forma autónoma, repetible y desplegable.

---

## 1. Ciclo de vida de una fase

```
PLAN → BRANCH → IMPLEMENT → TEST → BUMP → DEPLOY → DOC → (COMMIT)
  │        │          │         │       │        │      │
  │        │          │         │       │        │      └─ Marcar ✅ en ROADMAP_40_FASES.md
  │        │          │         │       │        └─ firebase deploy
  │        │          │         │       └─ APP_VERSION + versionCode + package.json
  │        │          │         └─ vitest + qa:smoke + build (+ e2e si aplica)
  │        │          └─ Código mínimo, 1 objetivo claro
  │        └─ feat/fase-XX-slug (opcional)
  └─ Leer fase + dependencias en ROADMAP_40_FASES.md
```

**Regla de oro:** 1 fase = 1 PR/commit lógico = 1 deploy = 1 bump de patch (`0.1.161`, `0.1.162`, …).

---

## 2. Definition of Done (DoD)

Una fase está **✅** solo si cumple **todos**:

- [ ] Objetivo de la fase implementado y visible en UI o API
- [ ] Sin regresiones en flujos core (auth, live, explore, chat)
- [ ] `npm test` — todos los tests pasan
- [ ] `npm run qa:smoke` — versiones alineadas
- [ ] `npm run build` — tsc + vite OK
- [ ] Deploy Firebase (hosting ± functions ± rules ± indexes según fase)
- [ ] `ROADMAP_40_FASES.md` actualizado con versión en columna Estado
- [ ] Si la fase toca Android: `versionCode` incrementado en `android/app/build.gradle`

---

## 3. Archivos de versión (siempre juntos)

| Archivo | Campo |
|---------|-------|
| `package.json` | `"version"` |
| `src/constants/index.ts` | `APP_VERSION` |
| `android/app/build.gradle` | `versionCode`, `versionName` |

**Convención:** fase N → versión `0.1.(160 + (N - 30))`  
Ejemplo: fase 35 → `0.1.165`, code `165`.

---

## 4. Matriz: qué desplegar por área

| Área típica | Deploy |
|-------------|--------|
| Solo UI | `hosting` |
| Cloud Function nueva | `functions` |
| Reglas Firestore | `firestore:rules` |
| Índice nuevo | `firestore:indexes` |
| Push / scheduled | `functions` |
| Full release | `hosting,functions,firestore:rules,firestore:indexes` |

---

## 5. Checklist QA manual (5 min)

Ejecutar en [entrenamatch.web.app](https://entrenamatch.web.app) o preview local:

1. **Auth** — login o demo entra sin hang en boot
2. **Home** — toggle live ON/OFF responde
3. **Explore** — al menos 1 card swipe visible
4. **Messages** — lista carga; chat abre
5. **Perfil** — muro carga
6. **Fase específica** — verificar el cambio de la fase actual

---

## 6. Tests automáticos

| Comando | Cuándo |
|---------|--------|
| `npm test` | Siempre |
| `npm run qa:smoke` | Siempre pre-deploy |
| `npm run test:e2e` | Fases 64+ y regresión quincenal |
| `npm run version:check` | Si dudas de alineación |

### Añadir test unitario cuando:
- Nueva función pura en `services/` o `utils/`
- Lógica de scoring, fechas, push navigation

### Añadir E2E cuando:
- Fase toca auth, live, chat, checkout

---

## 7. Plantilla de commit

```
v0.1.XXX: fase NN — [título corto en español]

[1-2 oraciones del porqué, no lista de archivos]
```

Ejemplo:
```
v0.1.161: fase 31 — retirar chrome PRE-ALPHA

Elimina badge y modal beta para sensación de producto listo en open beta.
```

---

## 8. Script helper

```powershell
# Uso: node scripts/implement-phase.mjs 31
node scripts/implement-phase.mjs <numero_fase>
```

El script imprime:
- Versión target
- Archivos a bump
- Comandos deploy
- Línea exacta a marcar en roadmap

---

## 9. Roles del agente / dev autónomo

| Paso | Acción |
|------|--------|
| 1 | Leer fase + dependencias en `ROADMAP_40_FASES.md` |
| 2 | Buscar código existente (`grep` / explore) — no reimplementar |
| 3 | Diff mínimo — no mezclar 2 fases |
| 4 | Test + build |
| 5 | Deploy |
| 6 | Actualizar roadmap + informar versión |

---

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| App.tsx monolith | Fases 61–62 priorizan extracción incremental |
| Deploy MP sin token | Fase 38 no bloquea; MP setup manual documentado |
| E2E flaky | Credenciales test en `.env.e2e` (no commitear) |
| Índices Firestore | Desplegar indexes antes de query en prod |
| Regresión live | QA manual paso 2 siempre |

---

## 11. Métricas de éxito (post fase 70)

| Métrica | Target |
|---------|--------|
| Time to first live | &lt; 3 min desde registro |
| Boot success rate | &gt; 99% (&lt; 8s) |
| E2E smoke | login → live → chat verde |
| Crash-free sessions | &gt; 99.5% (Play Console) |
| D7 retention | baseline +20% vs v0.1.160 |

---

## 12. Documentos relacionados

- `REVISION_ENTRENAMATCH_v0.1.160.md` — diagnóstico UX
- `ROADMAP_30_FASES.md` — fases 1–30 ✅
- `ROADMAP_40_FASES.md` — fases 31–70
- `PLAY_OPEN_BETA.md` — checklist Play Store
