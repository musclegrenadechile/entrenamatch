/** Common gym exercises — LATAM / SmartFit-style library for EntrenoLog. */

export interface LibraryExercise {
  name: string
  muscle: string
  type: 'compound' | 'isolation' | 'cardio'
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // —— Pecho ——
  { name: 'Press banca', muscle: 'Pecho', type: 'compound' },
  { name: 'Press banca inclinado', muscle: 'Pecho', type: 'compound' },
  { name: 'Press banca declinado', muscle: 'Pecho', type: 'compound' },
  { name: 'Press plano con mancuernas', muscle: 'Pecho', type: 'compound' },
  { name: 'Press inclinado con mancuernas', muscle: 'Pecho', type: 'compound' },
  { name: 'Press declinado con mancuernas', muscle: 'Pecho', type: 'compound' },
  { name: 'Press en máquina pecho', muscle: 'Pecho', type: 'compound' },
  { name: 'Press en máquina inclinado', muscle: 'Pecho', type: 'compound' },
  { name: 'Press en máquina declinado', muscle: 'Pecho', type: 'compound' },
  { name: 'Press con mancuernas en suelo', muscle: 'Pecho', type: 'compound' },
  { name: 'Press landmine', muscle: 'Pecho', type: 'compound' },
  { name: 'Flexiones', muscle: 'Pecho', type: 'compound' },
  { name: 'Flexiones inclinadas', muscle: 'Pecho', type: 'compound' },
  { name: 'Flexiones declinadas', muscle: 'Pecho', type: 'compound' },
  { name: 'Flexiones con palmada', muscle: 'Pecho', type: 'compound' },
  { name: 'Flexiones en anillas', muscle: 'Pecho', type: 'compound' },
  { name: 'Fondos en paralelas', muscle: 'Pecho', type: 'compound' },
  { name: 'Fondos en banco', muscle: 'Pecho', type: 'compound' },
  { name: 'Aperturas con mancuernas', muscle: 'Pecho', type: 'isolation' },
  { name: 'Aperturas inclinadas con mancuernas', muscle: 'Pecho', type: 'isolation' },
  { name: 'Aperturas en polea', muscle: 'Pecho', type: 'isolation' },
  { name: 'Cruces en polea alta', muscle: 'Pecho', type: 'isolation' },
  { name: 'Cruces en polea baja', muscle: 'Pecho', type: 'isolation' },
  { name: 'Cruces en polea media', muscle: 'Pecho', type: 'isolation' },
  { name: 'Peck deck / mariposa', muscle: 'Pecho', type: 'isolation' },
  { name: 'Pullover con mancuerna', muscle: 'Pecho', type: 'isolation' },
  { name: 'Pullover en polea', muscle: 'Pecho', type: 'isolation' },
  { name: 'Press Svend', muscle: 'Pecho', type: 'isolation' },

  // —— Espalda ——
  { name: 'Dominadas', muscle: 'Espalda', type: 'compound' },
  { name: 'Dominadas supinas', muscle: 'Espalda', type: 'compound' },
  { name: 'Dominadas agarre neutro', muscle: 'Espalda', type: 'compound' },
  { name: 'Dominadas asistidas', muscle: 'Espalda', type: 'compound' },
  { name: 'Jalón al pecho', muscle: 'Espalda', type: 'compound' },
  { name: 'Jalón al pecho agarre ancho', muscle: 'Espalda', type: 'compound' },
  { name: 'Jalón al pecho agarre cerrado', muscle: 'Espalda', type: 'compound' },
  { name: 'Jalón agarre neutro', muscle: 'Espalda', type: 'compound' },
  { name: 'Jalón tras nuca', muscle: 'Espalda', type: 'compound' },
  { name: 'Jalón unilateral', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo con barra', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo con barra T', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo en T', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo con mancuerna', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo con mancuerna apoyado', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo en polea baja', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo en polea baja agarre ancho', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo en polea baja agarre cerrado', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo en máquina', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo en máquina unilateral', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo Meadows', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo seal', muscle: 'Espalda', type: 'compound' },
  { name: 'Peso muerto convencional', muscle: 'Espalda', type: 'compound' },
  { name: 'Peso muerto sumo', muscle: 'Espalda', type: 'compound' },
  { name: 'Peso muerto rumano', muscle: 'Espalda', type: 'compound' },
  { name: 'Peso muerto con mancuernas', muscle: 'Espalda', type: 'compound' },
  { name: 'Pulldown straight arm', muscle: 'Espalda', type: 'isolation' },
  { name: 'Pullover en máquina', muscle: 'Espalda', type: 'isolation' },
  { name: 'Hiperextensiones', muscle: 'Espalda', type: 'isolation' },
  { name: 'Hiperextensiones 45°', muscle: 'Espalda', type: 'isolation' },
  { name: 'Good morning', muscle: 'Espalda', type: 'compound' },
  { name: 'Encogimientos con barra', muscle: 'Trapecio', type: 'isolation' },
  { name: 'Encogimientos con mancuernas', muscle: 'Trapecio', type: 'isolation' },
  { name: 'Encogimientos en polea baja', muscle: 'Trapecio', type: 'isolation' },
  { name: 'Remo al mentón con barra', muscle: 'Trapecio', type: 'compound' },
  { name: 'Remo al mentón con mancuernas', muscle: 'Trapecio', type: 'compound' },

