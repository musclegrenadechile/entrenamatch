const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Trigger: when a profile is updated (trainingNow or trainingSyncWith changes).
 * If the user just went live or started a sync, notify all their Red (syncBonds) via real FCM background push.
 * This gives true background notifications even if the app is closed or in background on the receiver devices.
 * Tokens are stored by the client in userPushTokens/{uid}.
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
      return null; // nothing relevant changed
    }

    const bonds = after.syncBonds || {};
    const partnerIds = Object.keys(bonds);
    if (partnerIds.length === 0) {
      console.log(`No bonds for ${uid}, skipping network push`);
      return null;
    }

    const name = after.name || 'Un socio de tu red';
    const isSync = !!startedSync;

    const title = isSync
      ? `🔥 ${name} activó EntrenaSync`
      : `🔥 ${name} está entrenando ahora (en vivo)`;

    const body = isSync
      ? 'Súmate ya con tu red. Network Power se fortalece y tu grafo gana visibilidad.'
      : 'Únete al pulso de tu red y construye más alianzas de alto rendimiento.';

    // Fetch tokens for all partners in the red
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
      console.log('No FCM tokens found for the red partners of', uid);
      return null;
    }

    // Build messages for each token (sendEach is safer for individual handling)
    const messages = tokens.map((token) => ({
      token,
      notification: {
        title,
        body,
      },
      data: {
        type: isSync ? 'network_sync' : 'network_live',
        userId: uid,
        partnerName: name,
        // The app can use this to deep link (e.g. open live map or auto-offer sync)
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'network_activity', // app should create this channel for high importance
          sound: 'default',
          color: '#FF671F',
        },
      },
    }));

    try {
      const response = await messaging.sendEach(messages);
      console.log(`Network push sent for ${uid} (live/sync): success=${response.successCount}, failure=${response.failureCount}`);
      // Log failures for debugging (tokens may be stale)
      response.responses.forEach((r, i) => {
        if (!r.success) {
          console.warn('FCM failure for token index', i, r.error && r.error.code);
        }
      });
    } catch (err) {
      console.error('Error sending multicast network FCM:', err);
    }

    return null;
  });

// Optional: also listen on sessions or syncSessions if you want more granular "sync started" events.
// For now the profile update on trainingSyncWith is sufficient and simple.
