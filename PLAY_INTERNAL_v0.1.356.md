# Play Internal — v0.1.356

**Track:** internal · **versionCode:** 356 · **Fecha:** jun 2026

## Cambios

- **356** `NotificationsPanel` — drawer in-app extraído (~100 líneas menos en App.tsx)
- **357** `HomeFeedOverlays` + `FeedPhotoLightbox` — composer Muro modular
- **358** `getRelativeTime` compartido + matriz P0 QA (12 flujos)
- **359** `notificationPanelMeta` — iconos red/daily pulse

## QA rápido (internal)

- [ ] Panel notificaciones → tap abre chat / mapa / sync
- [ ] Publicar en Muro desde Home (texto + foto)
- [ ] Lightbox foto funciona en Home y Perfil
- [ ] Push `message_new` sigue abriendo chat

## Publicar

```powershell
.\build-play-store.bat
.\publish-play.bat internal
```

## Web

```powershell
npm run deploy
```
