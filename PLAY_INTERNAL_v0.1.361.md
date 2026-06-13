# Play Internal — v0.1.361

**Track:** internal · **versionCode:** 361 · **Fecha:** jun 2026

## Cambios

- **361** `useNotificationsState` — notificaciones + prefs + dedup centralizados
- **362** `FullProfileSheetMount` — sheet de perfil con métricas (~110 líneas menos en App)
- **363** `notificationGating` — util de prefs y duplicados
- **364** `livePilotChecklist` — checklist piloto LIVE sábado

## QA rápido (internal)

- [ ] Panel notificaciones respeta prefs (mensajes off → no nuevas)
- [ ] Tap notificación abre destino correcto
- [ ] Perfil completo desde mapa/explorar sin crash
- [ ] LIVE piloto 2 dispositivos (ver `livePilotChecklist.ts`)

## Publicar

```powershell
.\build-play-store.bat
.\publish-play.bat internal
```
