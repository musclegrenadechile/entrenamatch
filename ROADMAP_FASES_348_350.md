# EntrenaMatch — Roadmap 348–350 (post-LIVE + Play hygiene)

**Versión cierre:** v0.1.348 · **Estado:** ✅ jun 2026

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| 348 | `RedMessagesPanel` | Shell Red → Mensajes (lista + ChatView) fuera de App.tsx | ✅ |
| 349 | `useChatVoicePlayer` | Reproducción notas de voz 1:1 + grupal unificada | ✅ |
| 350 | Docs + bump + deploy | `PLAY_INTERNAL_v0.1.348.md`, Play internal | ✅ |

## Completado en oleadas previas (346–347)

- LIVE hygiene (TTL 3 h, admin sweep, `liveSessionPolicy`)
- Health Connect: solo 5 permisos READ en manifest
- Fix botones PASAR / ENTRENAR en Explorar
- `adminModerateUser` desplegada

## Próximo sprint (351+)

1. `useNotificationRouter` — deep links push → tab/chat
2. Extracción feed composer / muro de App.tsx
3. E2E sync 2 dispositivos
4. Screenshots Play reales (ops)
5. QA matriz `P0_BETA_RELEASE.md` en 2 dispositivos
