/**
 * EntrenaMatch — lenguaje visible para el usuario.
 * Fase 121: copy unificado (Comunidad, Mapa LIVE, Explorar).
 * Los identificadores internos del código (GymPulseMap, etc.) no cambian aquí.
 */
export const BRAND_COPY = {
  tagline: 'Tu Comunidad en vivo',
  taglineMono: 'TU COMUNIDAD EN VIVO',
  pitch:
    'Encuentra quién entrena cerca — fútbol, pádel, gym, running, rugby o lo que muevas — haz match y entrena acompañado/a con EntrenaSync.',
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
    'Conecta con personas que entrenan cerca de ti. Fútbol, pádel, gym, running, rugby y más. Solo +18. Piloto Chile.',
  /** Copy visible en la pestaña Mapa LIVE */
  liveMap: {
    globalPill: 'MAPA LIVE GLOBAL',
    globalPillTitle: 'Toca para ir al punto más activo del mapa',
    emptyTitle: 'Nadie en vivo cerca todavía',
    emptyBody: 'Sé el primero — activa LIVE en la cancha, pista, gym o costanera.',
    emptyBanner: 'Nadie activo cerca aún',
    emptyOverlayTitle: 'Sin nadie en vivo cerca',
    emptyOverlayBody: 'Activa LIVE mientras entrenas y aparecerás en el mapa. Los demás se ven como puntos verdes.',
    emptyOverlaySelfLive: 'Estás visible en el mapa. El círculo verde marca tu zona (~2–12 km).',
    soloLiveHint: 'Eres el único en vivo ahora — otros aparecerán como puntos verdes.',
    legendTitle: 'Guía del mapa',
    legendSelf: 'TÚ — tu posición',
    legendLivePin: 'Punto verde — alguien en LIVE',
    legendCircle: 'Círculo — tu zona visible (~2–12 km)',
    legendZones: 'Ciudades — filtra por zona',
    radarBtn: 'Buscar 2 km',
    radarScanning: 'Escaneando 2 km…',
    radarResult: (n: number) => `${n} persona${n === 1 ? '' : 's'} a 2 km`,
    liveBanner: 'Estás en vivo — visible en el mapa',
    activateLive: 'Activar LIVE',
    zoneCta: 'LIVE → suma por tu zona',
    zoneCtaActive: 'Defiende el título → suma minutos',
    zoneCtaCelebrate: 'Compartir victoria',
    selfPopupLocation: 'Tu ubicación en el mapa LIVE',
    filtersTitle: 'Filtros del mapa',
    partnersFilter: 'Spots de entreno',
    tourHeader: 'Mapa LIVE',
    tetherSub: 'EntrenaSync activo — línea dorada en el mapa',
  },
  /** Fase 121 — Explorar vacío / densidad */
  explore: {
    emptyTitle: 'Tu Comunidad está creciendo',
    emptyBody: (city: string) =>
      `En ${city} aún hay pocos perfiles. Invita a tu club, cancha o grupo — o activa LIVE para que te encuentren en el Mapa LIVE.`,
    inviteTitle: 'Invita a tu equipo',
    inviteShareText: 'Entrena con gente cerca de ti — únete a EntrenaMatch',
    inviteToastCopied: 'Enlace copiado — compártelo con tu club o equipo',
    activateLiveCta: 'Activar LIVE ahora',
  },
  /** Eliminación de cuenta — retención honesta (proyecto en beta, fundador solo). */
  deleteAccount: {
    entryLabel: 'Eliminar mi cuenta',
    storyTitle: 'Antes de irte, déjame contarte algo',
    storyLead: (name: string) =>
      `${name ? name.split(' ')[0] + ', ' : ''}EntrenaMatch está recién naciendo.`,
    storyBody:
      'No es una app de una corporación con cientos de ingenieros. La estoy construyendo yo, con mucho cuidado, para que quien entrena solo/a pueda encontrar compañía de verdad en el gym, en la calle o donde sea que te muevas. Cada persona que prueba la app, reporta un bug o se queda un día más, cambia el rumbo del proyecto. Para mí, eres muy valioso/a.',
    storyThanks: 'Gracias por haber confiado en este experimento.',
    alternativesTitle: '¿Y si probamos otra cosa primero?',
    ghostCta: 'Activar modo fantasma',
    ghostHint: 'Sigue entrenando sin aparecer en el mapa LIVE.',
    logoutCta: 'Solo cerrar sesión',
    logoutHint: 'Tu perfil queda guardado — vuelves cuando quieras.',
    feedbackCta: 'Contar qué no funcionó',
    feedbackHint: 'Tu feedback llega directo y ayuda a mejorar la app.',
    stayCta: 'Me quedo — seguir explorando',
    consequencesTitle: 'Si eliminas la cuenta, se pierde para siempre',
    consequences: [
      'Tu perfil, fotos y bio en la red',
      'Matches, chats y alianzas de EntrenaSync',
      'Rachas, constancia y progreso semanal',
      'Historial de entrenos y publicaciones en el muro',
    ],
    consequencesNote:
      'La eliminación es definitiva. No podemos recuperar tu cuenta después.',
    reasonTitle: '¿Qué fue lo principal? (opcional)',
    reasons: [
      { id: 'not_useful', label: 'No me resultó útil' },
      { id: 'privacy', label: 'Privacidad / datos' },
      { id: 'bugs', label: 'Muchos errores o fallos' },
      { id: 'empty', label: 'Poca gente cerca' },
      { id: 'other', label: 'Otro motivo' },
    ],
    confirmTitle: 'Último paso — solo si estás seguro/a',
    confirmHint:
      'Escribe exactamente la frase de abajo. Tómate tu tiempo; no hay prisa.',
    confirmPhrase: 'ELIMINAR MI CUENTA',
    confirmWait: (sec: number) =>
      sec > 0 ? `Podrás confirmar en ${sec}s…` : 'Puedes confirmar ahora',
    deleteButton: 'Eliminar mi cuenta para siempre',
    deleting: 'Eliminando cuenta…',
    deletedToast: 'Tu cuenta fue eliminada. Gracias por haber probado EntrenaMatch.',
    demoBlocked: 'En modo demo no hay cuenta real que eliminar.',
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
    upcomingBody: (label: string) => `Próxima Sync Hour: ${label}. Invita a tu club o equipo antes.`,
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
    title: 'Invita a tu equipo',
    subtitle: 'Comparte el enlace — más gente en tu zona = más matches y EntrenaSync',
    qrAlt: 'Código QR de invitación EntrenaMatch',
    copyLink: 'Copiar enlace',
    share: 'Compartir',
  },
  /** Post-sync story */
  syncStory: {
    promptTitle: '¡Buen EntrenaSync!',
    promptBody: 'Comparte la story — invita a tu club o equipo a sumarse',
    cta: 'Compartir story del sync',
  },
  /** Post-workout story (fase 376) */
  workoutStory: {
    promptTitle: '¿Lo subes a Instagram?',
    promptBody: 'Te armamos una imagen con tu rutina para invitar a tus amigos',
    cta: 'Compartir en Instagram',
    sharedOk: 'Listo — elige Instagram en el menú que se abrió',
    sharedDownload: 'Imagen guardada — ábrela en Instagram → Historia',
    failed: 'No pudimos crear la imagen. Intenta de nuevo.',
  },
  /** Perfil — header y reto diario */
  profile: {
    headerTitle: 'Tu perfil',
    headerSubtitle: 'Tu Comunidad · entreno y progreso',
    dailyChallengeActivated: '¡Reto diario activado!',
    seeDailyChallenge: 'Ver reto',
    dailyPulseKicker: 'RETO DIARIO',
    mapStreakLabel: 'Mapa LIVE',
    tabSummary: 'Reto diario, constancia y alianzas Sync',
  },
  /** Muro / feed social */
  feed: {
    postsLabel: 'en el Muro',
    joinedCommunity: 'personas reaccionaron en el Muro — únete desde el mapa o arriba',
    publishSubtitle: 'Tu momento aparecerá en el Muro de la Comunidad',
    publishButton: 'Publicar en el Muro',
    publishingLabel: 'Publicando en el Muro de la Comunidad…',
    publishingBanner: 'Publicando en el Muro de la Comunidad…',
    publishPlaceholder:
      'Comparte tu entreno, un PR, una foto de la cancha o lo que inspire a la red...',
    uploadPhoto: 'Subiendo foto al Muro...',
    publishedTitle: '¡Publicado en el Muro de la Comunidad!',
    publishedDesc: 'Ya está visible en el Muro de la Comunidad.',
    liveSessionDesc: 'Tu sesión live ya está en el Muro de la Comunidad',
  },
  /** Red / sync visible */
  networkCopy: {
    weekImpact: (min: number) =>
      `Tu red esta semana: ~${min} min compartidos — suma visibilidad en el Mapa LIVE.`,
    resyncHint:
      'Re-sync para subir tu Fuerza del equipo y ganar más visibilidad en Explorar',
    exploreGraph: 'Tu red en el mapa LIVE',
    exploreCta: 'Las redes más fuertes destacan en Explorar. Construye la tuya →',
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
    stepExploreDesc: 'Desliza perfiles compatibles e invita a alguien de tu club o cancha al piloto.',
    stepSync: '3. EntrenaSync en el mapa',
    stepSyncDesc: 'Sincroniza con un match en el Mapa LIVE — tus minutos suman a tu región.',
  },
  localZone: {
    title: (city: string) => `Comunidad en ${city}`,
    fallbackTitle: 'Tu Comunidad local',
  },
} as const
