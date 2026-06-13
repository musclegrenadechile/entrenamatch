# Play Internal — v0.1.376

**Track:** internal · **versionCode:** 376 · **Fecha:** jun 2026

## Cambios

- **376** `workoutStoryShare` — story 9:16 rutina para Instagram
- **376** Muro — 4 ejercicios visibles + caption en workout posts
- **376** CTA Stories tras guardar Entreno de Hoy + en feed propio
- **376** `PostLiveShareBanner` — botón Story post-sesión LIVE

## QA rápido (internal)

- [ ] Guardar Entreno de Hoy → toast Story → compartir PNG
- [ ] Muro → post workout propio → botón Stories
- [ ] Muro → ver 4 ejercicios + caption sin expandir
- [ ] Post-LIVE banner → Story con minutos
- [ ] Regresión sync story + entreno modal

## Publicar

```powershell
.\build-play-store.bat
.\publish-play.bat internal
```
