# EntrenaMatch — Release interna v0.1.329

## Cambios principales

### Performance (S26 Ultra / lag)
- Perfiles: query por **ciudad** + límite **80** (antes 300 global).
- Muro: **1 listener global** de feed (antes 15+ por usuario).
- Comentarios: listeners solo en posts **visibles** del feed.
- Chat: máx. **5** listeners 1:1 (activo + recientes).
- LIVE: ya no parchea `realProfiles` en cada tick del mapa.
- LIVE fuera del mapa: throttle 2s en actualizaciones de estado.
- Overlay **PERF** en builds dev (contador de listeners).

### Muro Fase 3
- Comentarios **inline** (responder sin salir del feed).
- **X activos hoy** en header y strip de comunidad.

### Incluye trabajo previo local
- Wearables, borrado de cuenta, onboarding, sync streaks admin.

## Build nativo

```bat
npm run build:web:native
npm run android:build
```

## Play (alpha / prueba cerrada)

```bat
build-play-store.bat
publish-play.bat alpha
```

`versionCode` **329** · `versionName` **0.1.329**
