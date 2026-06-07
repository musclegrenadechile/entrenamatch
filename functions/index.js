const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/** Sync bonds + mutual matches — who gets "tu equipo está live" push. */
async function getTeamPartnerIds(uid, syncBonds) {
  const partnerIds = new Set(Object.keys(syncBonds || {}));

  try {
    const [asUser1, asUser2] = await Promise.all([
      db.collection('matches').where('user1', '==', uid).get(),
      db.collection('matches').where('user2', '==', uid).get(),
    ]);
    asUser1.forEach((doc) => {
      const d = doc.data() || {};
      if (d.user2) partnerIds.add(d.user2);
    });
    asUser2.forEach((doc) => {
      const d = doc.data() || {};
      if (d.user1) partnerIds.add(d.user1);
    });
  } catch (e) {
    console.warn('Match lookup for team push failed', uid, e);
  }

  partnerIds.delete(uid);
  return Array.from(partnerIds);
}

/**
 * Trigger: profile live/sync change → FCM push to team only (bonds + matches).
 */
exports.notifyRedNetworkLiveOrSync = functions.firestore
  .document('profiles/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() || {};
    const after = change.after.data() || {};
    const uid = context.params.userId;

    const wentLive = before.trainingNow !== true && after.trainingNow === true;
    const startedSync = !before.trainingSyncWith && after.trainingSyncWith;

    if (!wentLive && !startedSync) {
      return null;
    }

    const partnerIds = await getTeamPartnerIds(uid, after.syncBonds || {});
    if (partnerIds.length === 0) {
      console.log(`No team partners for ${uid}, skipping push`);
      return null;
    }

    const name = after.name || 'Tu gym partner';
    const isSync = !!startedSync;

    const title = isSync
      ? `${name} activó EntrenaSync`
      : `${name} está entrenando en vivo`;

    const body = isSync
      ? 'Tu equipo está en sync — únete desde Hoy o el mapa.'
      : 'Alguien de tu equipo acaba de activar live. ¿Te sumas?';

    const tokenPromises = partnerIds.map(async (partnerId) => {
      try {
        const tokenSnap = await db.collection('userPushTokens').doc(partnerId).get();
        if (tokenSnap.exists) {
          const data = tokenSnap.data();
          return data && data.token ? data.token : null;
        }
      } catch (e) {
        console.warn('Error reading token for', partnerId, e);
      }
      return null;
    });

    const tokens = (await Promise.all(tokenPromises)).filter(Boolean);

    if (tokens.length === 0) {
      console.log('No FCM tokens for team of', uid);
      return null;
    }

    const messages = tokens.map((token) => ({
      token,
      notification: { title, body },
      data: {
        type: isSync ? 'team_sync' : 'team_live',
        userId: uid,
        partnerName: name,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'network_activity',
          sound: 'default',
          color: '#FF671F',
        },
      },
    }));

    try {
      const response = await messaging.sendEach(messages);
      console.log(
        `Team push for ${uid} (live/sync): success=${response.successCount}, failure=${response.failureCount}`
      );
      response.responses.forEach((r, i) => {
        if (!r.success) {
          console.warn('FCM failure index', i, r.error && r.error.code);
        }
      });
    } catch (err) {
      console.error('Error sending team FCM:', err);
    }

    return null;
  });
