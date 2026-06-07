# Fuel AI — configuración y pruebas

Fuel AI calcula **TDEE + macros diarios** (perfil) y estima **kcal/P/C/G** de comidas por **texto o foto** vía Cloud Function `analyzeFood` (Gemini 2.0 Flash).

## Parámetros del perfil (`FuelSetupModal`)

| Campo | Valores | Efecto |
|-------|---------|--------|
| Peso / Altura / Edad / Género | números | BMR Mifflin-St Jeor |
| Objetivo | perder / mantener / músculo / subir peso | ±% sobre TDEE |
| Actividad | light → very_active | multiplicador 1.375–1.9 |
| Restricciones | texto opcional | guardado en `fuelProfiles/{uid}` |

Macros: ~30% proteína, 40% carbs, 30% grasa (ajuste en objetivo músculo/pérdida).

## Backend

| Recurso | Path / función |
|---------|----------------|
| Perfil | `fuelProfiles/{userId}` |
| Logs del día | `fuelLogs` (query: userId + date + createdAt) |
| Fotos | `fuel/{userId}/{timestamp}.jpg` (Storage) |
| IA | `analyzeFood` callable (us-central1) |

## Activar Gemini (producción)

1. Crear API key en [Google AI Studio](https://aistudio.google.com/apikey).
2. Desde el repo (PowerShell):

```powershell
$env:GEMINI_API_KEY = "AIza..."
.\scripts\setup-fuel-ai.ps1
```

O manualmente:

```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase deploy --only functions:analyzeFood,storage,firestore:indexes
```

Fallback legacy (deprecated): `firebase functions:config:set gemini.key="AIza..."`

Sin API key: la función devuelve estimación **heurística** (`source: heuristic`).

## Error: Gemini no responde / solo heurística local

Revisa logs: `firebase functions:log --only analyzeFood`

| Código / mensaje | Causa | Solución |
|------------------|-------|----------|
| **429 prepayment credits depleted** | Créditos de Google AI Studio agotados en el proyecto de la API key | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → nuevo proyecto o activar billing → nueva key `AIzaSy…` → `.\scripts\setup-fuel-ai.ps1 -ApiKey "..."` |
| **403 / invalid API key** | Key incorrecta o revocada | Crear key nueva en AI Studio |
| **Debes iniciar sesión** | Usuario en demo sin Firebase Auth | Login con Google/email (no demo rápido) |

La app ahora muestra un toast con el motivo exacto cuando Gemini falla.

## Checklist de prueba manual

- [ ] Login real (no demo)
- [ ] **Hoy** → Configurar Fuel → guardar perfil → target visible
- [ ] Registrar comida → **texto** "pollo con arroz" → macros cambian
- [ ] Registrar comida → **foto** → Analizar → tip IA + macros
- [ ] Guardar log → totales del día suben
- [ ] Opcional: publicar en muro → post `nutrition`
- [ ] Consola: sin `permission-denied` en `fuelLogs` / Storage `fuel/`

## Errores conocidos corregidos (v0.1.115)

- Storage rules bloqueaban `fuel/` → fotos fallaban en silencio
- Texto usaba solo heurística local → ahora llama `analyzeFood`
- `getFunctions` sin región → explícito `us-central1`
- Secret `GEMINI_API_KEY` en Cloud Functions v5
