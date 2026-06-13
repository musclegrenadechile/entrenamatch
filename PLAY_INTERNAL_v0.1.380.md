# Play Internal — v0.1.380

**Track:** internal · **versionCode:** 380 · **Fecha:** jun 2026

## Cambios

- **380** `FuelOverlaysMount` — wizard, setup avanzado y log modal extraídos de App.tsx
- **380** Hints del wizard Fuel memoizados (evita reset de paso al renderizar)
- **380** Registry overlays: `fuelWizard` + `fuelLog`
- **379** Fix scroll modal filtros Explorar

## QA rápido (internal)

- [ ] Sin perfil Fuel → abrir wizard desde Hoy → completar 3 pasos → guardar
- [ ] Wizard → “Configuración avanzada” → abre setup modal
- [ ] Registrar comida → Fuel log → guardar y opcional muro
- [ ] Editar comida del día → guardar cambios
- [ ] Filtros Explorar → scroll arriba/abajo + CTA fijo

## Publicar

```powershell
.\publish-play.bat internal
```
