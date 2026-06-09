const functions = require('firebase-functions');
const { defineSecret } = require('firebase-functions/params');
const crypto = require('crypto');
const admin = require('firebase-admin');

const geminiApiKey = defineSecret('GEMINI_API_KEY');
const mercadopagoAccessToken = defineSecret('MERCADOPAGO_ACCESS_TOKEN');
const mercadopagoWebhookSecret = defineSecret('MERCADOPAGO_WEBHOOK_SECRET');

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/** Sync bonds + mutual matches — who gets "tu equipo está live" push. */
async function getTeamPartnerIds(uid, syncBonds) {
  const partnerIds = new Set(Object.keys(syncBonds || {}));

  try {
    const [asUser1, asUser2] = await Promise.all([
      db.collection('matches').where('user1', '==', uid).get(),
      db.collection('matches').where('user2', '==', uid).get(),
    ]);
    asUser1.forEach((doc) => {
      const d = doc.data() || {};
      if (d.user2) partnerIds.add(d.user2);
    });
    asUser2.forEach((doc) => {
      const d = doc.data() || {};
      if (d.user1) partnerIds.add(d.user1);
    });
  } catch (e) {
    console.warn('Match lookup for team push failed', uid, e);
  }

  partnerIds.delete(uid);
  return Array.from(partnerIds);
}

/** Squad mates — fixed crews get live/sync push too (Phase 4). */
async function getSquadMateIds(uid) {
  const mates = new Set();
  try {
    const snap = await db.collection('squads').where('members', 'array-contains', uid).limit(10).get();
    snap.forEach((doc) => {
      const members = (doc.data() || {}).members || [];
      members.forEach((m) => {
        if (m && m !== uid) mates.add(m);
      });
    });
  } catch (e) {
    console.warn('Squad lookup for push failed', uid, e);
  }
  return Array.from(mates);
}

/**
 * Trigger: profile live/sync change → FCM push to team only (bonds + matches).
 */
exports.notifyRedNetworkLiveOrSync = functions.firestore
  .document('profiles/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() || {};
    const after = change.after.data() || {};
    const uid = context.params.userId;

    const wentLive = before.trainingNow !== true && after.trainingNow === true;
    const startedSync = !before.trainingSyncWith && after.trainingSyncWith;

    if (!wentLive && !startedSync) {
      return null;
    }

    const [teamIds, squadMateIds] = await Promise.all([
      getTeamPartnerIds(uid, after.syncBonds || {}),
      getSquadMateIds(uid),
    ]);
    const partnerIds = [...new Set([...teamIds, ...squadMateIds])];
    if (partnerIds.length === 0) {
      console.log(`No team/squad partners for ${uid}, skipping push`);
      return null;
    }

    const name = after.name || 'Tu gym partner';
    const isSync = !!startedSync;
    const gymName = after.gymCheckIn && after.gymCheckIn.gymName ? after.gymCheckIn.gymName : null;

    const title = isSync
      ? `${name} activó EntrenaSync`
      : gymName
        ? `${name} está en ${gymName}`
        : `${name} está entrenando en vivo`;

    const body = isSync
      ? 'Tu equipo está en sync — únete desde Hoy o el mapa.'
      : gymName
        ? 'Alguien de tu red acaba de activar live en el gym. ¿Te sumas?'
        : 'Alguien de tu equipo acaba de activar live. ¿Te sumas?';

    const tokenPromises = partnerIds.map(async (partnerId) => {
      try {
        const tokenSnap = await db.collection('userPushTokens').doc(partnerId).get();
        if (tokenSnap.exists) {
          const data = tokenSnap.data();
          return data && data.token ? data.token : null;
        }
      } catch (e) {
        console.warn('Error reading token for', partnerId, e);
      }
      return null;
    });

    const tokens = (await Promise.all(tokenPromises)).filter(Boolean);

    if (tokens.length === 0) {
      console.log('No FCM tokens for team of', uid);
      return null;
    }

    const messages = tokens.map((token) => ({
      token,
      notification: { title, body },
      data: {
        type: isSync ? 'team_sync' : 'team_live',
        userId: uid,
        partnerName: name,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'network_activity',
          sound: 'default',
          color: '#FF671F',
        },
      },
    }));

    try {
      const response = await messaging.sendEach(messages);
      console.log(
        `Team push for ${uid} (live/sync): success=${response.successCount}, failure=${response.failureCount}`
      );
      response.responses.forEach((r, i) => {
        if (!r.success) {
          console.warn('FCM failure index', i, r.error && r.error.code);
        }
      });
    } catch (err) {
      console.error('Error sending team FCM:', err);
    }

    return null;
  });

const CITY_CHALLENGE_TARGET = 500;

async function collectFcmTokens(userIds) {
  const tokens = [];
  for (const uid of userIds) {
    try {
      const tokenSnap = await db.collection('userPushTokens').doc(uid).get();
      if (tokenSnap.exists) {
        const data = tokenSnap.data();
        if (data && data.token) tokens.push(data.token);
      }
    } catch (e) {
      console.warn('Token read failed', uid, e);
    }
  }
  return tokens;
}

/**
 * City weekly challenge completed → push all contributors (Phase 4).
 */
exports.onCityChallengeComplete = functions.firestore
  .document('cityWeeklyStats/{docId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() || {};
    const after = change.after.data() || {};
    const target = Number(after.targetMinutes) || CITY_CHALLENGE_TARGET;

    const wasDone = (before.totalMinutes || 0) >= target || before.completedAt;
    const nowDone = (after.totalMinutes || 0) >= target;
    if (wasDone || !nowDone) return null;

    await change.after.ref.set({ completedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

    const cityLabel = after.cityLabel || 'Tu ciudad';
    const title = `🏆 Reto completado en ${cityLabel}`;
    const body = `${target} min live+sync esta semana — la ciudad lo logró. ¡Sigue el momentum!`;

    let uids = [];
    try {
      const contribSnap = await change.after.ref.collection('contributors').limit(200).get();
      uids = contribSnap.docs.map((d) => d.id);
    } catch (e) {
      console.warn('contributors read failed', e);
    }

    if (uids.length === 0) return null;

    const tokens = await collectFcmTokens(uids);
    if (tokens.length === 0) {
      console.log('City challenge complete but no FCM tokens', context.params.docId);
      return null;
    }

    const messages = tokens.map((token) => ({
      token,
      notification: { title, body },
      data: {
        type: 'city_challenge_complete',
        cityLabel,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'network_activity',
          sound: 'default',
          color: '#FFD700',
        },
      },
    }));

    try {
      const response = await messaging.sendEach(messages);
      console.log(
        `City challenge push ${context.params.docId}: success=${response.successCount}, failure=${response.failureCount}`
      );
    } catch (err) {
      console.error('City challenge FCM error', err);
    }

    return null;
  });

