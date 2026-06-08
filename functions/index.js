const functions = require('firebase-functions');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

const geminiApiKey = defineSecret('GEMINI_API_KEY');

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
  return (
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    (functions.config().mercadopago && functions.config().mercadopago.access_token) ||
    ''
  );
}

/** Callable: crea preferencia MP para booking completado (tarjeta). */
exports.createTrainerMpCheckout = functions
  .runWith({ timeoutSeconds: 30 })
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

    const trainerSnap = await db.collection('trainerProfiles').doc(booking.trainerId).get();
    const trainer = trainerSnap.exists ? trainerSnap.data() || {} : {};
    const fallbackPaymentUrl =
      typeof trainer.paymentUrl === 'string' && trainer.paymentUrl.startsWith('https://')
        ? trainer.paymentUrl
        : undefined;

    if (!token) {
      if (!fallbackPaymentUrl) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Mercado Pago no configurado. El entrenador debe agregar link de pago.'
        );
      }
      return {
        initPoint: fallbackPaymentUrl,
        preferenceId: '',
        platformFeeClp,
        fallbackPaymentUrl,
        usedFallback: true,
      };
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
      if (fallbackPaymentUrl) {
        return {
          initPoint: fallbackPaymentUrl,
          preferenceId: '',
          platformFeeClp,
          fallbackPaymentUrl,
          usedFallback: true,
        };
      }
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
      usedFallback: false,
    };
  });

/** Webhook Mercado Pago — confirma paid_card en trainerBookings. */
exports.mercadoPagoWebhook = functions.https.onRequest(async (req, res) => {
  try {
    let paymentId = req.query && req.query['data.id'] ? String(req.query['data.id']) : '';
    if (!paymentId && req.body && req.body.data && req.body.data.id) {
      paymentId = String(req.body.data.id);
    }
    if (!paymentId && req.query && req.query.id) {
      paymentId = String(req.query.id);
    }

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

    const bookingId =
      payment.external_reference ||
      (payment.metadata && payment.metadata.booking_id) ||
      (payment.metadata && payment.metadata.bookingId);

    if (!bookingId) {
      console.warn('MP webhook: no bookingId in payment', paymentId);
      res.status(200).send('ok');
      return;
    }

    const bookingRef = db.collection('trainerBookings').doc(String(bookingId));
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      res.status(200).send('ok');
      return;
    }

    await bookingRef.update({
      status: 'paid_card',
      mpPaymentId: String(paymentId),
      updatedAt: Date.now(),
    });

    console.log('MP webhook: booking paid', bookingId, paymentId);
    res.status(200).send('ok');
  } catch (err) {
    console.error('mercadoPagoWebhook error', err);
    res.status(500).send('error');
  }
});
