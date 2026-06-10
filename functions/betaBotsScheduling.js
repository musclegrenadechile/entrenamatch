/**
 * Pure scheduling / geography helpers for beta bots (testable).
 */

const CITY_REGION = {
  'Viña del Mar': 'costa',
  Reñaca: 'costa',
  Concón: 'costa',
  Valparaíso: 'costa',
  Santiago: 'santiago',
  Concepción: 'conce',
};

const PEAK_HOURS = new Set([6, 7, 8, 9, 18, 19, 20, 21, 22]);

function getChileHour(now = Date.now()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Santiago',
      hour: 'numeric',
      hour12: false,
    }).formatToParts(new Date(now));
    const h = parts.find((p) => p.type === 'hour');
    return h ? Number(h.value) : new Date(now).getUTCHours();
  } catch {
    return new Date(now).getUTCHours();
  }
}

function isPeakHour(hour) {
  return PEAK_HOURS.has(hour);
}

function sameCityRegion(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  return CITY_REGION[a] && CITY_REGION[a] === CITY_REGION[b];
}

function pickCityMate(bot, bots, excludeUid) {
  const region = CITY_REGION[bot.city];
  const pool = bots.filter(
    (b) =>
      b.uid !== bot.uid &&
      b.uid !== excludeUid &&
      (b.city === bot.city || (region && CITY_REGION[b.city] === region))
  );
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function liveRollThreshold(hour, realLiveInCity) {
  if (realLiveInCity >= 3) return -1;
  if (isPeakHour(hour)) return 0.32;
  return 0.14;
}

function resolveBatchSize(cfg, hour) {
  const base = typeof cfg.batchSize === 'number' ? cfg.batchSize : 3;
  return isPeakHour(hour) ? Math.min(base + 1, 6) : base;
}

module.exports = {
  CITY_REGION,
  PEAK_HOURS,
  getChileHour,
  isPeakHour,
  sameCityRegion,
  pickCityMate,
  liveRollThreshold,
  resolveBatchSize,
};
