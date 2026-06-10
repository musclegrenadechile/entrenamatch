/**
 * Beta bots — Fase 2: LIVE mapa completo, GymSound, Sync simulado, muro vivo, scheduling.
 */

const functions = require('firebase-functions');
const PERSONAS = require('./betaBotsPersonas.json');
const scheduling = require('./betaBotsScheduling');

const BETA_BOT_PREFIX = 'beta_bot_';
const BADGE_LABEL = 'Beta · Persona IA';
const PHOTO_HOSTING_BASE = 'https://entrenamatch.web.app/beta-bots';
const CONFIG_DOC = 'betaBots';
const PHASE_VERSION = 2;

const BOTS = [
  { uid: 'beta_bot_01', name: 'Camila Morales', city: 'Viña del Mar', trainingTypes: ['Pesas/Gym', 'Running'], level: 'Intermedio', personality: 'cálida, motivadora' },
  { uid: 'beta_bot_02', name: 'Joaquín Pérez', city: 'Santiago', trainingTypes: ['CrossFit', 'Running'], level: 'Avanzado', personality: 'competitivo, amigable' },
  { uid: 'beta_bot_03', name: 'Valentina Soto', city: 'Valparaíso', trainingTypes: ['Calistenia', 'Yoga'], level: 'Intermedio', personality: 'relajada, outdoor' },
  { uid: 'beta_bot_04', name: 'Isabella Mendoza', city: 'Viña del Mar', trainingTypes: ['Running', 'Pilates'], level: 'Intermedio', personality: 'disciplinada runner' },
  { uid: 'beta_bot_05', name: 'Matías Vargas', city: 'Concepción', trainingTypes: ['Calistenia', 'Funcional'], level: 'Intermedio', personality: 'madrugador' },
  { uid: 'beta_bot_06', name: 'Sofía Lagos', city: 'Santiago', trainingTypes: ['Pesas/Gym', 'Funcional'], level: 'Principiante', personality: 'entusiasta' },
  { uid: 'beta_bot_07', name: 'Benjamín Cruz', city: 'Santiago', trainingTypes: ['CrossFit', 'Natación'], level: 'Avanzado', personality: 'técnico' },
  { uid: 'beta_bot_08', name: 'Renata Díaz', city: 'Valparaíso', trainingTypes: ['Calistenia', 'Funcional'], level: 'Intermedio', personality: 'determinada' },
  { uid: 'beta_bot_09', name: 'Sebastián Morales', city: 'Santiago', trainingTypes: ['Pesas/Gym', 'Boxeo'], level: 'Avanzado', personality: 'serio' },
  { uid: 'beta_bot_10', name: 'Martina Vega', city: 'Viña del Mar', trainingTypes: ['Pilates', 'Running'], level: 'Principiante', personality: 'empática' },
  { uid: 'beta_bot_11', name: 'Felipe Navarro', city: 'Valparaíso', trainingTypes: ['Funcional', 'Running'], level: 'Intermedio', personality: 'aventurero' },
  { uid: 'beta_bot_12', name: 'Alejandro Ruiz', city: 'Reñaca', trainingTypes: ['Pesas/Gym', 'Running'], level: 'Intermedio', personality: 'social' },
  { uid: 'beta_bot_13', name: 'Andrés Morales', city: 'Concón', trainingTypes: ['Calistenia', 'Funcional'], level: 'Avanzado', personality: 'minimalista' },
  { uid: 'beta_bot_14', name: 'Daniela Vega', city: 'Concón', trainingTypes: ['Yoga', 'Calistenia'], level: 'Intermedio', personality: 'zen' },
  { uid: 'beta_bot_15', name: 'Gabriel Díaz', city: 'Viña del Mar', trainingTypes: ['Boxeo', 'Pesas/Gym'], level: 'Avanzado', personality: 'coach vibe' },
];