function estimateFromDescription(text) {
  const t = String(text || '').toLowerCase();
  let kcal = 450;
  let label = String(text || 'Comida').slice(0, 60);
  if (t.includes('ensalada') || t.includes('verdura')) kcal = 280;
  else if (t.includes('pollo') || t.includes('pechuga')) kcal = 420;
  else if (t.includes('arroz') || t.includes('pasta')) kcal = 520;
  else if (t.includes('hamburg') || t.includes('pizza')) kcal = 750;
  else if (t.includes('batido') || t.includes('prote')) kcal = 320;
  else if (t.includes('desayuno') || t.includes('avena')) kcal = 380;
  const proteinG = Math.round((kcal * 0.28) / 4);
  const fatG = Math.round((kcal * 0.3) / 9);
  const carbsG = Math.round((kcal - proteinG * 4 - fatG * 9) / 4);
  return {
    kcal,
    proteinG,
    carbsG,
    fatG,
    label,
    tip: 'Estimación aproximada — no es consejo médico.',
    source: 'heuristic',
  };
}

function classifyGeminiError(status, errText) {
  const t = String(errText || '').toLowerCase();
  if (
    status === 429 &&
    (t.includes('credit') || t.includes('billing') || t.includes('prepayment') || t.includes('quota'))
  ) {
    return 'billing_depleted';
  }
  if (status === 429) return 'rate_limit';
  if (status === 403 || status === 401) return 'invalid_key';
  if (status === 400 && t.includes('api key')) return 'invalid_key';
  if (
    status === 404 &&
    (t.includes('no longer available') || t.includes('not found') || t.includes('is not found'))
  ) {
    return 'model_unavailable';
  }
  return 'unknown';
}

function geminiUserMessage(reason) {
  if (reason === 'billing_depleted') {
    return 'Créditos de Google AI Studio agotados. Crea una API key nueva en aistudio.google.com/apikey con billing activo.';
  }
  if (reason === 'invalid_key') {
    return 'API key inválida. Usa una key AIzaSy… de Google AI Studio y vuelve a ejecutar setup-fuel-ai.ps1';
  }
  if (reason === 'rate_limit') return 'Límite de requests Gemini — espera un minuto e intenta de nuevo.';
  if (reason === 'model_unavailable') {
    return 'Modelos Gemini desactualizados en el servidor. Actualiza la app o intenta en unos minutos.';
  }
  return 'Gemini no disponible ahora.';
}

/** Models to try (cheapest / free-tier friendly first). Updated for 2.5 — 2.0/1.5 retired. */
const GEMINI_FOOD_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
];

async function callGeminiModel(apiKey, model, parts, labelFallback) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 256,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    const reason = classifyGeminiError(res.status, errText);
    const err = new Error(`Gemini error ${res.status}: ${errText.slice(0, 200)}`);
    err.geminiReason = reason;
    err.geminiStatus = res.status;
    throw err;
  }
  const json = await res.json();
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in Gemini response');
  const parsed = JSON.parse(match[0]);
  return {
    kcal: Math.round(Number(parsed.kcal) || 400),
    proteinG: Math.round(Number(parsed.proteinG) || 30),
    carbsG: Math.round(Number(parsed.carbsG) || 40),
    fatG: Math.round(Number(parsed.fatG) || 12),
    label: String(parsed.label || labelFallback || 'Comida').slice(0, 80),
    tip: String(parsed.tip || 'Estimación IA — no es consejo médico.').slice(0, 200),
    source: 'gemini',
    geminiModel: model,
  };
}

async function callGeminiFoodAnalysis(apiKey, imageBase64, mealDescription, fuelContext) {
  const ctx = fuelContext && typeof fuelContext === 'object' ? fuelContext : null;
  let contextBlock = '';
  if (ctx) {
    const parts = [];
    if (ctx.goalLabel || ctx.goal) parts.push(`Objetivo: ${ctx.goalLabel || ctx.goal}`);
    if (ctx.targetKcal) parts.push(`Target diario: ${ctx.targetKcal} kcal, ${ctx.targetProteinG || '?'}g proteína`);
    if (typeof ctx.consumedKcal === 'number') {
      parts.push(`Ya consumido hoy: ${ctx.consumedKcal} kcal, ${ctx.consumedProteinG || 0}g proteína`);
    }
    if (typeof ctx.remainingKcal === 'number') {
      parts.push(`Quedan ~${ctx.remainingKcal} kcal y ~${ctx.remainingProteinG || 0}g proteína`);
    }
    if (typeof ctx.workoutBurnToday === 'number' && ctx.workoutBurnToday > 0) {
      parts.push(`Entreno hoy: +${ctx.workoutBurnToday} kcal gastadas`);
    }
    if (typeof ctx.liveBurnToday === 'number' && ctx.liveBurnToday > 0) {
      parts.push(`Live activo: +${ctx.liveBurnToday} kcal estimadas`);
    }
    if (ctx.adjustedTargetKcal && ctx.adjustedTargetKcal !== ctx.targetKcal) {
      parts.push(`Target ajustado post-entreno: ${ctx.adjustedTargetKcal} kcal`);
    }
    if (ctx.dominantMuscle) parts.push(`Grupo muscular dominante hoy: ${ctx.dominantMuscle}`);
    if (ctx.postWorkoutWindow) parts.push('Ventana post-entreno activa: prioriza proteína');
    if (ctx.restrictions) parts.push(`Restricciones: ${ctx.restrictions}`);
    if (parts.length) {
      contextBlock = `\nContexto del atleta (usa para el tip, no inventes alergias): ${parts.join('. ')}.`;
    }
  }

  const parts = [];
  if (mealDescription) {
    parts.push({
      text: `Estima macros de esta comida descrita en español: "${mealDescription}".${contextBlock} Responde SOLO JSON válido: {"kcal":number,"proteinG":number,"carbsG":number,"fatG":number,"label":string,"tip":string}. tip = consejo breve gym-friendly en español.`,
    });
  }
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    });
    parts.push({
      text: `Estima kcal y macros P/C/G de esta comida en español.${contextBlock} JSON only: {"kcal":number,"proteinG":number,"carbsG":number,"fatG":number,"label":string,"tip":string}. tip = consejo breve pre/post gym en español. No consejo médico.`,
    });
  }

  let lastErr = null;
  for (const model of GEMINI_FOOD_MODELS) {
    try {
      const result = await callGeminiModel(apiKey, model, parts, mealDescription || 'Comida');
      console.log('analyzeFood: Gemini OK model=', model);
      return result;
    } catch (err) {
      lastErr = err;
      console.warn('analyzeFood: model failed', model, err.message || err);
      // Billing depleted at project level — other models won't help
      if (err.geminiReason === 'billing_depleted') break;
    }
  }
  throw lastErr || new Error('All Gemini models failed');
}

/** Callable: photo or text → estimated macros (Gemini Vision if GEMINI_API_KEY set). */
exports.analyzeFood = functions
  .runWith({ secrets: [geminiApiKey], timeoutSeconds: 30, memory: '256MB' })
  .https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión.');
  }
  const imageBase64 = data && data.imageBase64 ? String(data.imageBase64) : '';
  const mealDescription = data && data.mealDescription ? String(data.mealDescription) : '';
  const fuelContext = data && data.fuelContext ? data.fuelContext : null;
  if (!imageBase64 && !mealDescription.trim()) {
    throw new functions.https.HttpsError('invalid-argument', 'Foto o descripción requerida.');
  }

  const apiKey =
    geminiApiKey.value() ||
    process.env.GEMINI_API_KEY ||
    (functions.config().gemini && functions.config().gemini.key) ||
    '';

  if (!apiKey) {
    console.warn('analyzeFood: GEMINI_API_KEY not configured — using heuristic fallback');
    return estimateFromDescription(mealDescription || 'Comida');
  }

  try {
    return await callGeminiFoodAnalysis(apiKey, imageBase64, mealDescription, fuelContext);
  } catch (err) {
    const reason = err.geminiReason || 'unknown';
    console.warn('Gemini food analysis failed, using heuristic', reason, err.message || err);
    const heuristic = estimateFromDescription(mealDescription || 'Comida con foto');
    return {
      ...heuristic,
      geminiBlockedReason: reason,
      geminiErrorMessage: geminiUserMessage(reason),
    };
  }
});

