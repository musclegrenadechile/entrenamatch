# Play Open Beta — EntrenaMatch (Fase 30)

## Checklist open beta

1. **Closed → Open** en Play Console → Testing → Open testing
2. Ejecutar `publish-play.bat open` (requiere track configurado en Play Console)
3. Completar listing **ES + EN** (ver abajo)
4. Política privacidad: URL pública en Play Console
5. QA matriz P0 en `P0_BETA_RELEASE.md`

## Listing EN (copy-paste)

**Title:** EntrenaMatch — Train Together

**Short description:** Live gym map, matches, EntrenaSync, coaches & fuel tracking.

**Full description:**
EntrenaMatch connects lifters in real time. Go LIVE on the map, match with training partners, run EntrenaSync sessions, join squads, book EntrenaCoach trainers, and track nutrition with Fuel AI. Built for Chile — Spanish-first, CLP payments via Mercado Pago.

## Listing ES

Ver `PLAY_STORE_ASSETS.md` para copy en español.

## Comandos

```powershell
npm run qa:smoke
npm run build
npm run test:e2e
publish-play.bat internal   # smoke APK/AAB
# Tras aprobación QA:
publish-play.bat open
firebase deploy --only hosting --project entrenamatch
```

## Versión mínima recomendada

v0.1.160+ con fases 11–30 del roadmap.
