/**
 * Entreno por voz — audio → Gemini → JSON estructurado (fase registro voz B).
 */

const WORKOUT_VOICE_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const WORKOUT_VOICE_TEXT_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
const VALID_TYPES = new Set(['push', 'pull', 'legs', 'full', 'cardio', 'other']);

function stripDataPrefix(b64) {
  return String(b64 || '').replace(/^data:audio\/\w+;base64,/, '');
}

function normalizeAudioMime(mimeType) {
  const base = String(mimeType || 'audio/webm').toLowerCase().split(';')[0].trim();
  if (base === 'audio/3gpp' || base === 'audio/amr') return 'audio/3gpp';
  if (base === 'audio/x-m4a' || base === 'audio/m4a') return 'audio/mp4';
  const allowed = new Set([
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg',
    'audio/wav',
    'audio/mpeg',
    'audio/flac',
  ]);
  return allowed.has(base) ? base : 'audio/mp4';
}

function buildWorkoutVoicePrompt(recentNames) {
  const recent =
    Array.isArray(recentNames) && recentNames.length
      ? `Ejercicios recientes del usuario (priorízalos si encajan): ${recentNames.slice(0, 12).join(', ')}.`
      : '';
  return `Eres experto en registrar entrenamientos de gym en Chile/LatAm para EntrenaMatch.
Escucha el AUDIO con atención (español chileno, puede haber ruido de gym).
${recent}

TAREA:
1) transcript = lo que dijo el usuario, literal en español.
2) Extrae ejercicios, series, reps y peso en kg.

Devuelve SOLO JSON válido (sin markdown):
{
  "transcript": "string",
  "title": "string corto",
  "type": "push|pull|legs|full|cardio|other",
  "durationMin": number,
  "confidence": number 0-1,
  "exercises": [
    {
      "name": "nombre ejercicio en español",
      "setCount": number opcional si dice "3 series" pero no detalla cada una,
      "sets": [{ "reps": number, "weightKg": number, "minutesMin": number opcional, "intensity": number opcional }]
    }
  ]
}

REGLAS CRÍTICAS:
- "3 series de 8 a 80 kilos" en UN ejercicio → setCount:3 Y sets con 3 objetos {reps:8,weightKg:80}.
- "4x10" → 4 sets de reps:10 weightKg:0 (replica el set 4 veces en el array).
- "tres de ocho con ochenta" → 3 sets reps 8 weightKg 80.
- "press banca" / "banca" / "pecho plano" → name "Press banca".
- "sentadilla" / "squat" → "Sentadilla libre".
- "dominadas" → "Dominadas".
- "curl" / "bíceps" → "Curl con mancuernas".
- "remo" → "Remo con barra" o "Remo con mancuerna" según contexto.
- Cardio (correr, bici, elíptica, 30 minutos): type cardio, exercises con minutesMin.
- Si solo dice duración total sin ejercicios: exercises [] y durationMin > 0.
- Si el audio es inaudible o no es un entreno: confidence < 0.3, exercises [] y transcript con lo que alcanzaste a oír.
- NUNCA inventes ejercicios que no mencionó.`;
}

function expandExerciseSets(ex) {
  const name = String(ex.name || 'Ejercicio').slice(0, 80);
  let sets = Array.isArray(ex.sets)
    ? ex.sets.map((s) => ({
        reps: Math.max(0, Math.round(Number(s.reps) || 0)),
        weightKg: Math.max(0, Number(s.weightKg) || 0),
        ...(s.minutesMin != null
          ? { minutesMin: Math.max(1, Math.round(Number(s.minutesMin) || 15)) }
          : {}),
        ...(s.intensity != null
          ? { intensity: Math.min(10, Math.max(1, Math.round(Number(s.intensity) || 6))) }
          : {}),
      }))
    : [];

  const setCount = Math.round(
    Number(ex.setCount) || Number(ex.series) || Number(ex.seriesCount) || 0
  );

  if (setCount > 1 && sets.length === 1) {
    const template = sets[0];
    sets = Array.from({ length: Math.min(setCount, 20) }, () => ({ ...template }));
  } else if (setCount > sets.length && sets.length === 1) {
    const template = sets[0];
    sets = Array.from({ length: Math.min(setCount, 20) }, () => ({ ...template }));
  } else if (sets.length === 0 && setCount > 0) {
    sets = Array.from({ length: Math.min(setCount, 20) }, () => ({ reps: 10, weightKg: 0 }));
  }

  if (!sets.length) sets = [{ reps: 10, weightKg: 0 }];
  return { name, sets };
}

