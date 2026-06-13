# Piloto visual v1 — EntrenaMatch (archivado)

> **Superseded:** La oleada visual v2 está implementada. Ver `OLEADA_VISUAL_V2.md`.  
> El flag `VISUAL_PILOT_V1` fue eliminado — los cambios del piloto son permanentes.

**Objetivo original:** Probar dirección de pulido UI antes de oleada completa.

---

## Qué cambia en el piloto (solo con flag `true`)

| Área | Antes | Piloto |
|------|-------|--------|
| **Explorar — card swipe** | ~300px alto, muchos badges, goals, teaser muro, texto 7–8px | ~380px alto, menos ruido, tipografía mín. 10px |
| **Perfil — header** | "Tu legado", "REAL • Firebase", "GymPulse Diario" | "Tu perfil", sin pill dev, "Reto diario" |
| **Bottom nav** | Labels 10px / 8px, 6 tabs si perfil completo | Labels 12px / 10px, **5 tabs** (Squads oculto en piloto) |
| **Barra superior LIVE** | Un pill 8px ilegible con todo junto | Chip legible + detalle opcional en segunda línea |
| **Toasts / modales feed** | "GymPulse", "Muro del GymPulse" | "Mapa LIVE", "Muro de la Comunidad" |
| **Hint "Dos vistas en Hoy"** | Aparece al entrar a Hoy | **Desactivado** en piloto (menos capas al entrar) |

---

## Cómo evaluarlo (5 min)

1. `npm run dev` o abre la web desplegada tras build.
2. **Explorar** — ¿la card se siente más “match app” y menos RPG?
3. **Perfil** — ¿el header se siente más limpio?
4. **Nav inferior** — ¿lees las etiquetas sin esfuerzo?
5. **Barra arriba** (si hay LIVE) — ¿entiendes el contador de un vistazo?

---

## Si te gusta → siguiente oleada visual

1. Barrido completo GymPulse/legado en toda la app  
2. Sistema de color semántico (tokens)  
3. Home día 1 con menos widgets  
4. Política de un solo FAB  
5. Screenshots Play alineados  

## Si no te gusta

```ts
// src/constants/visualPilot.ts
export const VISUAL_PILOT_V1 = false
```

Rebuild y vuelves al UI anterior en esas pantallas.

---

*v0.1.330+ · jun 2026*