// ─── Identity verification (Gemini face match) ─────────────────────────────

const GEMINI_IDENTITY_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

function stripDataUrlPrefix(b64) {
  return String(b64 || '').replace(/^data:image\/\w+;base64,/, '');
}

async function fetchImageAsBase64(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch image ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get('content-type') || 'image/jpeg';
  return { mime, data: buf.toString('base64') };
}

async function fetchProfileImageAsBase64(profilePhotoUrl) {
  if (!profilePhotoUrl) throw new Error('no profile url');
  try {
    return await fetchImageAsBase64(profilePhotoUrl);
  } catch (fetchErr) {
    const pathMatch = String(profilePhotoUrl).match(/\/o\/([^?]+)/);
    if (!pathMatch) throw fetchErr;
    const filePath = decodeURIComponent(pathMatch[1]);
    const bucket = admin.storage().bucket();
    const [buf] = await bucket.file(filePath).download();
    return { mime: 'image/jpeg', data: buf.toString('base64') };
  }
}

function parseBoolField(parsed, ...keys) {
  for (const key of keys) {
    if (parsed[key] === true || parsed[key] === 'true') return true;
    if (parsed[key] === false || parsed[key] === 'false') return false;
  }
  return null;
}

function parseIdentityGeminiJson(raw) {
  const trimmed = String(raw || '').trim();
  const match = trimmed.match(/\{[\s\S]*\}/);
  let parsed;
  try {
    parsed = JSON.parse(match ? match[0] : trimmed);
  } catch {
    throw new Error('No JSON in Gemini identity response');
  }
  const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
  const samePerson = parseBoolField(parsed, 'samePerson', 'same_person', 'isSamePerson');
  const profileMatch = parseBoolField(parsed, 'profileMatch', 'profile_match');
  const selfieHasFace = parseBoolField(parsed, 'selfieHasFace', 'selfie_has_face', 'hasFace');
  return {
    samePerson: samePerson === true,
    confidence,
    profileMatch: profileMatch !== false,
    selfieHasFace: selfieHasFace !== false,
    idDocumentReadable: false,
    reason: String(parsed.reason || 'Sin detalle').slice(0, 280),
  };
}

async function callGeminiIdentity(apiKey, payload) {
  const { profileB64, profileMime, selfieB64, selfieMime, idB64, idMime, displayName, age } =
    payload;
  const contextLine = [
    displayName ? `Nombre perfil: ${displayName}` : null,
    typeof age === 'number' ? `Edad perfil: ${age}` : null,
  ]
    .filter(Boolean)
    .join('. ');

  const parts = [
    {
      text:
        'Verificación biométrica facial (app fitness). Imagen 1 = foto de perfil. Imagen 2 = selfie en vivo. ' +
        '¿Es la MISMA persona? Compara rasgos faciales (ojos, nariz, mandíbula, forma de cara). ' +
        (contextLine ? `${contextLine}. ` : '') +
        'Ignora pelo distinto, barba, gafas, maquillaje, ropa, fondo e iluminación. ' +
        'selfieHasFace=false solo si no hay rostro humano nítido. ' +
        'samePerson=true si los rasgos coinciden razonablemente aunque el ángulo o luz cambien. ' +
        'confidence 0-1 (0.7+ = muy probable misma persona). reason en español, breve.',
    },
    { inline_data: { mime_type: profileMime || 'image/jpeg', data: profileB64 } },
    { inline_data: { mime_type: selfieMime || 'image/jpeg', data: selfieB64 } },
  ];
  if (idB64) {
    parts.push({ inline_data: { mime_type: idMime || 'image/jpeg', data: idB64 } });
  }

  let lastErr = null;
  for (const model of GEMINI_IDENTITY_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 384,
            thinkingConfig: { thinkingBudget: 0 },
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                samePerson: { type: 'boolean' },
                confidence: { type: 'number' },
                profileMatch: { type: 'boolean' },
                selfieHasFace: { type: 'boolean' },
                reason: { type: 'string' },
              },
              required: ['samePerson', 'confidence', 'profileMatch', 'selfieHasFace', 'reason'],
            },
          },
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        const reason = classifyGeminiError(res.status, errText);
        const err = new Error(`Gemini identity ${res.status}`);
        err.geminiReason = reason;
        throw err;
      }
      const json = await res.json();
      const raw = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = parseIdentityGeminiJson(raw);
      return { ...parsed, source: 'gemini', geminiModel: model };
    } catch (err) {
      lastErr = err;
      console.warn('verifyIdentity: model failed', model, err.message || err);
      if (err.geminiReason === 'billing_depleted') break;
    }
  }
  throw lastErr || new Error('All Gemini identity models failed');
}

exports.verifyIdentity = functions
  .runWith({ secrets: [geminiApiKey], timeoutSeconds: 45, memory: '512MB' })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión.');
    }
    const uid = context.auth.uid;
    const selfieBase64 = data && data.selfieBase64 ? String(data.selfieBase64) : '';
    if (!selfieBase64.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'Selfie requerida.');
    }

    let profileB64 = data && data.profilePhotoBase64 ? stripDataUrlPrefix(data.profilePhotoBase64) : '';
    let profileMime = 'image/jpeg';
    const profilePhotoUrl = data && data.profilePhotoUrl ? String(data.profilePhotoUrl) : '';
    if (!profileB64 && profilePhotoUrl) {
      try {
        const fetched = await fetchProfileImageAsBase64(profilePhotoUrl);
        profileB64 = fetched.data;
        profileMime = fetched.mime.split(';')[0] || 'image/jpeg';
      } catch (e) {
        console.warn('verifyIdentity: profile fetch failed', e.message || e);
      }
    } else if (profileB64) {
      profileB64 = stripDataUrlPrefix(profileB64);
    }

    if (!profileB64) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Necesitas al menos una foto de perfil para comparar con tu selfie.'
      );
    }

    const selfieB64 = stripDataUrlPrefix(selfieBase64);
    const idPhotoBase64 = data && data.idPhotoBase64 ? stripDataUrlPrefix(data.idPhotoBase64) : '';
    const displayName = data && data.displayName ? String(data.displayName).slice(0, 80) : '';
    const age = data && typeof data.age === 'number' ? data.age : null;

    const apiKey =
      geminiApiKey.value() ||
      process.env.GEMINI_API_KEY ||
      (functions.config().gemini && functions.config().gemini.key) ||
      '';

    if (!apiKey) {
      const fallback = {
        samePerson: false,
        confidence: 0,
        profileMatch: false,
        selfieHasFace: true,
        idDocumentReadable: !!idPhotoBase64,
        reason: 'IA no configurada — revisión manual pendiente.',
        source: 'unavailable',
        geminiErrorMessage: 'GEMINI_API_KEY no configurada en el servidor.',
      };
      await db
        .collection('identityVerifications')
        .doc(uid)
        .collection('attempts')
        .add({ at: Date.now(), ...fallback });
      return fallback;
    }

    try {
      const result = await callGeminiIdentity(apiKey, {
        profileB64,
        profileMime,
        selfieB64,
        selfieMime: 'image/jpeg',
        idB64: idPhotoBase64 || null,
        idMime: 'image/jpeg',
        displayName,
        age,
      });
      console.info('verifyIdentity verdict', {
        uid,
        samePerson: result.samePerson,
        confidence: result.confidence,
        profileMatch: result.profileMatch,
        selfieHasFace: result.selfieHasFace,
        model: result.geminiModel,
      });
      await db
        .collection('identityVerifications')
        .doc(uid)
        .collection('attempts')
        .add({
          at: Date.now(),
          samePerson: result.samePerson,
          confidence: result.confidence,
          profileMatch: result.profileMatch,
          selfieHasFace: result.selfieHasFace,
          source: result.source,
          geminiModel: result.geminiModel,
        });
      return result;
    } catch (err) {
      const reason = err.geminiReason || 'unknown';
      console.warn('verifyIdentity failed', reason, err.message || err);
      const fallback = {
        samePerson: false,
        confidence: 0,
        profileMatch: false,
        selfieHasFace: true,
        idDocumentReadable: !!idPhotoBase64,
        reason: 'No pudimos analizar las fotos ahora — quedó en revisión manual.',
        source: 'unavailable',
        geminiErrorMessage: geminiUserMessage(reason),
      };
      await db
        .collection('identityVerifications')
        .doc(uid)
        .collection('attempts')
        .add({ at: Date.now(), ...fallback, geminiBlockedReason: reason });
      return fallback;
    }
  });

