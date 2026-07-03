import type { Profile } from '../types'

/** Fase 451 — demo seed profiles + chat openers (extracted from App.tsx). */

// ==================== GLOBAL SEED PROFILES - ENTRENAMATCH ====================
// Lanzamiento inicial fuerte en Chile + presencia en LatAm y España
export const SEED_PROFILES: Profile[] = [
  {
    id: 'p1', name: 'Camila Morales', age: 26, gender: 'mujer',
    city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528,
    bio: 'Pesas + correr en la playa al atardecer. Busco compañero/a constante para motivarnos. ¡Amante del café post entreno!',
    photos: ['https://picsum.photos/id/1011/600/800', 'https://picsum.photos/id/1009/600/800', 'https://picsum.photos/id/1005/600/800'],
    trainingTypes: ['Pesas/Gym', 'Running'], goals: ['Ganar músculo', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Tarde', 'Noche']
  },
  {
    id: 'p2', name: 'Joaquín Pérez', age: 29, gender: 'hombre',
    city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693,
    bio: 'CrossFit 4 veces por semana. Me encanta salir a correr por el parque los fines de semana. ¿Te animas?',
    photos: ['https://picsum.photos/id/1005/600/800', 'https://picsum.photos/id/201/600/800', 'https://picsum.photos/id/160/600/800'],
    trainingTypes: ['CrossFit', 'Running', 'Funcional'], goals: ['Aumentar fuerza', 'Mejorar resistencia', 'Preparar competencia'], level: 'Avanzado', availability: ['Mañana', 'Tarde']
  },
  {
    id: 'p3', name: 'Valentina Soto', age: 24, gender: 'mujer',
    city: 'Valparaíso', country: 'Chile', lat: -33.0472, lng: -71.6127,
    bio: 'Calistenia y yoga. Entreno en los cerros o en casa. Busco gente para entrenar al aire libre y tomar mate después 🧉',
    photos: ['https://picsum.photos/id/1009/600/800', 'https://picsum.photos/id/29/600/800'],
    trainingTypes: ['Calistenia', 'Yoga', 'Funcional'], goals: ['Movilidad y flexibilidad', 'Socializar y motivación', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Mañana', 'Tarde']
  },
  {
    id: 'p4', name: 'Diego Herrera', age: 32, gender: 'hombre',
    city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816,
    bio: 'Gym + boxeo. 6 años entrenando. Busco sparring o compañero de pesas serio. Nada de excusas.',
    photos: ['https://picsum.photos/id/201/600/800', 'https://picsum.photos/id/64/600/800'],
    trainingTypes: ['Pesas/Gym', 'Boxeo'], goals: ['Aumentar fuerza', 'Ganar músculo'], level: 'Avanzado', availability: ['Tarde', 'Noche']
  },
  {
    id: 'p5', name: 'Isabella Mendoza', age: 28, gender: 'mujer',
    city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528,
    bio: 'Running y pilates. Corro 3 veces por semana por la costanera. Ideal para quien quiera sumar kms conmigo.',
    photos: ['https://picsum.photos/id/1005/600/800', 'https://picsum.photos/id/1012/600/800'],
    trainingTypes: ['Running', 'Pilates'], goals: ['Perder grasa', 'Mejorar resistencia', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Mañana']
  },
  {
    id: 'p6', name: 'Matías Vargas', age: 25, gender: 'hombre',
    city: 'Concepción', country: 'Chile', lat: -36.8201, lng: -73.0445,
    bio: 'Funcional y calistenia. Me encanta entrenar al amanecer. ¿Quién se levanta temprano?',
    photos: ['https://picsum.photos/id/160/600/800', 'https://picsum.photos/id/1008/600/800'],
    trainingTypes: ['Calistenia', 'Funcional', 'Running'], goals: ['Aumentar fuerza', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Mañana']
  },
  {
    id: 'p7', name: 'Sofía Lagos', age: 23, gender: 'mujer',
    city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693,
    bio: 'Gym y un poco de todo. Principiante motivada buscando grupo o persona para ir al gimnasio sin miedo.',
    photos: ['https://picsum.photos/id/29/600/800', 'https://picsum.photos/id/1011/600/800'],
    trainingTypes: ['Pesas/Gym', 'Funcional'], goals: ['Perder grasa', 'Socializar y motivación', 'Mantenerse en forma'], level: 'Principiante', availability: ['Tarde', 'Noche']
  },
  {
    id: 'p8', name: 'Lucas Fernández', age: 35, gender: 'hombre',
    city: 'Ciudad de México', country: 'México', lat: 19.4326, lng: -99.1332,
    bio: 'Ciclismo de ruta y gym. Salgo todos los sábados temprano. Nivel avanzado, busco gente seria.',
    photos: ['https://picsum.photos/id/64/600/800', 'https://picsum.photos/id/201/600/800'],
    trainingTypes: ['Ciclismo', 'Pesas/Gym'], goals: ['Mejorar resistencia', 'Preparar competencia'], level: 'Avanzado', availability: ['Mañana']
  },
  {
    id: 'p9', name: 'Antonia Ruiz', age: 30, gender: 'mujer',
    city: 'Madrid', country: 'España', lat: 40.4168, lng: -3.7038,
    bio: 'Yoga + running + algo de pesas. Equilibrio mental y físico. Me encanta conocer gente nueva con la misma energía.',
    photos: ['https://picsum.photos/id/1009/600/800', 'https://picsum.photos/id/30/600/800'],
    trainingTypes: ['Yoga', 'Running', 'Pesas/Gym'], goals: ['Movilidad y flexibilidad', 'Mantenerse en forma', 'Socializar y motivación'], level: 'Intermedio', availability: ['Mañana', 'Tarde']
  },
  {
    id: 'p10', name: 'Benjamín Cruz', age: 27, gender: 'hombre',
    city: 'Lima', country: 'Perú', lat: -12.0464, lng: -77.0428,
    bio: 'CrossFit y natación. Entreno en un box en Miraflores. Busco compañero de WODs.',
    photos: ['https://picsum.photos/id/160/600/800', 'https://picsum.photos/id/1005/600/800'],
    trainingTypes: ['CrossFit', 'Natación'], goals: ['Aumentar fuerza', 'Mejorar resistencia'], level: 'Avanzado', availability: ['Tarde', 'Noche']
  },
  {
    id: 'p11', name: 'Renata Díaz', age: 22, gender: 'mujer',
    city: 'Bogotá', country: 'Colombia', lat: 4.7110, lng: -74.0721,
    bio: 'Calistenia en las barras del parque. Nivel intermedio buscando progresar en dominadas.',
    photos: ['https://picsum.photos/id/1012/600/800', 'https://picsum.photos/id/29/600/800'],
    trainingTypes: ['Calistenia', 'Funcional'], goals: ['Aumentar fuerza', 'Ganar músculo'], level: 'Intermedio', availability: ['Tarde']
  },
  {
    id: 'p12', name: 'Sebastián Morales', age: 31, gender: 'hombre',
    city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693,
    bio: 'Pesas pesado y algo de boxeo. 4 años consistente. Busco gente que entrene en serio.',
    photos: ['https://picsum.photos/id/201/600/800', 'https://picsum.photos/id/64/600/800'],
    trainingTypes: ['Pesas/Gym', 'Boxeo'], goals: ['Ganar músculo', 'Aumentar fuerza'], level: 'Avanzado', availability: ['Noche']
  },
  {
    id: 'p13', name: 'Martina Vega', age: 26, gender: 'mujer',
    city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528,
    bio: 'Pilates + running. Recuperándome de lesión pero con muchas ganas. Ideal para alguien paciente.',
    photos: ['https://picsum.photos/id/1009/600/800', 'https://picsum.photos/id/1011/600/800'],
    trainingTypes: ['Pilates', 'Running'], goals: ['Rehabilitación / Lesión', 'Mantenerse en forma', 'Movilidad y flexibilidad'], level: 'Principiante', availability: ['Mañana', 'Tarde']
  },
  {
    id: 'p14', name: 'Felipe Navarro', age: 28, gender: 'hombre',
    city: 'Valparaíso', country: 'Chile', lat: -33.0472, lng: -71.6127,
    bio: 'Funcional, pesas y trail running. Me muevo entre Valpo y Viña. ¿Salimos a correr?',
    photos: ['https://picsum.photos/id/1008/600/800', 'https://picsum.photos/id/160/600/800'],
    trainingTypes: ['Funcional', 'Pesas/Gym', 'Running'], goals: ['Mejorar resistencia', 'Perder grasa'], level: 'Intermedio', availability: ['Mañana', 'Noche']
  },
  {
    id: 'p15', name: 'Carolina Mendoza', age: 29, gender: 'mujer',
    city: 'Miami', country: 'Estados Unidos', lat: 25.7617, lng: -80.1918,
    bio: 'Gym + running por la playa. Chilena viviendo en Miami. Busco gente con la misma disciplina.',
    photos: ['https://picsum.photos/id/1011/600/800', 'https://picsum.photos/id/1009/600/800'],
    trainingTypes: ['Pesas/Gym', 'Running'], goals: ['Perder grasa', 'Ganar músculo'], level: 'Intermedio', availability: ['Mañana', 'Tarde']
  },
  { id: 'p16', name: 'Alejandro Ruiz', age: 22, gender: 'hombre', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/29/600/800', 'https://picsum.photos/id/30/600/800', 'https://picsum.photos/id/64/600/800'], trainingTypes: ['Pesas/Gym', 'Running'], goals: ['Ganar músculo', 'Aumentar fuerza'], level: 'Intermedio', availability: ['Mañana', 'Tarde'] },
  { id: 'p17', name: 'Alejandra Ruiz', age: 23, gender: 'mujer', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1004/600/800', 'https://picsum.photos/id/1005/600/800'], trainingTypes: ['Running', 'Yoga'], goals: ['Perder grasa', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Tarde', 'Noche'] },
  { id: 'p18', name: 'Andrés Morales', age: 24, gender: 'hombre', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1006/600/800', 'https://picsum.photos/id/1007/600/800', 'https://picsum.photos/id/1008/600/800'], trainingTypes: ['Calistenia', 'Funcional'], goals: ['Aumentar fuerza', 'Mantenerse en forma'], level: 'Avanzado', availability: ['Noche', 'Mañana'] },
  { id: 'p19', name: 'Beatriz Morales', age: 25, gender: 'mujer', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1009/600/800', 'https://picsum.photos/id/1011/600/800'], trainingTypes: ['Yoga', 'Running'], goals: ['Perder grasa', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Tarde'] },
  { id: 'p20', name: 'Carlos Soto', age: 26, gender: 'hombre', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1012/600/800', 'https://picsum.photos/id/1013/600/800', 'https://picsum.photos/id/1014/600/800'], trainingTypes: ['Pesas/Gym', 'Boxeo'], goals: ['Ganar músculo', 'Aumentar fuerza'], level: 'Avanzado', availability: ['Mañana', 'Tarde'] },
  { id: 'p21', name: 'Daniela Vega', age: 27, gender: 'mujer', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1015/600/800', 'https://picsum.photos/id/1016/600/800'], trainingTypes: ['Calistenia', 'Yoga'], goals: ['Movilidad y flexibilidad', 'Socializar y motivación'], level: 'Intermedio', availability: ['Tarde', 'Noche'] },
  { id: 'p22', name: 'Eduardo Pérez', age: 28, gender: 'hombre', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1017/600/800', 'https://picsum.photos/id/1018/600/800', 'https://picsum.photos/id/1019/600/800'], trainingTypes: ['CrossFit', 'Running'], goals: ['Aumentar fuerza', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Mañana'] },
  { id: 'p23', name: 'Elena Pérez', age: 29, gender: 'mujer', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1020/600/800', 'https://picsum.photos/id/1021/600/800'], trainingTypes: ['Pilates', 'Running'], goals: ['Perder grasa', 'Mantenerse en forma'], level: 'Principiante', availability: ['Tarde'] },
  { id: 'p24', name: 'Francisco López', age: 30, gender: 'hombre', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1022/600/800', 'https://picsum.photos/id/1023/600/800', 'https://picsum.photos/id/1024/600/800'], trainingTypes: ['Natación', 'Funcional'], goals: ['Mejorar resistencia', 'Aumentar fuerza'], level: 'Avanzado', availability: ['Noche', 'Tarde'] },
  { id: 'p25', name: 'Fernanda López', age: 31, gender: 'mujer', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/28/600/800', 'https://picsum.photos/id/201/600/800'], trainingTypes: ['Yoga', 'Pilates'], goals: ['Movilidad y flexibilidad', 'Socializar y motivación'], level: 'Intermedio', availability: ['Mañana', 'Tarde'] },
  { id: 'p26', name: 'Gabriel Díaz', age: 32, gender: 'hombre', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/160/600/800', 'https://picsum.photos/id/100/600/800', 'https://picsum.photos/id/101/600/800'], trainingTypes: ['Boxeo', 'Pesas/Gym'], goals: ['Aumentar fuerza', 'Ganar músculo'], level: 'Avanzado', availability: ['Tarde', 'Noche'] },
  { id: 'p27', name: 'Gabriela Díaz', age: 33, gender: 'mujer', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/102/600/800', 'https://picsum.photos/id/103/600/800'], trainingTypes: ['Running', 'Yoga'], goals: ['Perder grasa', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Mañana'] },
  { id: 'p28', name: 'Héctor Mendoza', age: 34, gender: 'hombre', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/29/600/800', 'https://picsum.photos/id/30/600/800'], trainingTypes: ['Ciclismo', 'Running'], goals: ['Mejorar resistencia', 'Preparar competencia'], level: 'Avanzado', availability: ['Tarde'] },
  { id: 'p29', name: 'Helena Mendoza', age: 35, gender: 'mujer', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/64/600/800', 'https://picsum.photos/id/1004/600/800', 'https://picsum.photos/id/1005/600/800'], trainingTypes: ['Pilates', 'Funcional'], goals: ['Movilidad y flexibilidad', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Noche', 'Tarde'] },
  { id: 'p30', name: 'Ignacio Torres', age: 36, gender: 'hombre', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1006/600/800', 'https://picsum.photos/id/1007/600/800'], trainingTypes: ['CrossFit', 'Natación'], goals: ['Aumentar fuerza', 'Mejorar resistencia'], level: 'Avanzado', availability: ['Mañana', 'Noche'] },
  { id: 'p31', name: 'Isabel Torres', age: 37, gender: 'mujer', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1008/600/800', 'https://picsum.photos/id/1009/600/800'], trainingTypes: ['Yoga', 'Running'], goals: ['Perder grasa', 'Socializar y motivación'], level: 'Principiante', availability: ['Tarde'] },
  { id: 'p32', name: 'Javier Rojas', age: 38, gender: 'hombre', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1011/600/800', 'https://picsum.photos/id/1012/600/800', 'https://picsum.photos/id/1013/600/800'], trainingTypes: ['Pesas/Gym', 'Boxeo'], goals: ['Ganar músculo', 'Aumentar fuerza'], level: 'Avanzado', availability: ['Noche'] },
  { id: 'p33', name: 'Juana Rojas', age: 22, gender: 'mujer', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1014/600/800', 'https://picsum.photos/id/1015/600/800'], trainingTypes: ['Calistenia', 'Pilates'], goals: ['Movilidad y flexibilidad', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Mañana', 'Tarde'] },
  { id: 'p34', name: 'Kevin Flores', age: 23, gender: 'hombre', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1016/600/800', 'https://picsum.photos/id/1017/600/800'], trainingTypes: ['Running', 'Ciclismo'], goals: ['Mejorar resistencia', 'Perder grasa'], level: 'Intermedio', availability: ['Tarde', 'Noche'] },
  { id: 'p35', name: 'Karla Flores', age: 24, gender: 'mujer', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1018/600/800', 'https://picsum.photos/id/1019/600/800', 'https://picsum.photos/id/1020/600/800'], trainingTypes: ['Yoga', 'Funcional'], goals: ['Socializar y motivación', 'Movilidad y flexibilidad'], level: 'Principiante', availability: ['Mañana'] },
  { id: 'p36', name: 'Luis Vargas', age: 25, gender: 'hombre', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1021/600/800', 'https://picsum.photos/id/1022/600/800'], trainingTypes: ['Pesas/Gym', 'CrossFit'], goals: ['Aumentar fuerza', 'Ganar músculo'], level: 'Avanzado', availability: ['Tarde'] },
  { id: 'p37', name: 'Laura Vargas', age: 26, gender: 'mujer', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1023/600/800', 'https://picsum.photos/id/1024/600/800'], trainingTypes: ['Running', 'Pilates'], goals: ['Perder grasa', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Noche', 'Tarde'] },
  { id: 'p38', name: 'Marco Castillo', age: 27, gender: 'hombre', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/28/600/800', 'https://picsum.photos/id/201/600/800', 'https://picsum.photos/id/160/600/800'], trainingTypes: ['Boxeo', 'Funcional'], goals: ['Aumentar fuerza', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Mañana', 'Noche'] },
  { id: 'p39', name: 'María Castillo', age: 28, gender: 'mujer', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/100/600/800', 'https://picsum.photos/id/101/600/800'], trainingTypes: ['Yoga', 'Running'], goals: ['Movilidad y flexibilidad', 'Socializar y motivación'], level: 'Principiante', availability: ['Tarde'] },
  { id: 'p40', name: 'Nicolás Guzmán', age: 29, gender: 'hombre', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/102/600/800', 'https://picsum.photos/id/103/600/800'], trainingTypes: ['Ciclismo', 'Pesas/Gym'], goals: ['Mejorar resistencia', 'Preparar competencia'], level: 'Avanzado', availability: ['Mañana'] },
  { id: 'p41', name: 'Natalia Guzmán', age: 30, gender: 'mujer', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/29/600/800', 'https://picsum.photos/id/30/600/800', 'https://picsum.photos/id/64/600/800'], trainingTypes: ['Pilates', 'Funcional'], goals: ['Perder grasa', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Tarde', 'Noche'] },
  { id: 'p42', name: 'Oscar Ramírez', age: 31, gender: 'hombre', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1004/600/800', 'https://picsum.photos/id/1005/600/800'], trainingTypes: ['CrossFit', 'Running'], goals: ['Aumentar fuerza', 'Mejorar resistencia'], level: 'Avanzado', availability: ['Noche'] },
  { id: 'p43', name: 'Olivia Ramírez', age: 32, gender: 'mujer', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1006/600/800', 'https://picsum.photos/id/1007/600/800'], trainingTypes: ['Yoga', 'Running'], goals: ['Movilidad y flexibilidad', 'Socializar y motivación'], level: 'Intermedio', availability: ['Mañana', 'Tarde'] },
  { id: 'p44', name: 'Pablo Herrera', age: 33, gender: 'hombre', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1008/600/800', 'https://picsum.photos/id/1009/600/800', 'https://picsum.photos/id/1011/600/800'], trainingTypes: ['Pesas/Gym', 'Boxeo'], goals: ['Ganar músculo', 'Aumentar fuerza'], level: 'Avanzado', availability: ['Tarde'] },
  { id: 'p45', name: 'Paula Herrera', age: 34, gender: 'mujer', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1012/600/800', 'https://picsum.photos/id/1013/600/800'], trainingTypes: ['Calistenia', 'Funcional'], goals: ['Perder grasa', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Noche', 'Tarde'] }
]

// Note: AUTO_MATCH_IDS, getDistanceKm, calculateCompatibility, getAverageRating and getTrainingStreak 
// are now imported from ./constants and ./utils (refactor in progress)

// Pre-written chat openers for realism
export const CHAT_OPENERS: Record<string, string[]> = {
  p1: ['¡Hola! Vi que también entrenas en Reñaca, ¿vamos a correr juntos este fin de semana?', 'Hey! Me encanta tu bio, yo también soy team café post gym ☕'],
  p2: ['CrossFit gang! ¿En qué box entrenas tú?', 'Hola Joaquín, ¿haces el WOD del sábado?'],
  p3: ['Me muero por probar calistenia en la 5ta, ¿me das tips?', '¡Hola! ¿Haces yoga en grupo alguna vez?'],
  p5: ['Corremos a la misma hora jajaja. ¿Te tinca sumar kilómetros juntos?', 'Isabella! Yo también corro por Reñaca los jueves.'],
  p6: ['Amaneceres en la playa hit different 🔥 ¿A qué hora sueles ir?'],
  p9: ['Tu bio me cayó super bien. ¿Practicamos yoga juntos alguna vez?'],
  p11: ['¡Dominadas gang! ¿Cuántas llevas ahora?', 'Vi que también haces calistenia en la costanera, ¿nos cruzamos?'],
}