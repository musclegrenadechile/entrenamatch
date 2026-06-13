# Play Internal — v0.1.345 (oleada 341–345)

**versionCode:** 345 · **versionName:** 0.1.345

## Release notes (user-facing)

- Fuel: gráfico semanal separa quema de **entreno** (verde) y **reloj** (violeta).
- Explorar: CTA al Mapa LIVE siempre visible, incluso con banner LIVE arriba.
- Spec screenshots Play actualizada (`assets/play-store/SCREENSHOTS_v0.1.345.md`).
- Pipeline Fuel extraído (`useFuelBalancePipeline`) — menos lógica en App.

## QA (5 min)

- [ ] Explorar con LIVE activo → botón verde Mapa visible
- [ ] Fuel → gráfico semana muestra segmento reloj si hay wearable
- [ ] Inicio días 1–3 → Copa Zona compacta
- [ ] Matches con sync → banner Crew opcional

## Build

```powershell
.\build-play-store.bat
```