// ─── EntrenaCoach Fase 2 ───────────────────────────────────────────────────

const TRAINER_PLATFORM_FEE_RATE = 0.15;

async function readFcmToken(uid) {
  try {
    const snap = await db.collection('userPushTokens').doc(uid).get();
    if (snap.exists) {
      const data = snap.data();
      return data && data.token ? data.token : null;
    }
  } catch (e) {
    console.warn('FCM token read failed', uid, e);
  }
  return null;
}

async function sendPushToUser(uid, { title, body, data }) {
  const token = await readFcmToken(uid);
  if (!token) {
    console.log('No FCM token for', uid);
    return false;
  }
  try {
    await messaging.send({
      token,
      notification: { title, body },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      android: {
        priority: 'high',
        notification: {
          channelId: 'entrenacoach',
          sound: 'default',
          color: '#6366f1',
        },
      },
    });
    return true;
  } catch (err) {
    console.warn('FCM send failed', uid, err.message || err);
    return false;
  }
}

function formatBookingWhen(scheduledAt) {
  try {
    return new Date(scheduledAt).toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return 'próximamente';
  }
}

/** Nueva reserva → push al entrenador. */
exports.onTrainerBookingCreated = functions.firestore
  .document('trainerBookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const b = snap.data() || {};
    const trainerId = b.trainerId;
    if (!trainerId) return null;

    const when = formatBookingWhen(b.scheduledAt);
    await sendPushToUser(trainerId, {
      title: '🏋️ Nueva solicitud EntrenaCoach',
      body: `${b.clientName || 'Un cliente'} quiere entrenar contigo — ${when}`,
      data: {
        type: 'trainer_booking_new',
        bookingId: context.params.bookingId,
        clientId: b.clientId || '',
      },
    });
    return null;
  });

/** Cambio de estado → push a la otra parte. */
exports.onTrainerBookingUpdated = functions.firestore
  .document('trainerBookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() || {};
    const after = change.after.data() || {};
    if (before.status === after.status) return null;

    const bookingId = context.params.bookingId;
    const when = formatBookingWhen(after.scheduledAt);

    if (after.status === 'accepted') {
      await sendPushToUser(after.clientId, {
        title: '✅ Sesión confirmada',
        body: `${after.trainerName || 'Tu entrenador'} aceptó — ${when}`,
        data: { type: 'trainer_booking_update', bookingId, status: 'accepted' },
      });
    } else if (after.status === 'declined') {
      await sendPushToUser(after.clientId, {
        title: 'Reserva no disponible',
        body: `${after.trainerName || 'El entrenador'} no pudo confirmar la sesión.`,
        data: { type: 'trainer_booking_update', bookingId, status: 'declined' },
      });
    } else if (after.status === 'paid_card') {
      await sendPushToUser(after.trainerId, {
        title: '💳 Pago recibido',
        body: `Pago con tarjeta confirmado — ${after.clientName || 'cliente'}.`,
        data: { type: 'trainer_booking_update', bookingId, status: 'paid_card' },
      });
    }
    return null;
  });

/** Reseña con bookingId → rating agregado en trainerProfiles (seguro, server-side). */
exports.onTrainingReviewForBooking = functions.firestore
  .document('trainingReviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const data = snap.data() || {};
    const bookingId = data.bookingId;
    const profileId = data.profileId;
    if (!bookingId || !profileId) return null;

    const bookingRef = db.collection('trainerBookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) return null;
    const booking = bookingSnap.data() || {};

    if (booking.clientId !== data.reviewerId) {
      console.warn('Review reviewer is not booking client', bookingId);
      return null;
    }

    const rating = Number(data.rating) || 5;
    const profileRef = db.collection('trainerProfiles').doc(profileId);

    await db.runTransaction(async (tx) => {
      const profileSnap = await tx.get(profileRef);
      if (!profileSnap.exists) return;
      const p = profileSnap.data() || {};
      const prevCount = Number(p.reviewCount) || 0;
      const prevAvg = Number(p.avgRating) || 0;
      const count = prevCount + 1;
      const avg = (prevAvg * prevCount + rating) / count;
      tx.update(profileRef, {
        avgRating: Math.round(avg * 10) / 10,
        reviewCount: count,
        updatedAt: Date.now(),
      });
      tx.update(bookingRef, {
        reviewId: context.params.reviewId,
        updatedAt: Date.now(),
      });
    });

    return null;
  });

function getMpAccessToken() {
  try {
    const fromSecret = mercadopagoAccessToken.value();
    if (fromSecret && String(fromSecret).length > 8) return String(fromSecret);
  } catch (_) {
    /* secret not bound on this function */
  }
  return (
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    (functions.config().mercadopago && functions.config().mercadopago.access_token) ||
    ''
  );
}

function getMpWebhookSecret() {
  try {
    const fromSecret = mercadopagoWebhookSecret.value();
    if (fromSecret && String(fromSecret).length > 8) return String(fromSecret);
  } catch (_) {
    /* secret not bound on this function */
  }
  return process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
}

function parseMpSignatureHeader(header) {
  const out = { ts: '', v1: '' };
  if (!header) return out;
  String(header)
    .split(',')
    .forEach((part) => {
      const eq = part.indexOf('=');
      if (eq <= 0) return;
      const key = part.slice(0, eq).trim();
      const val = part.slice(eq + 1).trim();
      if (key === 'ts') out.ts = val;
      if (key === 'v1') out.v1 = val;
    });
  return out;
}

