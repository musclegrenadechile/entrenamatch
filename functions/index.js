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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 256 },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 200)}`);
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
    label: String(parsed.label || mealDescription || 'Comida').slice(0, 80),
    tip: String(parsed.tip || 'Estimación IA — no es consejo médico.').slice(0, 200),
    source: 'gemini',
  };
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
    console.warn('Gemini food analysis failed, using heuristic', err.message || err);
    return estimateFromDescription(mealDescription || 'Comida con foto');
  }
});
