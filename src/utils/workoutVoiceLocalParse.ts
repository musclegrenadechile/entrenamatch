import type { WorkoutType } from '../types'
import { VOICE_EXERCISE_ALIASES, VOICE_SPOKEN_NUM_PATTERN } from './workoutVoiceAliases'
import type { WorkoutVoiceParseResult } from './workoutVoiceApply'

export const LOCAL_PARSE_CONFIDENCE_THRESHOLD = 0.7
export const LOCAL_PARSE_RELAXED_THRESHOLD = 0.38

const WORD_NUM: Record<string, number> = {
  un: 1,
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  quince: 15,
  veinte: 20,
  veinticinco: 25,
  treinta: 30,
  cuarenta: 40,
  'cuarenta y cinco': 45,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
  cien: 100,
}

const WORD_NUM_KEYS_LONGEST_FIRST = Object.keys(WORD_NUM).sort((a, b) => b.length - a.length)

type ParsedExercise = WorkoutVoiceParseResult['exercises'][number]

/** Normalize common STT glitches before parsing. */
export function normalizeVoiceTranscript(transcript: string): string {
  return transcript
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\bpress de banco\b/gi, 'press de banca')
    .replace(/\bpecho plano\b/gi, 'press banca')
    .replace(/\bkilometros?\b/gi, 'kilos')
    .replace(/\brep(s)?\b/gi, 'reps')
    .replace(/\bserie(s)?\b/gi, (m) => (m.toLowerCase().startsWith('serie') ? 'series' : m))
}

function parseNumberToken(raw: string | undefined): number {
  if (!raw) return 0
  const t = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!t) return 0
  const direct = parseInt(t, 10)
  if (!Number.isNaN(direct)) return direct
  if (WORD_NUM[t] != null) return WORD_NUM[t]

  for (const phrase of WORD_NUM_KEYS_LONGEST_FIRST) {
    if (t === phrase) return WORD_NUM[phrase]!
    const re = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'i')
    if (re.test(t)) return WORD_NUM[phrase]!
  }

  const compound = t.match(/^(\w+)\s*y\s*(\w+)$/)
  if (compound) {
    const a = parseNumberToken(compound[1])
    const b = parseNumberToken(compound[2])
    if (a > 0 && b > 0) return a + b
  }
  return 0
}

function extractDurationMin(text: string): number {
  const compound = text.match(
    /(?:^|[,;])\s*(cuarenta\s*y\s*cinco|treinta\s*y\s*cinco|veinticinco)\s+\b(?:min(?:utos?)?|min\.?)\b/i
  )
  if (compound) return parseNumberToken(compound[1])

  const m = text.match(
    /(?:^|[,;])\s*(\d+|cuarenta\s*y\s*cinco|treinta\s*y\s*cinco|veinticinco)\s+\b(?:min(?:utos?)?|min\.?)\b/i
  )
  if (!m) {
    const tail = text.match(
      /(\d+|cuarenta\s*y\s*cinco|treinta\s*y\s*cinco|veinticinco)\s+\b(?:min(?:utos?)?|min\.?)\b\s*$/i
    )
    if (!tail) return 0
    const n = parseNumberToken(tail[1])
    return n > 0 && n <= 240 ? n : 0
  }
  const n = parseNumberToken(m[1])
  return n > 0 && n <= 240 ? n : 0
}