/** Himnos fijos para mapa LIVE (Fase 2A). */
const GYM_ANTHEMS = {
  beta_bot_01: { trackName: 'Stronger', artistName: 'Workout Mix', trackUrl: 'https://www.youtube.com/watch?v=MkElfR_NPBI', provider: 'youtube' },
  beta_bot_02: { trackName: 'Till I Collapse', artistName: 'Eminem', trackUrl: 'https://www.youtube.com/watch?v=ytQ5CYE1VZw', provider: 'youtube' },
  beta_bot_03: { trackName: 'Flow State', artistName: 'Yoga Beats', trackUrl: 'https://www.youtube.com/watch?v=hLhN__oEHaw', provider: 'youtube' },
  beta_bot_04: { trackName: 'Run the World', artistName: 'Cardio', trackUrl: 'https://www.youtube.com/watch?v=VBm8mjTptYg', provider: 'youtube' },
  beta_bot_05: { trackName: 'Beast Mode', artistName: 'Gym', trackUrl: 'https://www.youtube.com/watch?v=btPJPFnesV4', provider: 'youtube' },
  beta_bot_06: { trackName: 'Pump It', artistName: 'Black Eyed Peas', trackUrl: 'https://www.youtube.com/watch?v=ZaI2IlHwmgQ', provider: 'youtube' },
  beta_bot_07: { trackName: 'Lose Yourself', artistName: 'Eminem', trackUrl: 'https://www.youtube.com/watch?v=_Yhyp-_hX2s', provider: 'youtube' },
  beta_bot_08: { trackName: 'Power', artistName: 'Kanye West', trackUrl: 'https://www.youtube.com/watch?v=L53xjXarW1M', provider: 'youtube' },
  beta_bot_09: { trackName: 'Eye of the Tiger', artistName: 'Survivor', trackUrl: 'https://www.youtube.com/watch?v=btPJPFnesV4', provider: 'youtube' },
  beta_bot_10: { trackName: 'Good Feeling', artistName: 'Flo Rida', trackUrl: 'https://www.youtube.com/watch?v=3OnnDqH6Wj8', provider: 'youtube' },
  beta_bot_11: { trackName: 'Can\'t Hold Us', artistName: 'Macklemore', trackUrl: 'https://www.youtube.com/watch?v=2zNSgSzhBfM', provider: 'youtube' },
  beta_bot_12: { trackName: 'Levels', artistName: 'Avicii', trackUrl: 'https://www.youtube.com/watch?v=_ovdm2yX4MA', provider: 'youtube' },
  beta_bot_13: { trackName: 'Sail', artistName: 'AWOLNATION', trackUrl: 'https://www.youtube.com/watch?v=tgIqeczxBsI', provider: 'youtube' },
  beta_bot_14: { trackName: 'Weightless', artistName: 'Ambient', trackUrl: 'https://www.youtube.com/watch?v=UfcAVejslrU', provider: 'youtube' },
  beta_bot_15: { trackName: 'Remember the Name', artistName: 'Fort Minor', trackUrl: 'https://www.youtube.com/watch?v=VDvr08sCPOc', provider: 'youtube' },
};

const WORKOUT_TITLES = {
  push: ['Push fuerte', 'Pecho y tríceps', 'Empuje del día'],
  pull: ['Pull day', 'Espalda y bíceps', 'Dominadas y remo'],
  legs: ['Piernas 🔥', 'Leg day costero', 'Sentadillas y zancadas'],
  full: ['Full body express', 'Entreno completo', 'Circuito total'],
  cardio: ['Cardio costanera', '5K suave', 'Trote matinal'],
  other: ['Entreno de hoy', 'Sesión libre'],
};

const TYPE_MAP = {
  'Pesas/Gym': 'push',
  CrossFit: 'full',
  Running: 'cardio',
  Yoga: 'other',
  Calistenia: 'pull',
  Funcional: 'full',
  Pilates: 'other',
  Natación: 'cardio',
  Boxeo: 'full',
  Ciclismo: 'cardio',
};

const TEXT_POSTS = [
  'Buen día para moverse 💪 ¿Quién entrena hoy?',
  'Cerré la sesión — piernas hechas polvo pero contento/a.',
  'PR chico hoy. Los pasos suman.',
  '¿Alguien para costanera mañana temprano?',
  'Recovery activo: caminata + estiramientos.',
  'La constancia gana. Otra sesión en el bolsillo.',
];

