/**
 * EntrenaMatch — lenguaje visible para el usuario.
 * Fase 121: copy unificado (Comunidad, Mapa LIVE, Explorar).
 * Los identificadores internos del código (GymPulseMap, etc.) no cambian aquí.
 */
export const BRAND_COPY = {
  tagline: 'Tu Comunidad en vivo',
  taglineMono: 'TU COMUNIDAD EN VIVO',
  pitch:
    'Encuentra quién entrena cerca — gym, running, funcional o lo que muevas — haz match y entrena acompañado/a con EntrenaSync.',
  pitchShort:
    'Encuentra quién entrena cerca, haz match y sincroniza sesiones con EntrenaSync.',
  partner: 'EntrenaPartner',
  partnerPlural: 'EntrenaPartners',
  partnerGeneric: 'un compañero de entreno',
  community: 'Comunidad',
  /** Feed social de la zona — nunca "por Comunidad". */
  communityWallTitle: 'Muro de la Comunidad',
  network: 'tu Comunidad',
  networkTitle: 'Tu Comunidad',
  liveMapLabel: 'Mapa LIVE',
  metaDescription:
    'EntrenaMatch — Tu Comunidad en vivo. Ve quién entrena ahora, sincronízate en tiempo real y guarda historial compartido. Lanzamiento inicial en Chile.',
  manifestDescription:
    'Conecta con personas que entrenan cerca de ti. Gym, running, funcional y más. Solo para mayores de 18 años. Piloto en Chile.',
  /** Copy visible en la pestaña Mapa LIVE */
  liveMap: {
    globalPill: 'MAPA LIVE GLOBAL',
    globalPillTitle: 'Toca para ir al punto más activo del mapa',
    emptyTitle: 'Nadie en vivo cerca todavía',
    emptyBody: 'Sé el primero — activa LIVE mientras entrenas (gym, running o lo que muevas).',
    emptyBanner: 'Nadie activo cerca aún',
    liveBanner: 'Estás en vivo — visible en el mapa',
    activateLive: 'Activar LIVE',
    zoneCta: 'LIVE → suma por tu zona',
    zoneCtaActive: 'Defiende el título → suma minutos',
    zoneCtaCelebrate: 'Compartir victoria',
    selfPopupLocation: 'Tu ubicación en el mapa LIVE',
    filtersTitle: 'Filtros del mapa',
    partnersFilter: 'Spots de entreno',
    tourHeader: 'Mapa LIVE',
    tetherSub: 'Tether activo en el mapa LIVE',
  },
  /** Fase 121 — Explorar vacío / densidad */
  explore: {
    emptyTitle: 'Tu Comunidad está creciendo',
    emptyBody: (city: string) =>
      `En ${city} aún hay pocos perfiles. Invita a alguien de tu gym o activa LIVE para que te encuentren en el mapa.`,
    inviteTitle: 'Invita a tu gym',
    inviteShareText: 'Entrena con gente cerca de ti — únete a EntrenaMatch',
    inviteToastCopied: 'Enlace copiado — compártelo con tu gym',
    activateLiveCta: 'Activar LIVE ahora',
  },
  /** Copa Zona — guerra Vie–Dom, victoria Lun–Mar, armisticio Mié–Jue */
  copaZona: {
    title: '¿Qué zona entrena más?',
    weeklyLabel: 'Copa Zona',
    warKicker: 'Guerra en curso',
    celebrationKicker: 'Victoria',
    armisticeKicker: 'Armisticio',
    frozenHint: 'Marcador final congelado',
    emptyLine: '0 vs 0 — invita a tu zona y sé el primero en sumar',
    inviteCta: 'Invitar a tu zona',
    pilotHint: 'Valparaíso vs Santiago — cada LIVE suma índice (guerra vie–dom)',
    tooltipTitle: '¿Cómo suma tu ciudad?',
    tooltipHome:
      'Región de Valparaíso: Viña, Valparaíso, Concón, Quilpué, Villa Alemana, San Antonio y comunas costeras aliadas.',
    tooltipAway: 'Santiago: solo la comuna de Santiago (no Providencia, Las Condes ni otras RM).',
    tooltipNeutral:
      'Tu comuna no suma a la Copa Zona piloto todavía — igual puedes LIVE, match y EntrenaSync.',
    tooltipIndex: 'El marcador usa minutos LIVE + sync ajustados por población (índice / 100k hab).',
    defenderTitle: (zone: string) => `🛡 ${zone} es Defensor de la zona`,
    warEnds: (label: string) => `Guerra termina en ${label}`,
    celebrationEnds: (label: string) => `Victoria · ${label} restantes`,
    armisticeStarts: (label: string) => `Nueva guerra en ${label}`,
  },
  /** Fase 121 — ventana LIVE promocionada */
  syncHour: {
    title: 'Sync Hour',
    activeBody: 'Ventana LIVE — más gente en el mapa ahora. Activa LIVE y busca un EntrenaSync.',
    upcomingBody: (label: string) => `Próxima Sync Hour: ${label}. Invita a tu gym antes.`,
    cta: 'Ir al mapa LIVE',
    ctaExplore: 'Activar LIVE',
    notifTitle: 'Sync Hour — ¡es ahora!',
    notifBody: 'Más gente en el Mapa LIVE. Activa LIVE o busca un EntrenaSync.',
  },
  /** Fase 121 — alertas de densidad */
  nearbyLive: {
    notifTitle: (name: string) => `${name} en vivo cerca`,
    notifBody: (km: number) => `${km.toFixed(1)} km — mira el Mapa LIVE o explora match`,
    toastAction: 'Ver mapa',
  },
  /** Fase 121 — invitación gym con QR */
  gymInvite: {
    title: 'Invita a tu gym',
    subtitle: 'Escanea o comparte — más densidad = más matches',
    qrAlt: 'Código QR de invitación EntrenaMatch',
    copyLink: 'Copiar enlace',
    share: 'Compartir',
  },
  /** Post-sync story */
  syncStory: {
    promptTitle: '¡Buen EntrenaSync!',
    promptBody: 'Comparte la story — invita a tu gym a sumarse',
    cta: 'Compartir story del sync',
  },
  /** Toasts visibles — siempre Mapa LIVE / Comunidad, nunca GymPulse */
  toasts: {
    firstLiveTitle: '¡Tu primer LIVE está en el mapa!',
    firstLiveDesc: 'Apareces en el Mapa LIVE. Toca Mapa abajo para ver quién entrena cerca.',
    voiceConstancy: '+5 Constancia en tu Comunidad',
    livePost: '¡Entrenando ahora en el Mapa LIVE! ¿Quién se une?',
  },
  /** Guía post-registro única */
  activation: {
    kicker: 'Bienvenido a EntrenaMatch',
    title: 'Tu rutina en 3 pasos',
    subtitle: 'Piloto Viña × Santiago. LIVE → Explorar → EntrenaSync en el mapa.',
    subtitleDemo: 'Modo prueba: mismos pasos que una cuenta real, con datos locales.',
    stepLive: '1. Activa LIVE',
    stepLiveDesc: 'Al entrenar, enciende LIVE. Apareces en el Mapa LIVE y sumas a la Copa Zona.',
    stepExplore: '2. Explora y conecta',
    stepExploreDesc: 'Desliza perfiles compatibles e invita a alguien de tu gym al piloto.',
    stepSync: '3. EntrenaSync en el mapa',
    stepSyncDesc: 'Sincroniza con un match en el Mapa LIVE — tus minutos suman a tu región.',
  },
  localZone: {
    title: (city: string) => `Comunidad en ${city}`,
    fallbackTitle: 'Tu Comunidad local',
  },
} as const