function stripDuration(text: string): string {
  return text
    .replace(
      /(?:^|[,;])\s*(cuarenta\s*y\s*cinco|treinta\s*y\s*cinco|veinticinco|\d+)\s+\b(?:min(?:utos?)?|min\.?)\b\s*/gi,
      ' '
    )
    .replace(
      /(\d+|cuarenta\s*y\s*cinco|treinta\s*y\s*cinco|veinticinco)\s+\b(?:min(?:utos?)?|min\.?)\b\s*$/gi,
      ' '
    )
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function splitSegments(text: string): string[] {
  return text
    .split(/\s*(?:,|;|\by\b|también|después|luego|además)\s*/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2)
}

function findRecentExerciseHits(
  text: string,
  recentNames: string[]
): Array<{ start: number; name: string; fromRecent: boolean }> {
  const lower = text.toLowerCase()
  const hits: Array<{ start: number; name: string; fromRecent: boolean }> = []
  for (const recent of recentNames.slice(0, 12)) {
    const q = recent.trim()
    if (!q) continue
    const idx = lower.indexOf(q.toLowerCase())
    if (idx >= 0) hits.push({ start: idx, name: q, fromRecent: true })
  }
  return hits
}

function findExerciseHits(
  text: string,
  recentNames: string[] = []
): Array<{ start: number; name: string; fromRecent: boolean }> {
  const hits = findRecentExerciseHits(text, recentNames)

  for (const { pattern, name } of VOICE_EXERCISE_ALIASES) {
    const re = new RegExp(pattern.source, pattern.flags)
    const match = re.exec(text)
    if (match?.index != null) {
      hits.push({ start: match.index, name, fromRecent: false })
    }
  }

  hits.sort((a, b) => a.start - b.start || (b.fromRecent ? 1 : 0) - (a.fromRecent ? 1 : 0))

  const deduped: Array<{ start: number; name: string; fromRecent: boolean }> = []
  for (const hit of hits) {
    const clash = deduped.find((d) => Math.abs(d.start - hit.start) <= 3)
    if (clash) {
      if (hit.fromRecent && !clash.fromRecent) {
        const idx = deduped.indexOf(clash)
        deduped[idx] = hit
      }
      continue
    }
    deduped.push(hit)
  }
  return deduped
}

function exercisesFromBody(body: string, recentNames: string[] = []): ParsedExercise[] {
  const hits = findExerciseHits(body, recentNames)
  if (hits.length > 0) {
    return hits.map((hit, index) => {
      const end = index + 1 < hits.length ? hits[index + 1].start : body.length
      const segment = body.slice(hit.start, end).trim()
      return { name: hit.name, sets: parseSetsFromSegment(segment) }
    })
  }

  const exercises: ParsedExercise[] = []
  for (const segment of splitSegments(body)) {
    const name = findExerciseName(segment, recentNames)
    if (!name) continue
    exercises.push({ name, sets: parseSetsFromSegment(segment) })
  }
  return exercises
}

function findExerciseName(segment: string, recentNames: string[] = []): string | null {
  const lower = segment.toLowerCase()
  for (const recent of recentNames) {
    if (recent && lower.includes(recent.toLowerCase())) return recent
  }
  for (const { pattern, name } of VOICE_EXERCISE_ALIASES) {
    if (pattern.test(segment)) return name
  }
  return null
}

const NUM = VOICE_SPOKEN_NUM_PATTERN.source

function buildSets(count: number, reps: number, weightKg: number): ParsedExercise['sets'] {
  const c = Math.min(20, Math.max(1, count))
  const template = { reps: reps || 10, weightKg: Math.max(0, weightKg) }
  return Array.from({ length: c }, () => ({ ...template }))
}

function parseSetsFromSegment(segment: string): ParsedExercise['sets'] {
  const seriesMatch = segment.match(
    new RegExp(
      `(${NUM})\\s*series?\\s*(?:de\\s*)?(${NUM})\\s*(?:reps?|repeticiones?)?(?:\\s*(?:a|con|de|@)\\s*(${NUM})\\s*(?:kg|kilos?|k\\b)?)?`,
      'i'
    )
  )
  if (seriesMatch) {
    return buildSets(
      parseNumberToken(seriesMatch[1]),
      parseNumberToken(seriesMatch[2]),
      parseNumberToken(seriesMatch[3])
    )
  }

  const seriesConMatch = segment.match(
    new RegExp(
      `(${NUM})\\s*series?\\s*(?:de\\s*)?(${NUM})\\s+con\\s+(${NUM})\\s*(?:kg|kilos?|k\\b)?`,
      'i'
    )
  )
  if (seriesConMatch) {
    return buildSets(
      parseNumberToken(seriesConMatch[1]),
      parseNumberToken(seriesConMatch[2]),
      parseNumberToken(seriesConMatch[3])
    )
  }

  const deConMatch = segment.match(
    new RegExp(
      `(${NUM})\\s+de\\s+(${NUM})\\s+con\\s+(${NUM})\\s*(?:kg|kilos?|k\\b)?`,
      'i'
    )
  )
  if (deConMatch) {
    return buildSets(
      parseNumberToken(deConMatch[1]),
      parseNumberToken(deConMatch[2]),
      parseNumberToken(deConMatch[3])
    )
  }

  const nxm = segment.match(new RegExp(`(${NUM})\\s*[x×]\\s*(${NUM})`, 'i'))
  if (nxm) {
    const weightAfter = segment.match(
      new RegExp(`(?:a|con|@)\\s*(${NUM})\\s*(?:kg|kilos?|k\\b)`, 'i')
    )
    return buildSets(
      parseNumberToken(nxm[1]),
      parseNumberToken(nxm[2]),
      weightAfter ? parseNumberToken(weightAfter[1]) : 0
    )
  }

  const porMatch = segment.match(new RegExp(`(${NUM})\\s*por\\s*(${NUM})`, 'i'))
  if (porMatch) {
    const weightAfter = segment.match(
      new RegExp(`(?:a|con|@)\\s*(${NUM})\\s*(?:kg|kilos?|k\\b)`, 'i')
    )
    return buildSets(
      parseNumberToken(porMatch[1]),
      parseNumberToken(porMatch[2]),
      weightAfter ? parseNumberToken(weightAfter[1]) : 0
    )
  }

  const weightOnly = segment.match(new RegExp(`(${NUM})\\s*(?:kg|kilos?|k\\b)`, 'i'))
  if (weightOnly) {
    return [{ reps: 10, weightKg: Math.max(0, parseNumberToken(weightOnly[1])) }]
  }

  const cardioMin = segment.match(
    new RegExp(`(${NUM})\\s+\\b(?:min(?:utos?)?|min\\.?)\\b`, 'i')
  )
  if (cardioMin) {
    return [
      {
        reps: 0,
        weightKg: 0,
        minutesMin: Math.max(1, parseNumberToken(cardioMin[1])),
      },
    ]
  }

  return [{ reps: 10, weightKg: 0 }]
}

function inferWorkoutType(exercises: ParsedExercise[], transcript: string): WorkoutType {
  const names = exercises.map((e) => e.name.toLowerCase()).join(' ')
  const t = transcript.toLowerCase()
  if (/cardio|correr|trote|bici|el[ií]ptica|cinta/.test(names + t)) return 'cardio'
  const push = /press|banca|flexion|fondos|tr[ií]ceps|hombro|militar|apertura/.test(names)
  const pull = /dominada|remo|jal[oó]n|curl|face pull/.test(names) && !/curl femoral/.test(names)
  const legs = /sentadilla|prensa|peso muerto|femoral|cu[aá]driceps|hip thrust|zancada/.test(names)
  if (push && !pull && !legs) return 'push'
  if (pull && !push && !legs) return 'pull'
  if (legs && !push && !pull) return 'legs'
  return 'full'
}

function buildTitle(exercises: ParsedExercise[]): string {
  if (!exercises.length) return 'Entreno de hoy'
  const first = exercises[0].name
  if (exercises.length === 1) return first
  return `${first} +${exercises.length - 1}`
}

function scoreLocalParse(
  transcript: string,
  exercises: ParsedExercise[],
  durationMin: number,
  usedRecent: boolean
): number {
  let score = 0.25
  if (transcript.trim().length >= 12) score += 0.1
  if (exercises.length > 0) score += 0.2
  if (exercises.length >= 2) score += 0.1
  if (usedRecent) score += 0.08

  const withAlias = exercises.filter((ex) =>
    VOICE_EXERCISE_ALIASES.some(({ name }) => name === ex.name)
  ).length
  if (withAlias > 0) score += 0.15
  if (withAlias === exercises.length && exercises.length > 0) score += 0.1

  const structuredSets = exercises.filter(
    (ex) =>
      ex.sets.length > 1 ||
      ex.sets.some((s) => s.reps > 0 && (s.weightKg > 0 || ex.sets.length > 1))
  ).length
  if (structuredSets > 0) score += 0.15
  if (durationMin > 0) score += 0.05

  return Math.min(0.95, score)
}

/** Fast on-device parse — no network. */
export function parseWorkoutVoiceLocally(
  transcript: string,
  recentNames: string[] = []
): WorkoutVoiceParseResult {
  const raw = normalizeVoiceTranscript(transcript)
  const durationMin = extractDurationMin(raw) || 45
  const body = stripDuration(raw)
  const exercises = exercisesFromBody(body, recentNames)

  if (!exercises.length) {
    const wholeName = findExerciseName(body, recentNames)
    if (wholeName) {
      exercises.push({ name: wholeName, sets: parseSetsFromSegment(body) })
    }
  }

  const usedRecent = recentNames.some((r) =>
    exercises.some((ex) => ex.name.toLowerCase() === r.toLowerCase())
  )

  const type = inferWorkoutType(exercises, raw)
  const confidence = scoreLocalParse(raw, exercises, durationMin, usedRecent)

  return {
    transcript: raw,
    title: buildTitle(exercises),
    type,
    durationMin,
    confidence,
    exercises,
    source: 'local',
  }
}

export function shouldUseLocalParse(result: WorkoutVoiceParseResult): boolean {
  const t = result.transcript.trim()
  if (t.length < 8 || result.exercises.length === 0) return false
  if (result.confidence >= LOCAL_PARSE_CONFIDENCE_THRESHOLD) return true

  const hasStructure = result.exercises.some(
    (ex) =>
      ex.sets.length > 1 ||
      ex.sets.some((s) => s.reps > 0 && (s.weightKg > 0 || ex.sets.length > 1))
  )
  if (result.confidence >= LOCAL_PARSE_RELAXED_THRESHOLD && hasStructure) return true

  // Any recognized exercise with reps — show instantly rather than waiting for IA.
  return result.exercises.some((ex) => ex.sets.some((s) => s.reps > 0))
}