function extractMpWebhookDataId(req) {
  let dataId = req.query && req.query['data.id'] ? String(req.query['data.id']) : '';
  if (!dataId && req.body && req.body.data && req.body.data.id) {
    dataId = String(req.body.data.id);
  }
  if (!dataId && req.query && req.query.id) {
    dataId = String(req.query.id);
  }
  if (dataId && /^[a-z0-9-]+$/i.test(dataId)) {
    dataId = dataId.toLowerCase();
  }
  return dataId;
}

/** Valida x-signature HMAC-SHA256 según docs Mercado Pago. */
function verifyMercadoPagoWebhook(req, secret) {
  if (!secret) return { ok: true, skipped: true };

  const xSignature = req.headers['x-signature'] || req.headers['X-Signature'];
  const xRequestId = req.headers['x-request-id'] || req.headers['X-Request-Id'];
  const { ts, v1 } = parseMpSignatureHeader(xSignature);
  if (!v1) return { ok: false, reason: 'missing x-signature v1' };

  const dataId = extractMpWebhookDataId(req);
  const manifestParts = [];
  if (dataId) manifestParts.push(`id:${dataId}`);
  if (xRequestId) manifestParts.push(`request-id:${xRequestId}`);
  if (ts) manifestParts.push(`ts:${ts}`);
  const manifest = manifestParts.length ? `${manifestParts.join(';')};` : '';

  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  try {
    const a = Buffer.from(v1, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length) return { ok: false, reason: 'signature mismatch' };
    if (!crypto.timingSafeEqual(a, b)) return { ok: false, reason: 'signature mismatch' };
  } catch (_) {
    return { ok: false, reason: 'signature compare failed' };
  }
  return { ok: true };
}

async function assertMarketplaceAdmin(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Inicia sesión.');
  }
  const adminSnap = await db.collection('marketplaceAdmins').doc(context.auth.uid).get();
  if (!adminSnap.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Solo marketplaceAdmins.');
  }
}

/** Callable: crea preferencia MP para booking completado (tarjeta). */
exports.createTrainerMpCheckout = functions
  .runWith({ secrets: [mercadopagoAccessToken], timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Inicia sesión.');
    }
    const bookingId = data && data.bookingId ? String(data.bookingId) : '';
    if (!bookingId) {
      throw new functions.https.HttpsError('invalid-argument', 'bookingId requerido.');
    }

    const bookingRef = db.collection('trainerBookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Reserva no encontrada.');
    }
    const booking = bookingSnap.data() || {};

    if (booking.clientId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Solo el cliente puede pagar.');
    }
    if (booking.paymentMethod !== 'card') {
      throw new functions.https.HttpsError('failed-precondition', 'Esta reserva no es pago con tarjeta.');
    }
    if (booking.status !== 'completed' && booking.status !== 'paid_card') {
      throw new functions.https.HttpsError('failed-precondition', 'Marca la sesión como completada antes de pagar.');
    }
    if (booking.status === 'paid_card') {
      throw new functions.https.HttpsError('already-exists', 'Esta sesión ya está pagada.');
    }

    const priceClp = Math.round(Number(booking.priceClp) || 0);
    if (priceClp < 1000) {
      throw new functions.https.HttpsError('invalid-argument', 'Monto inválido.');
    }

    const platformFeeClp = Math.round(priceClp * TRAINER_PLATFORM_FEE_RATE);
    const token = getMpAccessToken();

    if (!token) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Pagos con tarjeta procesados por EntrenaMatch. El checkout no está disponible temporalmente.'
      );
    }

    const projectId = process.env.GCLOUD_PROJECT || 'entrenamatch';
    const notificationUrl = `https://us-central1-${projectId}.cloudfunctions.net/mercadoPagoWebhook`;

    const prefBody = {
      items: [
        {
          title: `EntrenaCoach — ${booking.trainerName || 'Entrenador'}`,
          quantity: 1,
          currency_id: 'CLP',
          unit_price: priceClp,
        },
      ],
      external_reference: bookingId,
      metadata: {
        bookingId,
        trainerId: booking.trainerId,
        clientId: booking.clientId,
        platformFeeClp: String(platformFeeClp),
      },
      notification_url: notificationUrl,
      statement_descriptor: 'ENTRENAMATCH',
      back_urls: {
        success: 'https://entrenamatch.web.app',
        failure: 'https://entrenamatch.web.app',
        pending: 'https://entrenamatch.web.app',
      },
      auto_return: 'approved',
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prefBody),
    });

    if (!mpRes.ok) {
      const errText = await mpRes.text();
      console.error('MP preference failed', mpRes.status, errText.slice(0, 300));
      throw new functions.https.HttpsError('internal', 'No se pudo crear el checkout de Mercado Pago.');
    }

    const pref = await mpRes.json();
    const initPoint = pref.init_point || pref.sandbox_init_point;
    if (!initPoint) {
      throw new functions.https.HttpsError('internal', 'Respuesta MP sin init_point.');
    }

    await bookingRef.update({
      mpPreferenceId: pref.id,
      platformFeeClp,
      updatedAt: Date.now(),
    });

    return {
      initPoint,
      preferenceId: pref.id,
      platformFeeClp,
    };
  });

/** Webhook Mercado Pago — confirma paid_card en trainerBookings. */
exports.mercadoPagoWebhook = functions
  .runWith({ secrets: [mercadopagoAccessToken, mercadopagoWebhookSecret] })
  .https.onRequest(async (req, res) => {
  try {
    const webhookSecret = getMpWebhookSecret();
    const sigCheck = verifyMercadoPagoWebhook(req, webhookSecret);
    if (!sigCheck.ok) {
      console.warn('MP webhook: invalid signature', sigCheck.reason);
      res.status(401).send('invalid signature');
      return;
    }

    let paymentId = extractMpWebhookDataId(req);

    if (!paymentId) {
      res.status(200).send('ok');
      return;
    }

    const token = getMpAccessToken();
    if (!token) {
      console.warn('MP webhook: no access token configured');
      res.status(200).send('ok');
      return;
    }

    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!payRes.ok) {
      console.warn('MP payment fetch failed', payRes.status);
      res.status(200).send('ok');
      return;
    }

    const payment = await payRes.json();
    if (payment.status !== 'approved') {
      res.status(200).send('ok');
      return;
    }

    const refId =
      payment.external_reference ||
      (payment.metadata && payment.metadata.booking_id) ||
      (payment.metadata && payment.metadata.bookingId) ||
      (payment.metadata && payment.metadata.order_id);

    if (!refId) {
      console.warn('MP webhook: no reference in payment', paymentId);
      res.status(200).send('ok');
      return;
    }

    const refStr = String(refId);

    const bookingRef = db.collection('trainerBookings').doc(refStr);
    const bookingSnap = await bookingRef.get();
    if (bookingSnap.exists) {
      const booking = bookingSnap.data() || {};
      const priceClp = Math.round(Number(booking.priceClp) || 0);
      const platformFeeClp =
        typeof booking.platformFeeClp === 'number'
          ? Math.round(booking.platformFeeClp)
          : Math.round(priceClp * TRAINER_PLATFORM_FEE_RATE);
      const trainerNetClp = Math.max(0, priceClp - platformFeeClp);
      const now = Date.now();
      await bookingRef.update({
        status: 'paid_card',
        mpPaymentId: String(paymentId),
        platformFeeClp,
        trainerNetClp,
        payoutStatus: 'pending',
        paidAt: now,
        updatedAt: now,
      });
      console.log('MP webhook: booking paid', refStr, paymentId);
      res.status(200).send('ok');
      return;
    }

    const orderRef = db.collection('marketplaceOrders').doc(refStr);
    const orderSnap = await orderRef.get();
    if (orderSnap.exists) {
      await orderRef.update({
        status: 'paid',
        mpPaymentId: String(paymentId),
        paidAt: Date.now(),
        updatedAt: Date.now(),
      });
      console.log('MP webhook: marketplace order paid', refStr, paymentId);
      res.status(200).send('ok');
      return;
    }

    console.warn('MP webhook: reference not found', refStr, paymentId);
    res.status(200).send('ok');
  } catch (err) {
    console.error('mercadoPagoWebhook error', err);
    res.status(500).send('error');
  }
});

