# Play Internal — v0.1.381

**Track:** internal · **versionCode:** 381 · **Fecha:** jun 2026

## Cambios

- **381** Registro/edición perfil: Chile, Perú, México y USA con selector país + ciudad
- **381** Filtros Explorar: edad 18–70, distancia sin límite por defecto
- **381** Orden Explorar: más cerca primero (tras red EntrenaSync)
- **380** FuelOverlaysMount — wizard, setup y log modal
- **379** Fix scroll modal filtros Explorar

## QA rápido (internal)

- [ ] Onboarding → elegir Perú/México/USA → ciudad → guardar perfil
- [ ] Editar perfil → cambiar país y ciudad
- [ ] Explorar → filtros por defecto muestran todos (100+ km)
- [ ] Sliders edad hasta 70 años
- [ ] Perfiles ordenados de más cerca a más lejos (con GPS)
- [ ] Fuel wizard + log modal siguen funcionando

## Publicar

```powershell
.\publish-play.bat internal
```
