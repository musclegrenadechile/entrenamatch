# Visual 2.0 — Piloto (oleadas 340–345)

**Live:** https://entrenamatch.web.app  
**Font:** Plus Jakarta Sans (global con `.em-visual-v2`)

## Qué cambió

| Oleada | Capa | Detalle |
|--------|------|---------|
| 340–341 | **Design system** | `src/styles/emVisualV2.css` — tokens, badges, cards, nav polish |
| 340–341 | **App shell** | `.em-visual-v2` en `app-container` (tipografía + nav) |
| 340–341 | **Explorar** | Card flagship, match ring glass, map CTA glow, botones swipe premium |
| **342** | **Top bar** | Glass + chip LIVE con glow, iconos unificados |
| **342** | **Hoy** | Hero «¿Quién entrena cerca?», CTA mapa, reto del día y bloque LIVE al sistema v2 |
| **343** | **Mapa LIVE** | Pills, overlays vacíos, leyenda, filtros y popups al sistema v2 |
| **344** | **Auth** | Plus Jakarta + card glass v2, chips con iconos Lucide |
| **345** | **Hoy + Perfil** | «Más de tu día» colapsable; fondo v2 en Perfil; landing `em-brand-*` |
| **346** | **Matches** | Cards premium una columna, match ring, Red sub-nav v2, crew dorado |
| **347** | **Entreno de Hoy** | Modal v2, biblioteca colapsable, «Más opciones», CTA gradiente |
| **348** | **Landing** | Tailwind build (`landing-v2.css`), Plus Jakarta, sin métricas fake |
| **349** | **Perfil** | Hero atleta compacto, tabs Actividad / Red / Ajustes, pulse + CTAs LIVE/Explorar |
| **350** | **Polish global** | `EmV2EmptyState`, skeletons shimmer, fade-in tabs perfil |
| **351** | **Nav + transiciones** | Bottom nav v2 por tab, `EmV2TabShell`, entrada animada entre tabs |

## Evaluar (3 min)

1. **Nav inferior** — ¿indicador + color por tab (mapa verde, matches rosa)?
2. **Cambio de tab** — ¿entrada suave Hoy ↔ Explorar ↔ Red?
3. **Mapa** — ¿fade sin glitch al abrir?
4. **Perfil tabs** — ¿fade-in al cambiar Actividad / Red / Ajustes?

## Siguiente

- Cohesión final: onboarding tour + activation guide al sistema v2

*jul 2026*