// ─── EntrenaCoach Fase 3 — Uber-mode dispatch ────────────────────────────────

const DISPATCH_OFFER_MS = 90000;

function formatClp(amount) {
  try {
    return `$${Math.round(Number(amount) || 0).toLocaleString('es-CL')} CLP`;
  } catch {
    return `$${amount} CLP`;
  }
}

/** Ofrece la solicitud al siguiente entrenador candidato (o cierra sin match). */
async function offerToNextTrainer(dispatchRef, data) {
  const passed = new Set(data.passedTrainerIds || []);
  if (data.currentTrainerId) passed.add(data.currentTrainerId);
  const candidates = (data.candidateTrainerIds || []).filter((id) => id && !passed.has(id));

  if (candidates.length === 0) {
    await dispatchRef.update({
      status: 'no_trainers',
      currentTrainerId: admin.firestore.FieldValue.delete(),
      currentTrainerName: admin.firestore.FieldValue.delete(),
      offerExpiresAt: admin.firestore.FieldValue.delete(),
      updatedAt: Date.now(),
    });
    if (data.clientId) {
      await sendPushToUser(data.clientId, {
        title: 'Sin entrenadores disponibles',
        body: 'Nadie aceptó a tiempo. Prueba otra especialidad o más tarde.',
        data: { type: 'trainer_dispatch_no_match', dispatchId: dispatchRef.id },
      });
    }
    return null;
  }

  const nextId = candidates[0];
  let trainerName = 'Entrenador';
  try {
    const profileSnap = await db.collection('trainerProfiles').doc(nextId).get();
    if (profileSnap.exists) {
      trainerName = profileSnap.data().displayName || trainerName;
    }
  } catch (e) {
    console.warn('trainer profile lookup failed', nextId, e);
  }

  const now = Date.now();
  await dispatchRef.update({
    status: 'offering',
    currentTrainerId: nextId,
    currentTrainerName: trainerName,
    offerExpiresAt: now + DISPATCH_OFFER_MS,
    passedTrainerIds: Array.from(passed),
    updatedAt: now,
  });

  await sendPushToUser(nextId, {
    title: '⚡ Nueva oferta EntrenaCoach',
    body: `${data.clientName || 'Cliente'} · ${formatClp(data.offerPriceClp)} · ${data.durationMin || 60} min`,
    data: {
      type: 'trainer_dispatch_offer',
      dispatchId: dispatchRef.id,
    },
  });

  return nextId;
}

/** Nueva solicitud Uber → primera oferta al PT más cercano. */
exports.onTrainerDispatchCreated = functions.firestore
  .document('trainerDispatchRequests/{dispatchId}')
  .onCreate(async (snap) => {
    const data = snap.data() || {};
    if (data.status !== 'searching') return null;
    await offerToNextTrainer(snap.ref, data);
    return null;
  });

/** Callable: entrenador acepta o pasa la oferta. */
exports.respondToTrainerDispatch = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Inicia sesión.');
  }
  const dispatchId = data && data.dispatchId ? String(data.dispatchId) : '';
  const action = data && data.action === 'pass' ? 'pass' : data && data.action === 'accept' ? 'accept' : '';
  if (!dispatchId || !action) {
    throw new functions.https.HttpsError('invalid-argument', 'dispatchId y action requeridos.');
  }

  const uid = context.auth.uid;
  const ref = db.collection('trainerDispatchRequests').doc(dispatchId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'Oferta no encontrada.');
  }
  const d = snap.data() || {};

  if (d.currentTrainerId !== uid) {
    throw new functions.https.HttpsError('permission-denied', 'Esta oferta no es para ti.');
  }
  if (d.status !== 'offering') {
    throw new functions.https.HttpsError('failed-precondition', 'La oferta ya no está activa.');
  }

  if (action === 'pass') {
    await ref.update({
      passedTrainerIds: admin.firestore.FieldValue.arrayUnion(uid),
      updatedAt: Date.now(),
    });
    const updated = (await ref.get()).data() || {};
    await offerToNextTrainer(ref, updated);
    return { ok: true };
  }

  const now = Date.now();
  const bookingId = `tb_${now}_${String(d.clientId || 'x').slice(0, 6)}`;
  let trainerName = 'Entrenador';
  try {
    const profileSnap = await db.collection('trainerProfiles').doc(uid).get();
    if (profileSnap.exists) trainerName = profileSnap.data().displayName || trainerName;
  } catch (e) {
    console.warn('trainer profile for accept', e);
  }

  const scheduledAt = now + 15 * 60 * 1000;
  const platformFeeClp =
    typeof d.platformFeeClp === 'number'
      ? d.platformFeeClp
      : Math.round((Number(d.offerPriceClp) || 0) * TRAINER_PLATFORM_FEE_RATE);

  await db.collection('trainerBookings').doc(bookingId).set({
    trainerId: uid,
    trainerName,
    clientId: d.clientId,
    clientName: d.clientName || 'Cliente',
    scheduledAt,
    durationMin: Number(d.durationMin) || 60,
    locationNote: String(d.locationNote || ''),
    priceClp: Number(d.offerPriceClp) || 0,
    paymentMethod: d.paymentMethod === 'card' ? 'card' : 'cash',
    status: 'accepted',
    platformFeeClp,
    dispatchId,
    createdAt: now,
    updatedAt: now,
  });

  await ref.update({
    status: 'matched',
    matchedTrainerId: uid,
    bookingId,
    currentTrainerId: uid,
    currentTrainerName: trainerName,
    offerExpiresAt: admin.firestore.FieldValue.delete(),
    updatedAt: now,
  });

  if (d.clientId) {
    await sendPushToUser(d.clientId, {
      title: '✅ Entrenador asignado',
      body: `${trainerName} aceptó · ${formatClp(d.offerPriceClp)}`,
      data: { type: 'trainer_booking_update', bookingId, status: 'accepted' },
    });
  }

  return { ok: true, bookingId };
});

