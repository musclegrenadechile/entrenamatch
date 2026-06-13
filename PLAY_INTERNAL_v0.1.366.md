# Play Internal — v0.1.366

**Track:** internal · **versionCode:** 366 · **Fecha:** jun 2026

## Cambios

- **366** `TrainerCoachViewMount` — booking, dispatch, Mercado Pago handlers
- **367** `MarketplaceViewMount` — CRUD productos + checkout
- **368** `appOverlayRegistry` — 10 overlays globales documentados

## QA rápido (internal)

- [ ] Abrir EntrenaCoach desde Perfil → reservar / dispatch
- [ ] Marketplace → crear producto (admin) / checkout
- [ ] Sync desde booking EntrenaCoach
- [ ] Panel notificaciones + perfil completo (regresión)

## Publicar

```powershell
.\build-play-store.bat
.\publish-play.bat internal
```
