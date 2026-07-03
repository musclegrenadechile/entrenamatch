/** Chile/LatAm gym slang → library exercise names for voice dictation. */
export const VOICE_EXERCISE_ALIASES: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /press\s*(de\s*)?banca|banca\s*plana|pecho\s*plano|^banca$|^banco$/i, name: 'Press banca' },
  { pattern: /press\s*inclinado|banca\s*inclinada|pecho\s*inclinado/i, name: 'Press banca inclinado' },
  { pattern: /press\s*militar|hombro\s*press|military\s*press|press\s*de\s*hombro/i, name: 'Press militar' },
  { pattern: /press\s*franc[eé]s|skull\s*crusher|rompecr[aá]neos/i, name: 'Press francés' },
  { pattern: /sentadilla|sentadillas|squat/i, name: 'Sentadilla libre' },
  { pattern: /sentadilla\s*b[uú]lgara|b[uú]lgara/i, name: 'Sentadilla búlgara' },
  { pattern: /peso\s*muerto\s*rumano|rumano\s*rumano|rdl/i, name: 'Peso muerto rumano' },
  { pattern: /peso\s*muerto|deadlift|santo\s*grial/i, name: 'Peso muerto' },
  { pattern: /dominada|dominadas|pull\s*up/i, name: 'Dominadas' },
  { pattern: /jal[oó]n\s*al\s*pecho|jal[oó]n|lat\s*pulldown|polea\s*alta/i, name: 'Jalón al pecho' },
  { pattern: /face\s*pull|facepull/i, name: 'Face pull' },
  { pattern: /remo\s*con\s*barra|remo\s*barra|remo\s*en\s*barra/i, name: 'Remo con barra' },
  { pattern: /remo\s*con\s*mancuerna|remo\s*mancuerna/i, name: 'Remo con mancuerna' },
  { pattern: /remo/i, name: 'Remo con mancuerna' },
  { pattern: /curl\s*con\s*barra|curl\s*barra|barra\s*de\s*curl/i, name: 'Curl con barra' },
  { pattern: /curl\s*con\s*mancuerna|curl\s*mancuerna|mancuerna\s*curl/i, name: 'Curl con mancuernas' },
  { pattern: /curl|b[ií]ceps/i, name: 'Curl con mancuernas' },
  { pattern: /tr[ií]ceps\s*pushdown|pushdown|tr[ií]ceps\s*en\s*polea/i, name: 'Tríceps en polea' },
  { pattern: /fondos\s*en\s*paralelas|fondos|dips/i, name: 'Fondos en paralelas' },
  { pattern: /flexiones|flexi[oó]n|lagartijas|push\s*up/i, name: 'Flexiones' },
  { pattern: /prensa\s*de\s*piernas|prensa\s*horizontal|prensa/i, name: 'Prensa de piernas' },
  {
    pattern: /extensiones?\s*de\s*cu[aá]driceps|extensi[oó]n\s*de\s*piernas|extensi[oó]n\s*cu[aá]driceps/i,
    name: 'Extensiones de cuádriceps',
  },
  { pattern: /curl\s*femoral|femoral\s*acostado/i, name: 'Curl femoral' },
  { pattern: /hip\s*thrust|empuje\s*de\s*cadera|thrust/i, name: 'Hip thrust' },
  { pattern: /elevaciones?\s*laterales|vuelos?\s*laterales/i, name: 'Elevaciones laterales' },
  { pattern: /aperturas?|apertura\s*con\s*mancuernas|fly\s*de\s*pecho/i, name: 'Aperturas con mancuernas' },
  { pattern: /zancadas?|lunges?|estocada/i, name: 'Zancadas' },
  { pattern: /fondos?\s*en\s*banco|step\s*up/i, name: 'Fondos en banco' },
  { pattern: /correr|running|trote|el[ií]ptica|bici|bicicleta|cinta|cardio/i, name: 'Cardio' },
]

const SPOKEN_NUM_WORD =
  'un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince|veinte|veinticinco|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa|cien'

export const VOICE_SPOKEN_NUM_PATTERN = new RegExp(`\\d+|${SPOKEN_NUM_WORD}`, 'i')

export function resolveVoiceExerciseAlias(rawName: string): string | null {
  const q = rawName.trim()
  if (!q) return null
  for (const { pattern, name } of VOICE_EXERCISE_ALIASES) {
    if (pattern.test(q)) return name
  }
  return null
}