/** Callable: avanza cuando expira el timer de 90s sin respuesta. */
exports.advanceTrainerDispatch = functions.https.onCall(async (data, context) => {
  const dispatchId = data && data.dispatchId ? String(data.dispatchId) : '';
  if (!dispatchId) {
    throw new functions.https.HttpsError('invalid-argument', 'dispatchId requerido.');
  }

  const ref = db.collection('trainerDispatchRequests').doc(dispatchId);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false };

  const d = snap.data() || {};
  if (d.status !== 'offering') return { ok: true };
  if (d.offerExpiresAt && d.offerExpiresAt > Date.now()) return { ok: true };

  const currentId = d.currentTrainerId;
  if (currentId) {
    await ref.update({
      passedTrainerIds: admin.firestore.FieldValue.arrayUnion(currentId),
      updatedAt: Date.now(),
    });
  }
  const updated = (await ref.get()).data() || {};
  await offerToNextTrainer(ref, updated);
  return { ok: true };
});

// ─── EntrenaMatch P0 — engagement push + ops ─────────────────────────────────

async function readProfileName(uid) {
  try {
    const snap = await db.collection('profiles').doc(uid).get();
    if (snap.exists) {
      const d = snap.data() || {};
      return d.name || d.displayName || null;
    }
  } catch (e) {
    console.warn('profile name lookup', uid, e);
  }
  return null;
}

/** 1:1 chat — push al destinatario. */
exports.onDirectMessageCreated = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap) => {
    const m = snap.data() || {};
    const to = m.to;
    const from = m.from;
    if (!to || !from || to === from) return null;

    const senderName = (await readProfileName(from)) || 'Alguien';
    let preview = 'Nuevo mensaje';
    if (m.text && String(m.text).trim()) {
      preview = String(m.text).trim().slice(0, 100);
    } else if (m.voiceUrl) {
      preview = '🎤 Nota de voz';
    }

    await sendPushToUser(to, {
      title: `💬 ${senderName}`,
      body: preview,
      data: {
        type: 'message_new',
        userId: from,
        partnerName: senderName,
      },
    });
    return null;
  });

/** Nuevo match mutual — push a ambos. */
exports.onMatchCreated = functions.firestore
  .document('matches/{matchId}')
  .onCreate(async (snap) => {
    const m = snap.data() || {};
    const u1 = m.user1;
    const u2 = m.user2;
    if (!u1 || !u2) return null;

    const [name1, name2] = await Promise.all([readProfileName(u1), readProfileName(u2)]);

    await sendPushToUser(u1, {
      title: '🎉 ¡Nuevo match!',
      body: `Tú y ${name2 || 'alguien'} pueden entrenar juntos — escríbele ahora.`,
      data: { type: 'match_new', userId: u2, partnerName: name2 || '' },
    });
    await sendPushToUser(u2, {
      title: '🎉 ¡Nuevo match!',
      body: `Tú y ${name1 || 'alguien'} pueden entrenar juntos — escríbele ahora.`,
      data: { type: 'match_new', userId: u1, partnerName: name1 || '' },
    });
    return null;
  });

/** Grupo sesión — push a participantes excepto sender. */
exports.onSessionGroupMessageCreated = functions.firestore
  .document('sessions/{sessionId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const sessionId = context.params.sessionId;
    const msg = snap.data() || {};
    const senderId = msg.senderId;
    if (!senderId) return null;

    const sessionSnap = await db.collection('sessions').doc(sessionId).get();
    if (!sessionSnap.exists) return null;
    const participants = (sessionSnap.data() || {}).participants || [];
    const targets = participants.filter((id) => id && id !== senderId);
    if (targets.length === 0) return null;

    const senderName = msg.senderName || (await readProfileName(senderId)) || 'Alguien';
    const preview =
      msg.text && String(msg.text).trim()
        ? String(msg.text).trim().slice(0, 80)
        : msg.photo
          ? '📷 Foto'
          : msg.voiceUrl
            ? '🎤 Nota de voz'
            : 'Nuevo mensaje en la sesión';

    await Promise.all(
      targets.map((uid) =>
        sendPushToUser(uid, {
          title: `👥 ${senderName} en la sesión`,
          body: preview,
          data: {
            type: 'group_message',
            groupChatId: sessionId,
            partnerName: senderName,
          },
        })
      )
    );
    return null;
  });

/** Squad chat — push a miembros excepto sender. */
exports.onSquadGroupMessageCreated = functions.firestore
  .document('squads/{squadId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const squadId = context.params.squadId;
    const msg = snap.data() || {};
    const senderId = msg.senderId;
    if (!senderId) return null;

    const squadSnap = await db.collection('squads').doc(squadId).get();
    if (!squadSnap.exists) return null;
    const members = (squadSnap.data() || {}).members || [];
    const targets = members.filter((id) => id && id !== senderId);
    if (targets.length === 0) return null;

    const senderName = msg.senderName || (await readProfileName(senderId)) || 'Alguien';
    const preview =
      msg.text && String(msg.text).trim()
        ? String(msg.text).trim().slice(0, 80)
        : msg.voiceUrl
          ? '🎤 Nota de voz'
          : 'Nuevo mensaje en el squad';

    await Promise.all(
      targets.map((uid) =>
        sendPushToUser(uid, {
          title: `🛡️ ${senderName} en tu squad`,
          body: preview,
          data: {
            type: 'group_message',
            groupChatId: squadId,
            partnerName: senderName,
          },
        })
      )
    );
    return null;
  });

/** Cron: expira ofertas dispatch sin respuesta (no depende del cliente). */
exports.advanceExpiredDispatchesScheduled = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    const now = Date.now();
    const snap = await db
      .collection('trainerDispatchRequests')
      .where('status', '==', 'offering')
      .where('offerExpiresAt', '<=', now)
      .limit(25)
      .get();

    for (const docSnap of snap.docs) {
      const d = docSnap.data() || {};
      const currentId = d.currentTrainerId;
      if (currentId) {
        await docSnap.ref.update({
          passedTrainerIds: admin.firestore.FieldValue.arrayUnion(currentId),
          updatedAt: Date.now(),
        });
      }
      const updated = (await docSnap.ref.get()).data() || {};
      await offerToNextTrainer(docSnap.ref, updated);
    }
    return null;
  });

/** Push al comprador cuando cambia el estado del pedido marketplace. */
exports.onMarketplaceOrderUpdated = functions.firestore
  .document('marketplaceOrders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() || {};
    const after = change.after.data() || {};
    if (before.status === after.status) return null;

    const userId = after.userId;
    if (!userId) return null;

    const title = after.productTitle || 'Tu pedido';
    const messages = {
      paid: {
        title: '✅ Pedido pagado',
        body: `"${title}" fue confirmado. Preparamos tu envío.`,
      },
      shipped: {
        title: '📦 Pedido enviado',
        body: `"${title}" está en camino.`,
      },
      delivered: {
        title: '🎉 Pedido entregado',
        body: `"${title}" fue entregado. ¡Disfrútalo!`,
      },
      cancelled: {
        title: 'Pedido cancelado',
        body: `Se canceló "${title}".`,
      },
    };

    const msg = messages[after.status];
    if (!msg) return null;

    await sendPushToUser(userId, {
      title: msg.title,
      body: msg.body,
      data: {
        type: 'marketplace_order_update',
        orderId: context.params.orderId,
        status: String(after.status),
      },
    });
    return null;
  });

