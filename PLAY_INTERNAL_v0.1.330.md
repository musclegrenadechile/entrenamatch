# EntrenaMatch — Release interna v0.1.330

## Cambios principales

### Performance Fase 3
- **Leaflet fuera del bundle principal** — el mapa carga solo al abrir Explorar/Mapa.
- **Muro virtualizado** — solo monta posts visibles (menos lag al scroll).
- Chunk lazy `ExploreLivePanel` separado del `index.js`.

### Performance Fase 2 (incluido)
- Listeners por pestaña + pausa en background.
- Poll de perfiles reducido; feed más liviano.

### Fix gadget sesión activa
- Arrastrar el gadget naranja (Modo Entreno) ya no laggea — safe-area cacheada y drag por `requestAnimationFrame`.

### Otros
- Beta bots pausados en cliente (menos carga en mapa/feed).

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

`versionCode` **330** · `versionName` **0.1.330**