  // —— Hombros ——
  { name: 'Press militar', muscle: 'Hombros', type: 'compound' },
  { name: 'Press militar con mancuernas', muscle: 'Hombros', type: 'compound' },
  { name: 'Press Arnold', muscle: 'Hombros', type: 'compound' },
  { name: 'Press con mancuernas sentado', muscle: 'Hombros', type: 'compound' },
  { name: 'Press con mancuernas de pie', muscle: 'Hombros', type: 'compound' },
  { name: 'Press en máquina hombros', muscle: 'Hombros', type: 'compound' },
  { name: 'Press landmine hombros', muscle: 'Hombros', type: 'compound' },
  { name: 'Elevaciones laterales', muscle: 'Hombros', type: 'isolation' },
  { name: 'Elevaciones laterales en polea', muscle: 'Hombros', type: 'isolation' },
  { name: 'Elevaciones laterales inclinado', muscle: 'Hombros', type: 'isolation' },
  { name: 'Elevaciones frontales', muscle: 'Hombros', type: 'isolation' },
  { name: 'Elevaciones frontales con disco', muscle: 'Hombros', type: 'isolation' },
  { name: 'Elevaciones frontales en polea', muscle: 'Hombros', type: 'isolation' },
  { name: 'Pájaros / reverse fly', muscle: 'Hombros', type: 'isolation' },
  { name: 'Pájaros en polea', muscle: 'Hombros', type: 'isolation' },
  { name: 'Pájaros en máquina', muscle: 'Hombros', type: 'isolation' },
  { name: 'Face pull', muscle: 'Hombros', type: 'isolation' },
  { name: 'Y raise', muscle: 'Hombros', type: 'isolation' },
  { name: 'Remo al mentón', muscle: 'Hombros', type: 'compound' },
  { name: 'Handstand push-up', muscle: 'Hombros', type: 'compound' },

