# Play Store Screenshots — v0.1.345

**Paleta:** naranja `#FF671F` · fondo `#0D0D10`  
**Regla:** cero texto “GymPulse” visible — solo **Mapa LIVE**, **Comunidad**, **EntrenaSync**.

## Capturas obligatorias (8)

| # | Pantalla | Qué debe verse |
|---|----------|----------------|
| 1 | **Mapa LIVE** | Pins verdes, leyenda colapsada, Copa Zona colapsada |
| 2 | **Explorar** | Swipe card con goals + CTA verde “Mapa LIVE” |
| 3 | **Match modal** | Compatibilidad + CTA chat |
| 4 | **Inicio — día 1** | Copa Zona compacta + Fuel con balance wearable |
| 5 | **EntrenaSync / Arena** | Sesión activa con acciones |
| 6 | **Muro** | Publicación en Comunidad |
| 7 | **Onboarding intro** | 3 pilares (Mapa LIVE, EntrenaSync, Comunidad) |
| 8 | **Perfil** | Wearable conectado + reto diario |

## Cómo capturar

```powershell
npm run build:web:native
npx cap sync android
# Emulador Pixel 6 o dispositivo Samsung — modo claro del sistema OFF
# Resolución mínima Play: 1080×1920 portrait
```

Guardar en `assets/play-store/screenshots/` como `01-mapa-live.png` … `08-perfil.png`.

## Feature graphic (1024×500)

Texto sugerido: **Tu Comunidad en vivo** · Fútbol, pádel, gym, running — Mapa LIVE + EntrenaSync.

## Checklist pre-upload

- [ ] Short description ES en `ASSETS.md`
- [ ] Sin métricas inventadas en imágenes
- [ ] +18 visible en al menos 1 captura (auth o perfil)
