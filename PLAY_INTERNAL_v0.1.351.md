# Play Internal — v0.1.351

**Track:** internal · **versionCode:** 351 · **Fecha:** jun 2026

## Cambios

- **351** `useNotificationRouter` — routing centralizado para push, deep links y panel de notificaciones
- **352** `FeedComposerModal` — modal del Muro extraído de App.tsx (~125 líneas menos)
- **353** Tests `team_live` / `team_sync` en pushNavigation
- **354** Checklist E2E sync 2 dispositivos (`e2eSyncScenarios`)

## QA rápido (internal)

- [ ] Push `message_new` abre chat 1:1
- [ ] Push `team_live` abre mapa + modal LIVE
- [ ] Publicar en Muro (texto + foto) desde Home
- [ ] Deep link `?push=1&userId=…` navega correctamente

## Publicar

```powershell
.\build-play-store.bat
.\publish-play.bat internal
```

## Web

```powershell
npm run deploy
```