const BOT_BY_UID = Object.fromEntries(BOTS.map((b) => [b.uid, b]));
for (const p of PERSONAS.bots || []) {
  BOT_BY_UID[p.uid] = { ...BOT_BY_UID[p.uid], ...p };
}
const BOT_UIDS = new Set(BOTS.map((b) => b.uid));

function isBetaBotUid(uid) {
  return typeof uid === 'string' && (uid.startsWith(BETA_BOT_PREFIX) || BOT_UIDS.has(uid));
}

function likeDocId(liker, liked) {
  return `${liker}_${liked}`;
}

function matchDocId(a, b) {
  return [a, b].sort().join('_');
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getGymSoundAnthem(bot) {
  const base = GYM_ANTHEMS[bot.uid] || GYM_ANTHEMS.beta_bot_01;
  return { ...base, updatedAt: Date.now() };
}

function buildBotLivePresence(bot, profile, now) {
  const photoUrl = `${PHOTO_HOSTING_BASE}/${bot.uid}_primary.png`;
  const anthem = getGymSoundAnthem(bot);
  return {
    userId: bot.uid,
    name: bot.name,
    age: profile.age || bot.age,
    gender: profile.gender || bot.gender || 'hombre',
    city: bot.city,
    country: profile.country || 'Chile',
    lat: Number.isFinite(Number(profile.lat)) ? Number(profile.lat) : Number(bot.lat) || -33.02,
    lng: Number.isFinite(Number(profile.lng)) ? Number(profile.lng) : Number(bot.lng) || -71.55,
    bio: profile.bio || bot.bio || '',
    photos: Array.isArray(profile.photos) && profile.photos.length ? profile.photos : [photoUrl],
    trainingTypes: profile.trainingTypes || bot.trainingTypes || [],
    goals: profile.goals || bot.goals || [],
    level: profile.level || bot.level || 'Intermedio',
    availability: profile.availability || bot.availability || ['Tarde'],
    trainingNow: true,
    trainingNowSince: now,
    liveStreak: profile.liveStreak || 1,
    liveJoins: profile.liveJoins || 0,
    isBetaBot: true,
    spotifyShareLive: true,
    spotifyNowPlaying: null,
    gymSoundAnthem: anthem,
    verificationStatus: profile.verificationStatus || 'unverified',
    updatedAt: now,
  };
}

function workoutTypeForBot(bot) {
  const primary = bot.trainingTypes[0] || 'Pesas/Gym';
  return TYPE_MAP[primary] || 'full';
}

function buildSampleExercises(bot) {
  const t = bot.trainingTypes[0] || 'Pesas/Gym';
  if (t === 'Running' || t === 'Ciclismo' || t === 'Natación') {
    return [
      {
        name: t === 'Natación' ? 'Nado continuo' : 'Trote continuo',
        sets: [{ reps: 0, weightKg: 0, minutesMin: 25 + Math.floor(Math.random() * 20), intensity: 6 }],
      },
    ];
  }
  if (t === 'Yoga' || t === 'Pilates') {
    return [
      { name: 'Flow principal', sets: [{ reps: 0, weightKg: 0, minutesMin: 40, intensity: 5 }] },
      { name: 'Core', sets: [{ reps: 12, weightKg: 0 }] },
    ];
  }
  const names =
    t === 'Boxeo'
      ? ['Shadow boxing', 'Sacos', 'Core']
      : t === 'Calistenia'
        ? ['Dominadas', 'Fondos', 'Plancha']
        : ['Press banca', 'Remo', 'Sentadilla'];
  return names.map((name) => ({
    name,
    sets: [
      { reps: 8 + Math.floor(Math.random() * 4), weightKg: 20 + Math.floor(Math.random() * 40) },
      { reps: 8 + Math.floor(Math.random() * 4), weightKg: 20 + Math.floor(Math.random() * 40) },
    ],
  }));
}

function computeStats(exercises, durationMin) {
  let totalSets = 0;
  let totalVolumeKg = 0;
  for (const ex of exercises) {
    for (const s of ex.sets) {
      totalSets++;
      totalVolumeKg += (s.reps || 0) * (s.weightKg || 0);
    }
  }
  return {
    exerciseCount: exercises.length,
    totalSets,
    totalVolumeKg: Math.round(totalVolumeKg),
    durationMin,
  };
}

function buildWorkoutPostText(title, type, stats) {
  const vol =
    stats.totalVolumeKg > 0 ? `${stats.totalVolumeKg} kg volumen` : `${stats.durationMin} min`;
  return `🏋️ ${title} · ${type} — ${stats.exerciseCount} ejercicios, ${stats.totalSets} bloques, ${stats.durationMin} min (${vol})`;
}

async function isEnabled(db) {
  try {
    const snap = await db.collection('config').doc(CONFIG_DOC).get();
    if (!snap.exists) return true;
    return snap.data().enabled !== false;
  } catch {
    return true;
  }
}

async function loadConfig(db) {
  const snap = await db.collection('config').doc(CONFIG_DOC).get();
  const data = snap.exists ? snap.data() : {};
  return {
    enabled: data.enabled !== false,
    batchSize: typeof data.batchSize === 'number' ? data.batchSize : 3,
    botBotSocialEnabled: data.botBotSocialEnabled !== false,
    syncInviteEnabled: data.syncInviteEnabled !== false,
    metrics: data.metrics || {},
    ...data,
  };
}

async function countRealLiveByCity(db) {
  const counts = {};
  try {
    const snap = await db.collection('livePresence').get();
    snap.forEach((docSnap) => {
      const uid = docSnap.id;
      if (isBetaBotUid(uid)) return;
      const d = docSnap.data() || {};
      if (!d.trainingNow) return;
      const city = d.city || 'unknown';
      counts[city] = (counts[city] || 0) + 1;
    });
  } catch (e) {
    console.warn('countRealLiveByCity', e.message);
  }
  return counts;
}

function realLiveInBotCity(bot, counts) {
  let n = counts[bot.city] || 0;
  for (const [city, c] of Object.entries(counts)) {
    if (scheduling.sameCityRegion(city, bot.city)) n += c;
  }
  return n;
}

async function geminiText(apiKey, prompt, fallback) {
  if (!apiKey) return pick(fallback);
  const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 120, temperature: 0.85 },
        }),
      });
      if (!res.ok) continue;
      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && String(text).trim()) return String(text).trim().slice(0, 280);
    } catch (e) {
      console.warn('betaBot gemini', model, e.message);
    }
  }
  return pick(fallback);
}

