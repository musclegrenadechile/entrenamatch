# EntrenaMatch — Roadmap 356–360 (notificaciones + feed overlays + QA)

**Versión cierre:** v0.1.356 · **Estado:** ✅ jun 2026

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| 356 | `NotificationsPanel` | Drawer notificaciones fuera de App.tsx | ✅ |
| 357 | `HomeFeedOverlays` | Composer Muro + `FeedPhotoLightbox` global | ✅ |
| 358 | `relativeTime` + `p0BetaQaMatrix` | Util compartido + matriz QA 12 filas | ✅ |
| 359 | `notificationPanelMeta` | Iconos/estilos panel notificaciones | ✅ |
| 360 | Docs + bump + deploy | Play internal v0.1.356 | ✅ |

## Archivos nuevos

- `src/components/notifications/NotificationsPanel.tsx`
- `src/components/home/HomeFeedOverlays.tsx`
- `src/utils/relativeTime.ts`
- `src/utils/notificationPanelMeta.ts`
- `src/utils/p0BetaQaMatrix.ts`

## Próximo sprint (361+)

1. `useNotificationsState` — persistencia + addNotification fuera de App
2. Extracción `ProfileTab` overlays restantes
3. Piloto LIVE sábado (2 dispositivos)
4. Screenshots Play reales
5. QA manual `P0_BETA_RELEASE.md` en Samsung + segundo device