function sanitizeParsedWorkout(raw) {
  const type = VALID_TYPES.has(raw.type) ? raw.type : 'full';
  const durationMin = Math.min(240, Math.max(0, Math.round(Number(raw.durationMin) || 0)));
  const confidence = Math.min(1, Math.max(0, Number(raw.confidence) || 0.5));
  const exercises = Array.isArray(raw.exercises)
    ? raw.exercises.slice(0, 24).map((ex) => expandExerciseSets(ex))
    : [];
  return {
    transcript: String(raw.transcript || '').slice(0, 2000),
    title: String(raw.title || 'Entreno de hoy').slice(0, 80),
    type,
    durationMin: durationMin || (exercises.length ? 45 : 30),
    confidence,
    exercises,
    source: 'gemini',
  };
}

async function callGeminiWorkoutVoice(apiKey, audioBase64, mimeType, recentNames, classifyGeminiError, geminiUserMessage) {
  const prompt = buildWorkoutVoicePrompt(recentNames);
  const normalizedMime = normalizeAudioMime(mimeType);
  const parts = [
    {
      inline_data: {
        mime_type: normalizedMime,
        data: stripDataPrefix(audioBase64),
      },
    },
    { text: prompt },
  ];

  let lastErr = null;
  for (const model of WORKOUT_VOICE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 28_000);
      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
        });
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) {
        const errText = await res.text();
        const reason = classifyGeminiError(res.status, errText);
        const err = new Error(`Gemini error ${res.status}`);
        err.geminiReason = reason;
        throw err;
      }
      const json = await res.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON in Gemini workout response');
      const parsed = JSON.parse(match[0]);
      const result = sanitizeParsedWorkout(parsed);
      result.geminiModel = model;
      return result;
    } catch (err) {
      lastErr = err;
      const errMsg = err.name === 'AbortError' ? 'Gemini timeout' : err.message || err;
      console.warn('parseWorkoutVoice: model failed', model, errMsg);
      if (err.geminiReason === 'billing_depleted') break;
    }
  }
  const reason = lastErr?.geminiReason || 'unknown';
  const msg = geminiUserMessage(reason);
  const err = new Error(msg);
  err.geminiReason = reason;
  throw err;
}

function buildWorkoutVoiceTextPrompt(recentNames, transcript) {
  const recent =
    Array.isArray(recentNames) && recentNames.length
      ? `Ejercicios recientes (priorízalos si encajan): ${recentNames.slice(0, 12).join(', ')}.`
      : '';
  return `Eres experto en registrar entrenamientos de gym en Chile/LatAm para EntrenaMatch.
${recent}

Transcripción de voz del usuario:
"${String(transcript).slice(0, 1500)}"

Devuelve SOLO JSON válido:
{
  "transcript": "string (la transcripción corregida mínimamente)",
  "title": "string corto",
  "type": "push|pull|legs|full|cardio|other",
  "durationMin": number,
  "confidence": number 0-1,
  "exercises": [
    {
      "name": "nombre ejercicio en español",
      "setCount": number opcional,
      "sets": [{ "reps": number, "weightKg": number, "minutesMin": number opcional }]
    }
  ]
}

REGLAS:
- "3 series de 8 a 80 kilos" → setCount:3 y 3 sets {reps:8,weightKg:80}.
- "4x10" → 4 sets reps:10.
- press banca / banca → "Press banca"; sentadilla → "Sentadilla libre"; dominadas → "Dominadas".
- Cardio: type cardio, minutesMin en sets.
- No inventes ejercicios no mencionados.`;
}