async function geminiReply(apiKey, bot, userText, userName) {
  const prompt = `Eres ${bot.name}, persona de ambiente en la app fitness EntrenaMatch (beta Chile).
Personalidad: ${bot.personality}. Ciudad: ${bot.city}. Nivel: ${bot.level}.
Responde en español chileno, máximo 2 frases, amigable, sin prometer citas románticas ni datos personales.
El tester ${userName || 'alguien'} escribió: "${String(userText || '').slice(0, 400)}"
Responde solo el mensaje, sin comillas.`;
  return geminiText(apiKey, prompt, [
    '¡Buena! ¿Qué día te tinca entrenar?',
    'Dale, me sumo. ¿Mañana o en la tarde?',
    'Jajaja yo también. Avísame y coordinamos.',
  ]);
}

async function geminiMuroComment(apiKey, commenter, postAuthorName, postText, priorComment) {
  const prompt = `Eres ${commenter.name} (${commenter.personality}), beta bot fitness en ${commenter.city}, Chile.
Comenta en el muro de ${postAuthorName || 'un atleta'}. Post: "${String(postText || '').slice(0, 300)}"
${priorComment ? `Comentario previo: "${String(priorComment).slice(0, 200)}" — responde en 1 frase.` : 'Escribe 1 frase corta, chilena, motivadora, sin emojis excesivos.'}
Solo el comentario, sin comillas.`;
  return geminiText(apiKey, prompt, [
    '¡Buena sesión! 💪',
    'Dale, me tinca sumar la próxima.',
    'Brutal, nos vemos en el gym.',
    '¿Mañana mismo horario?',
  ]);
}