  // —— Piernas ——
  { name: 'Sentadilla libre', muscle: 'Piernas', type: 'compound' },
  { name: 'Sentadilla frontal', muscle: 'Piernas', type: 'compound' },
  { name: 'Sentadilla con pausa', muscle: 'Piernas', type: 'compound' },
  { name: 'Sentadilla goblet', muscle: 'Piernas', type: 'compound' },
  { name: 'Sentadilla en Smith', muscle: 'Piernas', type: 'compound' },
  { name: 'Sentadilla búlgara', muscle: 'Piernas', type: 'compound' },
  { name: 'Sentadilla sissy', muscle: 'Piernas', type: 'isolation' },
  { name: 'Prensa de piernas', muscle: 'Piernas', type: 'compound' },
  { name: 'Prensa de piernas unilateral', muscle: 'Piernas', type: 'compound' },
  { name: 'Hack squat', muscle: 'Piernas', type: 'compound' },
  { name: 'Hack squat en Smith', muscle: 'Piernas', type: 'compound' },
  { name: 'Zancadas caminando', muscle: 'Piernas', type: 'compound' },
  { name: 'Zancadas estáticas', muscle: 'Piernas', type: 'compound' },
  { name: 'Zancadas inversas', muscle: 'Piernas', type: 'compound' },
  { name: 'Zancadas laterales', muscle: 'Piernas', type: 'compound' },
  { name: 'Step-up', muscle: 'Piernas', type: 'compound' },
  { name: 'Peso muerto piernas rígidas', muscle: 'Piernas', type: 'compound' },
  { name: 'Peso muerto rumano con mancuernas', muscle: 'Piernas', type: 'compound' },
  { name: 'Curl femoral acostado', muscle: 'Piernas', type: 'isolation' },
  { name: 'Curl femoral sentado', muscle: 'Piernas', type: 'isolation' },
  { name: 'Curl femoral de pie', muscle: 'Piernas', type: 'isolation' },
  { name: 'Curl femoral en polea', muscle: 'Piernas', type: 'isolation' },
  { name: 'Extensión de cuádriceps', muscle: 'Piernas', type: 'isolation' },
  { name: 'Extensión de cuádriceps unilateral', muscle: 'Piernas', type: 'isolation' },
  { name: 'Adductor en máquina', muscle: 'Piernas', type: 'isolation' },
  { name: 'Abductor en máquina', muscle: 'Piernas', type: 'isolation' },
  { name: 'Gemelos de pie', muscle: 'Piernas', type: 'isolation' },
  { name: 'Gemelos sentado', muscle: 'Piernas', type: 'isolation' },
  { name: 'Gemelos en prensa', muscle: 'Piernas', type: 'isolation' },
  { name: 'Gemelos en máquina', muscle: 'Piernas', type: 'isolation' },
  { name: 'Gemelos en escalón', muscle: 'Piernas', type: 'isolation' },
  { name: 'Tibial anterior en máquina', muscle: 'Piernas', type: 'isolation' },

  // —— Glúteos ——
  { name: 'Hip thrust', muscle: 'Glúteos', type: 'compound' },
  { name: 'Hip thrust con barra', muscle: 'Glúteos', type: 'compound' },
  { name: 'Hip thrust en máquina', muscle: 'Glúteos', type: 'compound' },
  { name: 'Puente de glúteos', muscle: 'Glúteos', type: 'compound' },
  { name: 'Puente de glúteos unilateral', muscle: 'Glúteos', type: 'compound' },
  { name: 'Patada de glúteo en polea', muscle: 'Glúteos', type: 'isolation' },
  { name: 'Patada de glúteo en máquina', muscle: 'Glúteos', type: 'isolation' },
  { name: 'Abducción en polea', muscle: 'Glúteos', type: 'isolation' },
  { name: 'Abducción en máquina', muscle: 'Glúteos', type: 'isolation' },
  { name: 'Caminata lateral con banda', muscle: 'Glúteos', type: 'isolation' },
  { name: 'Clamshell con banda', muscle: 'Glúteos', type: 'isolation' },
  { name: 'Frog pump', muscle: 'Glúteos', type: 'isolation' },

