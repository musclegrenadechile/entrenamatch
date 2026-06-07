const functions = require('firebase-functions');
const admin = require('firebase-admin');

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

    const partnerIds = await getTeamPartnerIds(uid, after.syncBonds || {});
    if (partnerIds.length === 0) {
      console.log(`No team partners for ${uid}, skipping push`);
      return null;
    }

    const name = after.name || 'Tu gym partner';
    const isSync = !!startedSync;

    const title = isSync
      ? `${name} activó EntrenaSync`
      : `${name} está entrenando en vivo`;

    const body = isSync
      ? 'Tu equipo está en sync — únete desde Hoy o el mapa.'
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

async function callGeminiFoodAnalysis(apiKey, imageBase64, mealDescription) {
  const parts = [];
  if (mealDescription) {
    parts.push({ text: `Estima macros de esta comida descrita en español: "${mealDescription}". Responde SOLO JSON válido: {"kcal":number,"proteinG":number,"carbsG":number,"fatG":number,"label":string,"tip":string}` });
  }
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    });
    parts.push({
      text: 'Estima kcal y macros P/C/G de esta comida en español. JSON only: {"kcal":number,"proteinG":number,"carbsG":number,"fatG":number,"label":string,"tip":string}. tip = consejo breve pre/post gym. No consejo médico.',
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
exports.analyzeFood = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión.');
  }
  const imageBase64 = data && data.imageBase64 ? String(data.imageBase64) : '';
  const mealDescription = data && data.mealDescription ? String(data.mealDescription) : '';
  if (!imageBase64 && !mealDescription.trim()) {
    throw new functions.https.HttpsError('invalid-argument', 'Foto o descripción requerida.');
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    (functions.config().gemini && functions.config().gemini.key) ||
    '';

  if (!apiKey) {
    return estimateFromDescription(mealDescription || 'Comida');
  }

  try {
    return await callGeminiFoodAnalysis(apiKey, imageBase64, mealDescription);
  } catch (err) {
    console.warn('Gemini food analysis failed, using heuristic', err.message || err);
    return estimateFromDescription(mealDescription || 'Comida con foto');
  }
});