function register(deps) {
  const { db, admin, geminiApiKey } = deps;

  function apiKey() {
    return (
      (typeof geminiApiKey === 'function' ? geminiApiKey() : geminiApiKey) ||
      process.env.GEMINI_API_KEY ||
      ''
    );
  }

  async function writePostComment(postId, bot, text, extra = {}) {
    const id = `bb_${bot.uid}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await db
      .collection('profilePosts')
      .doc(postId)
      .collection('comments')
      .doc(id)
      .set({
        userId: bot.uid,
        userName: bot.name,
        text: String(text).slice(0, 280),
        timestamp: Date.now(),
        isBetaBot: true,
        ...extra,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    try {
      await db
        .collection('profilePosts')
        .doc(postId)
        .update({
          lastCommentAt: admin.firestore.FieldValue.serverTimestamp(),
          commentCount: admin.firestore.FieldValue.increment(1),
        });
    } catch {
      /* non-critical */
    }
    return id;
  }

  async function setBotLive(bot, profile, goingLive, now) {
    const profileRef = db.collection('profiles').doc(bot.uid);
    const anthem = getGymSoundAnthem(bot);

    if (goingLive) {
      const presence = buildBotLivePresence(bot, profile, now);
      await profileRef.set(
        {
          trainingNow: true,
          trainingNowSince: now,
          spotifyShareLive: true,
          spotifyNowPlaying: null,
          gymSoundAnthem: anthem,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      await db.collection('livePresence').doc(bot.uid).set(presence, { merge: true });
    } else {
      await profileRef.set(
        {
          trainingNow: false,
          trainingNowSince: admin.firestore.FieldValue.delete(),
          trainingSyncWith: admin.firestore.FieldValue.delete(),
          syncStartedAt: admin.firestore.FieldValue.delete(),
          spotifyShareLive: false,
          spotifyNowPlaying: admin.firestore.FieldValue.delete(),
          gymSoundAnthem: admin.firestore.FieldValue.delete(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      try {
        await db.collection('livePresence').doc(bot.uid).delete();
      } catch {
        await db.collection('livePresence').doc(bot.uid).set({ trainingNow: false, updatedAt: now }, { merge: true });
      }
    }
  }

  async function maybeInviteSyncWithTester(bot, profile) {
    const liveSnap = await db.collection('livePresence').get();
    const testers = [];
    liveSnap.forEach((docSnap) => {
      const uid = docSnap.id;
      if (isBetaBotUid(uid)) return;
      const d = docSnap.data() || {};
      if (!d.trainingNow) return;
      if (!scheduling.sameCityRegion(d.city, bot.city)) return;
      testers.push({ uid, name: d.name || 'Atleta', city: d.city });
    });
    if (!testers.length) return null;

    const target = pick(testers);
    const mins = 35 + Math.floor(Math.random() * 25);
    const msg = `¡Hola! Soy ${bot.name} 🟢 Estoy LIVE en ${bot.city}. ¿Te tinca un Sync de ~${mins} min?`;
    await db.collection('messages').add({
      from: bot.uid,
      to: target.uid,
      text: msg,
      timestamp: Date.now(),
      isBetaBot: true,
      source: 'beta_bot_sync_invite',
    });

    const syncStartedAt = Date.now();
    await db.collection('profiles').doc(bot.uid).set(
      {
        trainingSyncWith: target.uid,
        syncStartedAt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    if (profile.trainingNow) {
      const presence = buildBotLivePresence(bot, { ...profile, trainingSyncWith: target.uid, syncStartedAt }, syncStartedAt);
      presence.trainingSyncWith = target.uid;
      await db.collection('livePresence').doc(bot.uid).set(presence, { merge: true });
    }

    return { action: 'sync_invite', target: target.uid };
  }

  async function commentOnTesterPost(bot) {
    const postsSnap = await db.collection('profilePosts').orderBy('timestamp', 'desc').limit(30).get();
    const candidates = postsSnap.docs.filter((d) => {
      const uid = d.data().userId;
      return uid && uid !== bot.uid && !isBetaBotUid(uid);
    });
    if (!candidates.length) return null;

    const targetDoc = pick(candidates);
    const post = targetDoc.data();
    const authorName =
      (await db.collection('profiles').doc(post.userId).get()).data()?.name || 'un atleta';
    const text = await geminiMuroComment(apiKey(), bot, authorName, post.text, null);
    await writePostComment(targetDoc.id, bot, text, { targetUserId: post.userId });
    return 'comment_tester';
  }

  async function runBotBotSocial() {
    const botA = pick(BOTS);
    const botB = scheduling.pickCityMate(botA, BOTS);
    if (!botB) return { action: 'bot_bot_skip', reason: 'no_mate' };

    const fallback = await db.collection('profilePosts').orderBy('timestamp', 'desc').limit(40).get();
    const postDoc = fallback.docs.find((d) => d.data().userId === botB.uid);
    if (!postDoc) return { action: 'bot_bot_skip', reason: 'no_post' };

    const post = postDoc.data();
    const commentText = await geminiMuroComment(apiKey(), botA, botB.name, post.text, null);
    const commentId = await writePostComment(postDoc.id, botA, commentText, {
      thread: 'bot_bot',
      postOwnerId: botB.uid,
    });

    let replyAction = null;
    if (Math.random() < 0.35) {
      const replyText = await geminiMuroComment(apiKey(), botB, botA.name, post.text, commentText);
      await writePostComment(postDoc.id, botB, replyText, {
        thread: 'bot_bot',
        replyToCommentId: commentId,
        postOwnerId: botB.uid,
      });
      replyAction = 'reply';
    }

    return { action: 'bot_bot_social', a: botA.uid, b: botB.uid, reply: replyAction };
  }

  async function runBotAction(bot, ctx) {
    const { hour, realLiveCounts, cfg } = ctx;
    const profileRef = db.collection('profiles').doc(bot.uid);
    const profileSnap = await profileRef.get();
    if (!profileSnap.exists) return 'missing_profile';
    const profile = profileSnap.data() || {};

    const now = Date.now();
    const realInCity = realLiveInBotCity(bot, realLiveCounts);
    const liveThreshold = scheduling.liveRollThreshold(hour, realInCity);
    const roll = Math.random();

    if (liveThreshold >= 0 && roll < liveThreshold) {
      const goingLive = !profile.trainingNow;
      await setBotLive(bot, profile, goingLive, now);
      return goingLive ? 'live_on' : 'live_off';
    }

    let cursor = liveThreshold >= 0 ? liveThreshold : 0.05;

    if (roll < cursor + 0.22) {
      const wType = workoutTypeForBot(bot);
      const title = pick(WORKOUT_TITLES[wType] || WORKOUT_TITLES.other);
      const exercises = buildSampleExercises(bot);
      const durationMin = 35 + Math.floor(Math.random() * 35);
      const stats = computeStats(exercises, durationMin);
      const postText = buildWorkoutPostText(title, wType, stats);

      const workoutRef = await db.collection('workouts').add({
        userId: bot.uid,
        title,
        type: wType,
        startedAt: now - durationMin * 60_000,
        endedAt: now,
        exercises,
        stats,
        source: 'beta_bot',
        isBetaBot: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection('profilePosts').add({
        userId: bot.uid,
        text: postText,
        timestamp: now,
        likes: [],
        reactions: {},
        pinned: false,
        postType: 'workout',
        workoutId: workoutRef.id,
        isBetaBot: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await profileRef.set({ updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      return 'workout';
    }
    cursor += 0.22;

    if (roll < cursor + 0.1) {
      await db.collection('profilePosts').add({
        userId: bot.uid,
        text: pick(TEXT_POSTS),
        timestamp: now,
        likes: [],
        reactions: {},
        isBetaBot: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await profileRef.set({ updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      return 'post';
    }
    cursor += 0.1;

    if (roll < cursor + 0.14) {
      const c = await commentOnTesterPost(bot);
      if (c) return c;
    }
    cursor += 0.14;

    if (cfg.syncInviteEnabled && profile.trainingNow && roll < cursor + 0.12) {
      const sync = await maybeInviteSyncWithTester(bot, profile);
      if (sync) return sync.action;
    }
    cursor += 0.12;

    const postsSnap = await db.collection('profilePosts').orderBy('timestamp', 'desc').limit(25).get();
    const likeCandidates = postsSnap.docs.filter((d) => {
      const uid = d.data().userId;
      return uid && uid !== bot.uid && !isBetaBotUid(uid);
    });
    if (likeCandidates.length) {
      const target = pick(likeCandidates);
      const data = target.data();
      const likes = Array.isArray(data.likes) ? data.likes : [];
      if (!likes.includes(bot.uid)) {
        await target.ref.update({ likes: [...likes, bot.uid] });
        return 'like_tester';
      }
    }

    return 'noop';
  }

  async function recordTickMetrics(results, socialResult, hour, realLiveCounts) {
    const actionCounts = {};
    for (const r of results) {
      const key = typeof r.action === 'string' ? r.action : r.action?.action || 'unknown';
      actionCounts[key] = (actionCounts[key] || 0) + 1;
    }
    if (socialResult?.action) {
      actionCounts[socialResult.action] = (actionCounts[socialResult.action] || 0) + 1;
    }

    await db.collection('config').doc(CONFIG_DOC).set(
      {
        phase: PHASE_VERSION,
        lastTickAt: admin.firestore.FieldValue.serverTimestamp(),
        lastTickHourChile: hour,
        lastTickResults: results.slice(0, 12),
        lastSocialResult: socialResult || null,
        lastRealLiveByCity: realLiveCounts,
        metrics: {
          ticksTotal: admin.firestore.FieldValue.increment(1),
          lastActionCounts: actionCounts,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  async function maybeAutoMatchBot(liker, liked) {
    if (!(await isEnabled(db))) return;
    if (!isBetaBotUid(liked) || isBetaBotUid(liker)) return;

    const reciprocalRef = db.collection('likes').doc(likeDocId(liked, liker));
    if ((await reciprocalRef.get()).exists) return;

    await reciprocalRef.set({
      liker: liked,
      liked: liker,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'beta_bot_auto',
    });

    const matchId = matchDocId(liker, liked);
    const matchRef = db.collection('matches').doc(matchId);
    if (!(await matchRef.get()).exists) {
      const [user1, user2] = [liker, liked].sort();
      await matchRef.set({
        user1,
        user2,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        mutual: true,
        source: 'beta_bot_auto',
      });
    }

    const bot = BOT_BY_UID[liked];
    if (bot) {
      await db.collection('messages').add({
        from: liked,
        to: liker,
        text: `¡Hola! Soy ${bot.name} 👋 Vi que también entrenas en ${bot.city}. ¿Qué te tinca esta semana?`,
        timestamp: Date.now(),
        isBetaBot: true,
      });
    }
    console.log('betaBot auto-match', liker, liked);
  }

  async function maybeReplyToMessage(message) {
    if (!(await isEnabled(db))) return;
    const to = message.to;
    const from = message.from;
    const text = message.text;
    if (!to || !from || !isBetaBotUid(to) || isBetaBotUid(from)) return;
    if (!text || !String(text).trim()) return;

    const bot = BOT_BY_UID[to];
    if (!bot) return;

    const senderName = (await db.collection('profiles').doc(from).get()).data()?.name || 'amigo/a';
    await new Promise((r) => setTimeout(r, 8000 + Math.floor(Math.random() * 12000)));

    const reply = await geminiReply(apiKey(), bot, text, senderName);
    await db.collection('messages').add({
      from: to,
      to: from,
      text: reply,
      timestamp: Date.now(),
      isBetaBot: true,
    });
    console.log('betaBot chat reply', to, '->', from);
  }

  async function bootstrapBetaBotProfiles() {
    let upserted = 0;
    for (const bot of PERSONAS.bots || []) {
      const photoUrl = `${PHOTO_HOSTING_BASE}/${bot.uid}_primary.png`;
      const anthem = getGymSoundAnthem(bot);
      const profile = {
        uid: bot.uid,
        name: bot.name,
        age: bot.age,
        gender: bot.gender,
        city: bot.city,
        country: bot.country || 'Chile',
        lat: bot.lat,
        lng: bot.lng,
        bio: bot.bio,
        photos: [photoUrl],
        trainingTypes: bot.trainingTypes || [],
        goals: bot.goals || [],
        level: bot.level || 'Intermedio',
        availability: bot.availability || ['Tarde'],
        isBetaBot: true,
        betaBotPersonality: bot.personality,
        betaBotVersion: PERSONAS.version || PHASE_VERSION,
        gymSoundAnthem: anthem,
        spotifyShareLive: false,
        trainingNow: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await db.collection('profiles').doc(bot.uid).set(profile, { merge: true });
      upserted++;
    }
    await db.collection('config').doc(CONFIG_DOC).set(
      {
        enabled: true,
        phase: PHASE_VERSION,
        version: PERSONAS.version || PHASE_VERSION,
        badgeLabel: PERSONAS.badgeLabel || BADGE_LABEL,
        botUids: (PERSONAS.bots || []).map((b) => b.uid),
        photoBaseUrl: PHOTO_HOSTING_BASE,
        batchSize: 3,
        botBotSocialEnabled: true,
        syncInviteEnabled: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return upserted;
  }

  const bootstrapBetaBotsHttp = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.status(405).send('GET or POST');
      return;
    }
    try {
      const upserted = await bootstrapBetaBotProfiles();
      console.log('bootstrapBetaBots', upserted);
      res.json({ ok: true, upserted, photoBaseUrl: PHOTO_HOSTING_BASE, phase: PHASE_VERSION });
    } catch (e) {
      console.error('bootstrapBetaBots failed', e);
      res.status(500).json({ ok: false, error: String(e.message || e) });
    }
  });

  const betaBotTick = functions.pubsub.schedule('every 30 minutes').onRun(async () => {
    if (!(await isEnabled(db))) {
      console.log('betaBotTick disabled');
      return null;
    }

    const cfg = await loadConfig(db);
    const cfgSnap = await db.collection('config').doc(CONFIG_DOC).get();
    if (!cfgSnap.exists) {
      await bootstrapBetaBotProfiles();
    }

    const hour = scheduling.getChileHour();
    const realLiveCounts = await countRealLiveByCity(db);
    const batchSize = scheduling.resolveBatchSize(cfg, hour);

    const shuffled = [...BOTS].sort(() => Math.random() - 0.5).slice(0, batchSize);
    const ctx = { hour, realLiveCounts, cfg };
    const results = [];

    for (const bot of shuffled) {
      try {
        const action = await runBotAction(bot, ctx);
        results.push({ uid: bot.uid, action });
      } catch (e) {
        console.warn('betaBotTick error', bot.uid, e);
        results.push({ uid: bot.uid, action: 'error' });
      }
    }

    let socialResult = null;
    if (cfg.botBotSocialEnabled !== false) {
      try {
        socialResult = await runBotBotSocial();
      } catch (e) {
        console.warn('betaBotTick social error', e);
        socialResult = { action: 'bot_bot_error' };
      }
    }

    await recordTickMetrics(results, socialResult, hour, realLiveCounts);
    console.log('betaBotTick', { hour, batchSize, results, socialResult });
    return null;
  });

  return {
    isBetaBotUid,
    BADGE_LABEL,
    BETA_BOT_PREFIX,
    maybeAutoMatchBot,
    maybeReplyToMessage,
    betaBotTick,
    bootstrapBetaBotsHttp,
    bootstrapBetaBotProfiles,
  };
}

module.exports = {
  register,
  isBetaBotUid,
  BADGE_LABEL,
  BOTS,
  scheduling,
  getGymSoundAnthem,
  buildBotLivePresence,
};