  // —— Bíceps ——
  { name: 'Curl de bíceps con barra', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl de bíceps con barra Z', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl de bíceps con barra EZ', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl con mancuernas', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl alterno con mancuernas', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl simultáneo con mancuernas', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl inclinado con mancuernas', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl martillo', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl martillo cruzado', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl martillo en polea', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl concentrado', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl concentrado en polea', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl en banco Scott', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl predicador', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl predicador con mancuernas', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl spider', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl en polea baja', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl en polea baja agarre supino', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl en polea alta', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl sobre cabeza en polea', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl bayesian', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl drag', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl 21 con barra', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl en máquina bíceps', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl con banda elástica', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl en cable unilateral', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl Zottman', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl con disco', muscle: 'Bíceps', type: 'isolation' },

  // —— Tríceps ——
  { name: 'Extensión de tríceps en polea', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Extensión de tríceps en polea con cuerda', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Extensión de tríceps en polea barra recta', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Extensión de tríceps en polea barra V', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Extensión de tríceps en polea alta', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Extensión de tríceps un brazo en polea', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Extensión de tríceps invertida en polea', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Press francés', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Press francés con barra Z', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Press francés con mancuernas', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Press francés inclinado', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Skull crusher', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Skull crusher con mancuernas', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Fondos en paralelas (tríceps)', muscle: 'Tríceps', type: 'compound' },
  { name: 'Fondos en banco (tríceps)', muscle: 'Tríceps', type: 'compound' },
  { name: 'Fondos en máquina asistida', muscle: 'Tríceps', type: 'compound' },
  { name: 'Patada de tríceps', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Patada de tríceps en polea', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Extensión overhead con mancuerna', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Extensión overhead con mancuernas', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Extensión overhead en polea', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Extensión overhead un brazo en polea', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Press cerrado con barra', muscle: 'Tríceps', type: 'compound' },
  { name: 'Press cerrado con mancuernas', muscle: 'Tríceps', type: 'compound' },
  { name: 'Press cerrado en Smith', muscle: 'Tríceps', type: 'compound' },
  { name: 'JM press', muscle: 'Tríceps', type: 'compound' },
  { name: 'Extensión en máquina tríceps', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Press en máquina dip', muscle: 'Tríceps', type: 'compound' },
  { name: 'Diamond push-up', muscle: 'Tríceps', type: 'compound' },

  // —— Antebrazos ——
  { name: 'Curl de muñeca con barra', muscle: 'Antebrazos', type: 'isolation' },
  { name: 'Curl de muñeca con mancuernas', muscle: 'Antebrazos', type: 'isolation' },
  { name: 'Curl de muñeca inverso', muscle: 'Antebrazos', type: 'isolation' },
  { name: 'Curl inverso con barra', muscle: 'Antebrazos', type: 'isolation' },
  { name: 'Curl martillo para antebrazo', muscle: 'Antebrazos', type: 'isolation' },
  { name: 'Farmer walk', muscle: 'Antebrazos', type: 'compound' },
  { name: 'Farmer hold', muscle: 'Antebrazos', type: 'isolation' },
  { name: 'Rollo de muñeca con disco', muscle: 'Antebrazos', type: 'isolation' },
  { name: 'Pinch grip con discos', muscle: 'Antebrazos', type: 'isolation' },
  { name: 'Wrist roller', muscle: 'Antebrazos', type: 'isolation' },

  // —— Core ——
  { name: 'Plancha', muscle: 'Core', type: 'isolation' },
  { name: 'Plancha lateral', muscle: 'Core', type: 'isolation' },
  { name: 'Plancha con alcance', muscle: 'Core', type: 'isolation' },
  { name: 'Crunch', muscle: 'Core', type: 'isolation' },
  { name: 'Crunch en polea', muscle: 'Core', type: 'isolation' },
  { name: 'Crunch en máquina', muscle: 'Core', type: 'isolation' },
  { name: 'Crunch bicicleta', muscle: 'Core', type: 'isolation' },
  { name: 'Abdominales en máquina', muscle: 'Core', type: 'isolation' },
  { name: 'Elevación de piernas colgado', muscle: 'Core', type: 'isolation' },
  { name: 'Elevación de piernas en banco', muscle: 'Core', type: 'isolation' },
  { name: 'Elevación de rodillas en paralelas', muscle: 'Core', type: 'isolation' },
  { name: 'Russian twist', muscle: 'Core', type: 'isolation' },
  { name: 'Pallof press', muscle: 'Core', type: 'isolation' },
  { name: 'Dead bug', muscle: 'Core', type: 'isolation' },
  { name: 'Bird dog', muscle: 'Core', type: 'isolation' },
  { name: 'Ab wheel / rueda abdominal', muscle: 'Core', type: 'isolation' },
  { name: 'Dragon flag', muscle: 'Core', type: 'isolation' },
  { name: 'Hollow hold', muscle: 'Core', type: 'isolation' },
  { name: 'Woodchop en polea', muscle: 'Core', type: 'isolation' },
  { name: 'Cable crunch', muscle: 'Core', type: 'isolation' },
  { name: 'Vacuum abdominal', muscle: 'Core', type: 'isolation' },

  // —— Cardio ——
  { name: 'Cinta / caminadora', muscle: 'Cardio', type: 'cardio' },
  { name: 'Cinta inclinada', muscle: 'Cardio', type: 'cardio' },
  { name: 'Bicicleta estática', muscle: 'Cardio', type: 'cardio' },
  { name: 'Bicicleta spinning', muscle: 'Cardio', type: 'cardio' },
  { name: 'Elíptica', muscle: 'Cardio', type: 'cardio' },
  { name: 'Remo ergómetro', muscle: 'Cardio', type: 'cardio' },
  { name: 'Escaladora / stairmaster', muscle: 'Cardio', type: 'cardio' },
  { name: 'Assault bike', muscle: 'Cardio', type: 'cardio' },
  { name: 'Ski erg', muscle: 'Cardio', type: 'cardio' },
  { name: 'Battle ropes', muscle: 'Cardio', type: 'cardio' },
  { name: 'Salto a la cuerda', muscle: 'Cardio', type: 'cardio' },
  { name: 'Caminata en cinta', muscle: 'Cardio', type: 'cardio' },
  { name: 'Trote en cinta', muscle: 'Cardio', type: 'cardio' },
  { name: 'Sprint en cinta', muscle: 'Cardio', type: 'cardio' },

  // —— Full body / funcional ——
  { name: 'Burpees', muscle: 'Full body', type: 'cardio' },
  { name: 'Kettlebell swing', muscle: 'Full body', type: 'compound' },
  { name: 'Kettlebell clean', muscle: 'Full body', type: 'compound' },
  { name: 'Kettlebell snatch', muscle: 'Full body', type: 'compound' },
  { name: 'Thruster con mancuernas', muscle: 'Full body', type: 'compound' },
  { name: 'Thruster con barra', muscle: 'Full body', type: 'compound' },
  { name: 'Clean and press', muscle: 'Full body', type: 'compound' },
  { name: 'Box jump', muscle: 'Full body', type: 'cardio' },
  { name: 'Sled push', muscle: 'Full body', type: 'compound' },
  { name: 'Sled pull', muscle: 'Full body', type: 'compound' },
  { name: 'Wall ball', muscle: 'Full body', type: 'compound' },
  { name: 'Man makers', muscle: 'Full body', type: 'compound' },
  { name: 'Turkish get-up', muscle: 'Full body', type: 'compound' },
  { name: 'Muscle-up', muscle: 'Full body', type: 'compound' },
  { name: 'Caminata del granjero', muscle: 'Full body', type: 'compound' },
]

export const WORKOUT_TYPE_LABELS: Record<string, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Piernas',
  full: 'Full body',
  cardio: 'Cardio',
  other: 'Otro',
}

export const MUSCLE_GROUPS = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Piernas',
  'Glúteos',
  'Bíceps',
  'Tríceps',
  'Antebrazos',
  'Trapecio',
  'Core',
  'Cardio',
  'Full body',
] as const

/** Muscle tab in Arena picker — Cardio includes functional full-body moves. */
export function exerciseMatchesMuscleTab(exercise: LibraryExercise, tab: string): boolean {
  if (tab === 'Todos') return true
  if (tab === 'Cardio') return exercise.muscle === 'Cardio' || exercise.muscle === 'Full body'
  return exercise.muscle === tab
}

export function getLibraryExercise(name: string): LibraryExercise | undefined {
  const q = name.trim().toLowerCase()
  return EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === q)
}

/** Machine / aerobic cardio — logged by minutes + intensity, not reps × kg. */
export function isTimedCardioExercise(name: string): boolean {
  const ex = getLibraryExercise(name)
  return ex?.type === 'cardio' && ex.muscle === 'Cardio'
}

export function filterLibraryByMuscleTab(tab: string): LibraryExercise[] {
  if (tab === 'Todos') return EXERCISE_LIBRARY
  return EXERCISE_LIBRARY.filter((e) => exerciseMatchesMuscleTab(e, tab))
}

export function filterExercises(query: string, limit = 24, muscle?: string): LibraryExercise[] {
  const q = query.trim().toLowerCase()
  let list = EXERCISE_LIBRARY
  if (muscle) {
    list = filterLibraryByMuscleTab(muscle)
  }
  if (!q) return list.slice(0, limit)
  return list
    .filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.muscle.toLowerCase().includes(q) ||
        (q.length >= 3 && e.name.toLowerCase().split(' ').some((w) => w.startsWith(q)))
    )
    .slice(0, limit)
}

export function countExercisesByMuscle(muscle: string): number {
  return EXERCISE_LIBRARY.filter((e) => e.muscle === muscle).length
}