/** Callable: checkout MP para pedido marketplace. */
exports.createMarketplaceMpCheckout = functions
  .runWith({ secrets: [mercadopagoAccessToken], timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Inicia sesión.');
    }
    const orderId = data && data.orderId ? String(data.orderId) : '';
    if (!orderId) {
      throw new functions.https.HttpsError('invalid-argument', 'orderId requerido.');
    }

    const orderRef = db.collection('marketplaceOrders').doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Pedido no encontrado.');
    }
    const order = orderSnap.data() || {};

    if (order.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Solo el comprador puede pagar.');
    }
    if (order.status === 'paid') {
      throw new functions.https.HttpsError('already-exists', 'Este pedido ya está pagado.');
    }

    const priceClp = Math.round(Number(order.priceClp) || 0);
    if (priceClp < 1000) {
      throw new functions.https.HttpsError('invalid-argument', 'Monto inválido.');
    }

    const productSnap = await db.collection('marketplaceProducts').doc(String(order.productId)).get();
    const product = productSnap.exists ? productSnap.data() || {} : {};
    const fallbackPaymentUrl =
      typeof product.paymentUrl === 'string' && product.paymentUrl.startsWith('https://')
        ? product.paymentUrl
        : undefined;

    const token = getMpAccessToken();
    if (!token) {
      if (!fallbackPaymentUrl) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Mercado Pago no configurado para la tienda.'
        );
      }
      return { initPoint: fallbackPaymentUrl, preferenceId: '', usedFallback: true };
    }

    const projectId = process.env.GCLOUD_PROJECT || 'entrenamatch';
    const notificationUrl = `https://us-central1-${projectId}.cloudfunctions.net/mercadoPagoWebhook`;
    const title = order.productTitle || product.title || 'EntrenaMatch Tienda';

    const prefBody = {
      items: [
        {
          title: String(title).slice(0, 120),
          quantity: 1,
          currency_id: 'CLP',
          unit_price: priceClp,
        },
      ],
      external_reference: orderId,
      metadata: {
        order_id: orderId,
        order_type: 'marketplace',
        user_id: context.auth.uid,
      },
      notification_url: notificationUrl,
      back_urls: {
        success: 'https://entrenamatch.web.app',
        failure: 'https://entrenamatch.web.app',
        pending: 'https://entrenamatch.web.app',
      },
      auto_return: 'approved',
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prefBody),
    });

    if (!mpRes.ok) {
      const errText = await mpRes.text();
      console.error('MP marketplace preference failed', mpRes.status, errText.slice(0, 300));
      if (fallbackPaymentUrl) {
        return { initPoint: fallbackPaymentUrl, preferenceId: '', usedFallback: true };
      }
      throw new functions.https.HttpsError('internal', 'No se pudo crear el checkout.');
    }

    const pref = await mpRes.json();
    const initPoint = pref.init_point || pref.sandbox_init_point;
    if (!initPoint) {
      throw new functions.https.HttpsError('internal', 'Respuesta MP sin init_point.');
    }

    await orderRef.update({
      mpPreferenceId: pref.id,
      updatedAt: Date.now(),
    });

    return { initPoint, preferenceId: pref.id, usedFallback: false };
  });

/** Admin: verifica si MP token está configurado (Fase 11). */
exports.checkMpHealth = functions
  .runWith({ secrets: [mercadopagoAccessToken, mercadopagoWebhookSecret] })
  .https.onCall(async (_data, context) => {
  await assertMarketplaceAdmin(context);
  const token = getMpAccessToken();
  const webhookSecret = getMpWebhookSecret();
  const webhookUrl = `https://us-central1-${process.env.GCLOUD_PROJECT || 'entrenamatch'}.cloudfunctions.net/mercadoPagoWebhook`;
  const base = {
    configured: !!(token && String(token).length > 8),
    webhookSecretConfigured: !!(webhookSecret && String(webhookSecret).length > 8),
    hasWebhook: true,
    webhookUrl,
    marketplaceModel: true,
  };
  if (!token) return { ...base, live: false, mpUserId: null };

  try {
    const meRes = await fetch('https://api.mercadopago.com/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) {
      return { ...base, live: false, mpUserId: null, mpError: `HTTP ${meRes.status}` };
    }
    const me = await meRes.json();
    return {
      ...base,
      live: true,
      mpUserId: me.id != null ? String(me.id) : null,
      mpNickname: me.nickname || me.email || null,
    };
  } catch (err) {
    return { ...base, live: false, mpUserId: null, mpError: String(err.message || err) };
  }
});

/** Admin: marca liquidación al entrenador (marketplace EntrenaCoach). */
exports.markTrainerPayoutStatus = functions.https.onCall(async (data, context) => {
  await assertMarketplaceAdmin(context);
  const bookingId = data && data.bookingId ? String(data.bookingId) : '';
  const status = data && data.status ? String(data.status) : '';
  if (!bookingId) {
    throw new functions.https.HttpsError('invalid-argument', 'bookingId requerido.');
  }
  if (status !== 'processing' && status !== 'paid') {
    throw new functions.https.HttpsError('invalid-argument', 'status debe ser processing o paid.');
  }

  const bookingRef = db.collection('trainerBookings').doc(bookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Reserva no encontrada.');
  }
  const booking = bookingSnap.data() || {};
  if (booking.status !== 'paid_card') {
    throw new functions.https.HttpsError('failed-precondition', 'La sesión no está pagada con tarjeta.');
  }

  const now = Date.now();
  const patch = {
    payoutStatus: status,
    payoutUpdatedAt: now,
    updatedAt: now,
  };
  if (status === 'paid') {
    patch.payoutPaidAt = now;
    patch.payoutPaidBy = context.auth.uid;
  }
  await bookingRef.update(patch);
  return { ok: true, bookingId, payoutStatus: status };
});

/** Fase 15 — Daily Pulse re-engagement (09:00 Chile). */
exports.sendDailyPulseRemindersScheduled = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('America/Santiago')
  .onRun(async () => {
    const snap = await db.collection('userPushTokens').limit(80).get();
    let sent = 0;
    for (const docSnap of snap.docs) {
      const uid = docSnap.id;
      const prefs = (await db.collection('profiles').doc(uid).get()).data() || {};
      if (prefs.notifDailyPulse === false) continue;
      const ok = await sendPushToUser(uid, {
        title: '⚡ Tu Daily Pulse',
        body: 'Completa el reto de hoy y mantén tu racha.',
        data: { type: 'daily_pulse' },
      });
      if (ok) sent++;
    }
    console.log('Daily pulse reminders sent', sent);
    return null;
  });

/** Fase 16 — Weekly Pact domingo 10:00 Chile. */
exports.sendWeeklyPactRemindersScheduled = functions.pubsub
  .schedule('0 10 * * 0')
  .timeZone('America/Santiago')
  .onRun(async () => {
    const snap = await db.collection('userPushTokens').limit(80).get();
    let sent = 0;
    for (const docSnap of snap.docs) {
      const uid = docSnap.id;
      const profile = (await db.collection('profiles').doc(uid).get()).data() || {};
      if (profile.notifWeeklyPact === false) continue;
      const ok = await sendPushToUser(uid, {
        title: '🎯 Cierra tu semana',
        body: 'Revisa tu pacto semanal y el progreso con tu equipo.',
        data: { type: 'weekly_pact' },
      });
      if (ok) sent++;
    }
    console.log('Weekly pact reminders sent', sent);
    return null;
  });
