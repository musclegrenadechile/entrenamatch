# Play Internal — v0.1.377

**Track:** internal · **versionCode:** 377 · **Fecha:** jun 2026

## Cambios

- **377** Fix compartir Instagram — toast único con CTA **Compartir** (ya no compite con Fuel)
- **377** Botón 📸 Instagram en Muro aunque el post no tenga array `exercises`
- **377** Botón compartir en perfil propio (`FullProfileSheet`)
- **377** Copy EntrenaSync replays en español claro (`syncReplayCopy`)
- **376** `workoutStoryShare` — story 9:16 rutina para Instagram
- **376** Muro — 4 ejercicios visibles + caption en workout posts

## QA rápido (internal)

- [ ] Guardar Entreno de Hoy → toast con botón **Compartir** visible
- [ ] Compartir genera PNG y abre menú nativo / descarga
- [ ] Muro → post workout propio → botón 📸 Instagram
- [ ] Perfil propio → post workout → botón 📸 Instagram
- [ ] Replays EntrenaSync — títulos y modales legibles
- [ ] Regresión sync story + entreno modal

## Publicar

```powershell
.\build-play-store.bat
.\publish-play.bat internal
```
