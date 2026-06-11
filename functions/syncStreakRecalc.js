/**
 * Recalculate profiles.syncStreak from verified EntrenaSync evidence (≥15 min).
 */

const MIN_VERIFIED_SYNC_MINUTES = 15;

function isVerifiedSyncDuration(minutes) {
  return Number.isFinite(minutes) && minutes >= MIN_VERIFIED_SYNC_MINUTES;
}

function collectVerifiedSyncSessionKeys(ratings, workouts, pilotSessions) {
  const keys = new Set();

  for (const rating of ratings || []) {
    const minutes = Number(rating.minutes) || 0;
    if (!isVerifiedSyncDuration(minutes)) continue;
    const ts = Number(rating.ts) || 0;
    const partner = String(rating.partnerId || 'unknown');
    keys.add(`rating:${ts}:${partner}`);
  }

  for (const workout of workouts || []) {
    if (!isVerifiedSyncDuration(workout.durationMin)) continue;
    if (workout.syncSessionId) {
      keys.add(`session:${workout.syncSessionId}`);
      continue;
    }
    keys.add(`workout:${workout.id}`);
  }

  for (const session of pilotSessions || []) {
    if (!isVerifiedSyncDuration(session.durationMin)) continue;
    keys.add(`session:${session.sessionId}`);
  }

  return keys;
}

function countVerifiedSyncStreak(ratings, workouts, pilotSessions) {
  return collectVerifiedSyncSessionKeys(ratings, workouts, pilotSessions).size;
}

function shouldUpdateSyncStreak(stored, recalculated) {
  const prev = Math.max(0, Math.floor(stored ?? 0) || 0);
  const next = Math.max(0, Math.floor(recalculated) || 0);
  return prev !== next;
}

async function loadWorkoutsByUser(db) {
  const map = new Map();
  const snap = await db.collection('workouts').where('source', '==', 'sync').get();
  snap.forEach((doc) => {
    const d = doc.data() || {};
    const userId = String(d.userId || '');
    if (!userId) return;
    const durationMin = Number((d.stats && d.stats.durationMin) || d.durationMin) || 0;
    const row = {
      id: doc.id,
      syncSessionId: typeof d.syncSessionId === 'string' ? d.syncSessionId : null,
      durationMin,
    };
    const list = map.get(userId) || [];
    list.push(row);
    map.set(userId, list);
  });
  return map;
}

async function loadPilotSessionsByUser(db) {
  const map = new Map();
  const snap = await db.collection('pilotSyncSessions').get();
  snap.forEach((doc) => {
    const d = doc.data() || {};
    const durationMin = Number(d.durationMin) || 0;
    const sessionId = String(d.sessionId || doc.id);
    const participants = Array.isArray(d.participants) ? d.participants.map(String) : [];
    const evidence = { sessionId, durationMin };
    for (const uid of participants) {
      const list = map.get(uid) || [];
      list.push(evidence);
      map.set(uid, list);
    }
  });
  return map;
}

async function loadProfiles(db, singleUid) {
  const rows = [];
  if (singleUid) {
    const snap = await db.collection('profiles').doc(singleUid).get();
    if (!snap.exists) return [];
    const d = snap.data() || {};
    rows.push({
      uid: singleUid,
      name: String(d.name || singleUid),
      stored: Number(d.syncStreak) || 0,
      ratings: Array.isArray(d.syncRatings) ? d.syncRatings : [],
      accountStatus: typeof d.accountStatus === 'string' ? d.accountStatus : undefined,
    });
    return rows;
  }

  const snap = await db.collection('profiles').get();
  snap.forEach((doc) => {
    const d = doc.data() || {};
    const stored = Number(d.syncStreak) || 0;
    const ratings = Array.isArray(d.syncRatings) ? d.syncRatings : [];
    if (stored <= 0 && ratings.length === 0) return;
    rows.push({
      uid: doc.id,
      name: String(d.name || doc.id),
      stored,
      ratings,
      accountStatus: typeof d.accountStatus === 'string' ? d.accountStatus : undefined,
    });
  });
  return rows;
}

/**
 * @returns {{ changes: Array, profilesUpdated: number, totalRemoved: number, dryRun: boolean }}
 */
async function recalculateAllSyncStreaks(db, admin, opts = {}) {
  const dryRun = opts.dryRun !== false;
  const targetUserId = opts.targetUserId ? String(opts.targetUserId) : '';

  const [profiles, workoutsByUser, pilotByUser] = await Promise.all([
    loadProfiles(db, targetUserId || undefined),
    loadWorkoutsByUser(db),
    loadPilotSessionsByUser(db),
  ]);

  const changes = [];

  for (const profile of profiles) {
    if (profile.accountStatus === 'deleted') continue;

    const workouts = workoutsByUser.get(profile.uid) || [];
    const pilot = pilotByUser.get(profile.uid) || [];
    const recalculated = countVerifiedSyncStreak(profile.ratings, workouts, pilot);

    if (!shouldUpdateSyncStreak(profile.stored, recalculated)) continue;

    const verifiedRatings = profile.ratings.filter((r) => (Number(r.minutes) || 0) >= MIN_VERIFIED_SYNC_MINUTES).length;
    const verifiedWorkouts = workouts.filter((w) => w.durationMin >= MIN_VERIFIED_SYNC_MINUTES).length;
    const verifiedPilot = pilot.filter((p) => p.durationMin >= MIN_VERIFIED_SYNC_MINUTES).length;

    changes.push({
      uid: profile.uid,
      name: profile.name,
      stored: profile.stored,
      recalculated,
      ratings: verifiedRatings,
      workouts: verifiedWorkouts,
      pilot: verifiedPilot,
    });
  }

  changes.sort((a, b) => b.stored - b.recalculated - (a.stored - a.recalculated));

  let totalRemoved = 0;
  for (const row of changes) {
    const delta = row.recalculated - row.stored;
    if (delta < 0) totalRemoved += -delta;
  }

  if (!dryRun && changes.length > 0) {
    const batchSize = 400;
    for (let i = 0; i < changes.length; i += batchSize) {
      const batch = db.batch();
      const slice = changes.slice(i, i + batchSize);
      for (const row of slice) {
        batch.update(db.collection('profiles').doc(row.uid), {
          syncStreak: row.recalculated,
          syncStreakRecalculatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: Date.now(),
        });
      }
      await batch.commit();
    }

    await db.collection('adminAudit').add({
      action: 'recalculate_sync_streaks',
      profilesUpdated: changes.length,
      totalRemoved,
      minVerifiedMinutes: MIN_VERIFIED_SYNC_MINUTES,
      dryRun: false,
      adminId: opts.adminId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  return {
    changes: changes.slice(0, 50),
    changesTruncated: changes.length > 50,
    totalChanges: changes.length,
    profilesUpdated: dryRun ? 0 : changes.length,
    totalRemoved,
    dryRun,
    minVerifiedMinutes: MIN_VERIFIED_SYNC_MINUTES,
  };
}

module.exports = {
  MIN_VERIFIED_SYNC_MINUTES,
  countVerifiedSyncStreak,
  recalculateAllSyncStreaks,
};