async function callGeminiWorkoutVoiceText(
  apiKey,
  transcript,
  recentNames,
  classifyGeminiError,
  geminiUserMessage
) {
  const prompt = buildWorkoutVoiceTextPrompt(recentNames, transcript);
  let lastErr = null;
  for (const model of WORKOUT_VOICE_TEXT_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 18_000);
      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1536,
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
        });
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) {
        const errText = await res.text();
        const reason = classifyGeminiError(res.status, errText);
        const err = new Error(`Gemini error ${res.status}`);
        err.geminiReason = reason;
        throw err;
      }
      const json = await res.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON in Gemini workout text response');
      const parsed = JSON.parse(match[0]);
      const result = sanitizeParsedWorkout(parsed);
      result.geminiModel = model;
      result.source = 'gemini-text';
      return result;
    } catch (err) {
      lastErr = err;
      const errMsg = err.name === 'AbortError' ? 'Gemini timeout' : err.message || err;
      console.warn('parseWorkoutVoiceText: model failed', model, errMsg);
      if (err.geminiReason === 'billing_depleted') break;
    }
  }
  const reason = lastErr?.geminiReason || 'unknown';
  const msg = geminiUserMessage(reason);
  const err = new Error(msg);
  err.geminiReason = reason;
  throw err;
}

function register({ functions, geminiApiKey, classifyGeminiError, geminiUserMessage }) {
  const parseWorkoutVoice = functions
    .runWith({ secrets: [geminiApiKey], timeoutSeconds: 45, memory: '512MB' })
    .https.onCall(async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión.');
      }
      const audioBase64 = data && data.audioBase64 ? String(data.audioBase64) : '';
      const mimeType = data && data.mimeType ? String(data.mimeType) : 'audio/webm';
      const recentExerciseNames = Array.isArray(data?.recentExerciseNames)
        ? data.recentExerciseNames.map((n) => String(n).slice(0, 60))
        : [];

      if (!audioBase64 || audioBase64.length < 100) {
        throw new functions.https.HttpsError('invalid-argument', 'Audio requerido.');
      }
      if (audioBase64.length > 4_000_000) {
        throw new functions.https.HttpsError('invalid-argument', 'Audio demasiado largo — graba menos de 30 segundos.');
      }

      const apiKey =
        geminiApiKey.value() ||
        process.env.GEMINI_API_KEY ||
        (functions.config().gemini && functions.config().gemini.key) ||
        '';

      if (!apiKey) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Gemini no configurado — contacta soporte.'
        );
      }

      try {
        return await callGeminiWorkoutVoice(
          apiKey,
          audioBase64,
          mimeType,
          recentExerciseNames,
          classifyGeminiError,
          geminiUserMessage
        );
      } catch (err) {
        const reason = err.geminiReason || 'unknown';
        console.warn('parseWorkoutVoice failed', reason, err.message || err);
        throw new functions.https.HttpsError(
          'unavailable',
          err.message || geminiUserMessage(reason)
        );
      }
    });

  const parseWorkoutVoiceText = functions
    .runWith({ secrets: [geminiApiKey], timeoutSeconds: 25, memory: '256MB' })
    .https.onCall(async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión.');
      }
      const transcript = data && data.transcript ? String(data.transcript).trim() : '';
      const recentExerciseNames = Array.isArray(data?.recentExerciseNames)
        ? data.recentExerciseNames.map((n) => String(n).slice(0, 60))
        : [];

      if (!transcript || transcript.length < 8) {
        throw new functions.https.HttpsError('invalid-argument', 'Transcripción requerida.');
      }
      if (transcript.length > 2000) {
        throw new functions.https.HttpsError('invalid-argument', 'Transcripción demasiado larga.');
      }

      const apiKey =
        geminiApiKey.value() ||
        process.env.GEMINI_API_KEY ||
        (functions.config().gemini && functions.config().gemini.key) ||
        '';

      if (!apiKey) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Gemini no configurado — contacta soporte.'
        );
      }

      try {
        return await callGeminiWorkoutVoiceText(
          apiKey,
          transcript,
          recentExerciseNames,
          classifyGeminiError,
          geminiUserMessage
        );
      } catch (err) {
        const reason = err.geminiReason || 'unknown';
        console.warn('parseWorkoutVoiceText failed', reason, err.message || err);
        throw new functions.https.HttpsError(
          'unavailable',
          err.message || geminiUserMessage(reason)
        );
      }
    });

  return { parseWorkoutVoice, parseWorkoutVoiceText };
}

module.exports = { register, sanitizeParsedWorkout };
