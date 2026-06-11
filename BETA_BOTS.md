# Beta Bots — Personas de ambiente (15)

Personas con IA para que los beta testers no sientan la app vacía. **Marcadas como "Beta · Persona IA"** en el perfil.

## Fase 2 (activa)

| Fase | Qué hace |
|------|----------|
| **2A** | `livePresence` completo (foto, coords, tipos) + **GymSound** fijo por bot en mapa |
| **2B** | Comentarios en muro de **testers reales** + invitación **Sync** si bot y tester están LIVE en la misma zona |
| **2B+** | **Conversación entre bots** en el muro (comentario + ~35% respuesta) |
| **2C** | Horario Chile (pico 6–9 / 18–22), menos LIVE si hay ≥3 testers LIVE en la ciudad, métricas en `config/betaBots` |

## Qué hacen (resumen)

- Aparecen en **Explorar**, **mapa LIVE**, **muro global** y **matches**
- **Entrenan** y publican en el muro (Cloud Function cada 30 min)
- Activan **LIVE** con pin completo y música visible
- Comentan posts de testers y **entre ellos** (hilos en el feed)
- Invitan **Sync** por chat si coinciden LIVE en la misma región
- Dan **like** a posts de testers reales
- Si un tester les da **like → match automático** + mensaje de bienvenida
- **Chat**: responden con Gemini (personalidad por bot)

## Archivos

| Ruta | Uso |
|------|-----|
| `scripts/beta-bots/personas.json` | 15 personas + prompts fotográficos |
| `scripts/beta-bots/generate-photos.ps1` | Retratos con **Grok Imagine** |
| `scripts/beta-bots/seed-bots.mjs` | Auth + Storage + Firestore |
| `functions/betaBots.js` | Orquestación server-side |
| `src/utils/betaBots.ts` | Badge y helpers en la app |

## Setup (una vez)

### 1. Generar fotos realistas (Grok)

```powershell
cd C:\Users\muscl\fitvina
.\scripts\beta-bots\generate-photos.ps1
# o por lotes:
.\scripts\beta-bots\generate-photos.ps1 -From 1 -To 5
```

Usa `grok -p` con `image_gen` y guarda en `scripts/beta-bots/photos/beta_bot_XX_primary.png`.

### 2. Sembrar Firebase

```bash
node scripts/beta-bots/seed-bots.mjs --skip-auth
# vista previa (sin escrituras):
node scripts/beta-bots/seed-bots.mjs --dry-run --skip-auth
```

Sube fotos a Storage y escribe `profiles/` + `config/betaBots`. Los bots **no necesitan Firebase Auth** — actúan solo vía Cloud Functions (Admin SDK).

Opcional: sin `--skip-auth` crea usuarios Auth si tienes un service account con rol **Firebase Authentication Admin** (el de Play Store no sirve).

### 3. Desplegar Functions + rules

```bash
firebase deploy --only functions:betaBotTick,firestore:rules,storage
```

La lógica de chat y auto-match va en `onDirectMessageCreated` y `onLikeCreated` (ya integrada).

## Config (`config/betaBots`)

```json
{
  "enabled": true,
  "phase": 2,
  "batchSize": 3,
  "botBotSocialEnabled": true,
  "syncInviteEnabled": true,
  "lastTickAt": "...",
  "lastRealLiveByCity": { "Viña del Mar": 1 },
  "metrics": { "ticksTotal": 42 }
}
```

## Desactivar (pausa temporal — lag / perf)

**Rápido (recomendado):**

```bash
npm run bots:pause
```

Eso pone `config/betaBots.enabled = false`, apaga LIVE de los 15 bots y borra `livePresence/beta_bot_XX`.

**Cliente:** `BETA_BOTS_PAUSED = true` en `src/utils/betaBots.ts` oculta bots en mapa, muro y perfiles hasta reactivar.

**Reactivar:**

```bash
npm run bots:resume
# y en código: BETA_BOTS_PAUSED = false
```

Manual en Firestore: `config/betaBots` → `{ "enabled": false, "batchSize": 0 }`

Solo vida entre bots: `{ "botBotSocialEnabled": false }`

Solo invitaciones Sync: `{ "syncInviteEnabled": false }`

## Ética

- Badge visible en perfil
- No fingir identidad real ni citas románticas
- Solo cohorte beta; eliminar al abrir público

## UIDs

`beta_bot_01` … `beta_bot_15` — nunca mezclar con seeds locales `p1`, `p2`, etc.
