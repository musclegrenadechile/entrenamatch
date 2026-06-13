# Play Internal — v0.1.348 (oleada 348–350)

**versionCode:** 348 · **versionName:** 0.1.348

## Release notes (user-facing)

- Explorar: botones PASAR y ENTRENAR funcionan correctamente.
- Red → Mensajes: shell más estable (menos regresiones en chat).
- Notas de voz: reproducción unificada en chat 1:1 y grupal.
- LIVE: sesiones caducan a las 3 h; admin puede apagar LIVE caducado.
- Health Connect: solo permisos de lectura necesarios (pasos, ejercicio, calorías, pulso).

## QA (5 min)

- [ ] Explorar → PASAR y ENTRENAR mueven la tarjeta
- [ ] Red → Mensajes → abrir chat → enviar texto
- [ ] Nota de voz en chat reproduce / pausa
- [ ] Mapa LIVE: contador coherente tras 3 h
- [ ] Wearable → Fuel importa calorías (opcional)

## Build

```powershell
.\build-play-store.bat
.\publish-play.bat internal
```
