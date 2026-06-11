/**
 * Community admin — delete accounts, assert appAdmins role.
 */

const functions = require('firebase-functions');
const { recalculateAllSyncStreaks } = require('./syncStreakRecalc');

const APP_ADMINS = 'appAdmins';
const BETA_BOT_PREFIX = 'beta_bot_';

async function assertAppAdmin(db, uid) {
  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Inicia sesión.');
  }
  const snap = await db.collection(APP_ADMINS).doc(uid).get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Solo administradores de comunidad.');
  }
  return snap.data() || {};
}

function register(deps) {
  const { db, admin } = deps;

  const adminDeleteUserAccount = functions.https.onCall(async (data, context) => {
    await assertAppAdmin(db, context.auth && context.auth.uid);

    const targetUserId = data && data.targetUserId ? String(data.targetUserId) : '';
    const reason = data && data.reason ? String(data.reason).slice(0, 500) : '';

    if (!targetUserId) {
      throw new functions.https.HttpsError('invalid-argument', 'targetUserId requerido.');
    }
    if (targetUserId === context.auth.uid) {
      throw new functions.https.HttpsError('failed-precondition', 'No puedes eliminar tu propia cuenta desde admin.');
    }
    if (targetUserId.startsWith(BETA_BOT_PREFIX)) {
      throw new functions.https.HttpsError('failed-precondition', 'No se pueden eliminar personas beta.');
    }

    const targetAdmin = await db.collection(APP_ADMINS).doc(targetUserId).get();
    if (targetAdmin.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'No se puede eliminar otro administrador.');
    }

    const profileRef = db.collection('profiles').doc(targetUserId);
    const profileSnap = await profileRef.get();
    const profileName = profileSnap.exists ? profileSnap.data().name : targetUserId;

    try {
      await admin.auth().deleteUser(targetUserId);
    } catch (e) {
      if (e.code !== 'auth/user-not-found') {
        console.warn('adminDeleteUser auth', targetUserId, e.message);
      }
    }

    await profileRef.set(
      {
        uid: targetUserId,
        name: 'Cuenta eliminada',
        bio: '',
        photos: [],
        accountStatus: 'deleted',
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: context.auth.uid,
        deleteReason: reason || null,
        trainingNow: false,
        isBetaBot: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await db.collection('adminAudit').add({
      action: 'delete_user',
      targetUserId,
      targetName: profileName,
      reason: reason || null,
      adminId: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('adminDeleteUserAccount', context.auth.uid, '->', targetUserId);
    return { ok: true, message: `Cuenta ${profileName} marcada como eliminada.` };
  });

  /** Self-service account deletion — requires exact confirm phrase (Play / GDPR). */
  const deleteMyAccount = functions.https.onCall(async (data, context) => {
    const uid = context.auth && context.auth.uid;
    if (!uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Inicia sesión.');
    }

    const confirmPhrase = data && data.confirmPhrase ? String(data.confirmPhrase).trim() : '';
    if (confirmPhrase !== 'ELIMINAR MI CUENTA') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Escribe exactamente: ELIMINAR MI CUENTA'
      );
    }

    const reason = data && data.reason ? String(data.reason).slice(0, 500) : '';
    const profileRef = db.collection('profiles').doc(uid);
    const profileSnap = await profileRef.get();
    const profileName = profileSnap.exists ? profileSnap.data().name : uid;

    const appAdminSnap = await db.collection(APP_ADMINS).doc(uid).get();
    if (appAdminSnap.exists) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Las cuentas de administrador no pueden auto-eliminarse. Contacta soporte.'
      );
    }

    try {
      await admin.auth().deleteUser(uid);
    } catch (e) {
      if (e.code !== 'auth/user-not-found') {
        console.warn('deleteMyAccount auth', uid, e.message);
        throw new functions.https.HttpsError('internal', 'No se pudo eliminar la cuenta de acceso.');
      }
    }

    await profileRef.set(
      {
        uid,
        name: 'Cuenta eliminada',
        bio: '',
        photos: [],
        accountStatus: 'deleted',
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: uid,
        deleteReason: reason || null,
        selfDeleted: true,
        trainingNow: false,
        isBetaBot: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await db.collection('adminAudit').add({
      action: 'self_delete_user',
      targetUserId: uid,
      targetName: profileName,
      reason: reason || null,
      adminId: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('deleteMyAccount', uid);
    return { ok: true, message: 'Cuenta eliminada.' };
  });

  const grantCommunityAdmin = functions.https.onCall(async (data, context) => {
    const callerUid = context.auth && context.auth.uid;
    if (!callerUid) {
      throw new functions.https.HttpsError('unauthenticated', 'Inicia sesión.');
    }

    const mpAdmin = await db.collection('marketplaceAdmins').doc(callerUid).get();
    const appAdmin = await db.collection(APP_ADMINS).doc(callerUid).get();
    if (!mpAdmin.exists && !appAdmin.exists) {
      throw new functions.https.HttpsError('permission-denied', 'Sin permiso para otorgar admin.');
    }

    const targetUid = data && data.targetUserId ? String(data.targetUserId) : '';
    const name = data && data.name ? String(data.name).slice(0, 80) : '';
    if (!targetUid) {
      throw new functions.https.HttpsError('invalid-argument', 'targetUserId requerido.');
    }

    await db.collection(APP_ADMINS).doc(targetUid).set(
      {
        name: name || null,
        displayLabel: 'Admin',
        role: 'community',
        grantedBy: callerUid,
        grantedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await db.collection('profiles').doc(targetUid).set(
      { communityAdmin: true, updatedAt: Date.now() },
      { merge: true }
    );

    return { ok: true, targetUserId: targetUid };
  });

  const DEFAULT_COMMUNITY_ADMIN = {
    uid: 'WEB5PLwMb9NrdkecF26FScDtjU63',
    name: 'Jorge Erpel',
  };

  const bootstrapAppAdminHttp = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.status(405).send('GET or POST');
      return;
    }
    try {
      const uid =
        (req.query && req.query.uid) ||
        (req.body && req.body.uid) ||
        DEFAULT_COMMUNITY_ADMIN.uid;
      const name =
        (req.query && req.query.name) ||
        (req.body && req.body.name) ||
        DEFAULT_COMMUNITY_ADMIN.name;

      await db.collection(APP_ADMINS).doc(String(uid)).set(
        {
          name: String(name),
          displayLabel: 'Admin',
          role: 'community',
          grantedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      await db.collection('profiles').doc(String(uid)).set(
        { communityAdmin: true, updatedAt: Date.now() },
        { merge: true }
      );
      console.log('bootstrapAppAdmin', uid, name);
      res.json({ ok: true, uid, name });
    } catch (e) {
      console.error('bootstrapAppAdmin failed', e);
      res.status(500).json({ ok: false, error: String(e.message || e) });
    }
  });

  const adminRecalculateSyncStreaks = functions.https.onCall(async (data, context) => {
    await assertAppAdmin(db, context.auth && context.auth.uid);

    const dryRun = data && data.apply === true ? false : true;
    const targetUserId = data && data.targetUserId ? String(data.targetUserId) : '';

    const result = await recalculateAllSyncStreaks(db, admin, {
      dryRun,
      targetUserId: targetUserId || undefined,
      adminId: context.auth.uid,
    });

    console.log(
      'adminRecalculateSyncStreaks',
      context.auth.uid,
      dryRun ? 'dry-run' : 'apply',
      result.totalChanges,
      'changes'
    );

    return {
      ok: true,
      dryRun: result.dryRun,
      totalChanges: result.totalChanges,
      profilesUpdated: result.profilesUpdated,
      totalRemoved: result.totalRemoved,
      minVerifiedMinutes: result.minVerifiedMinutes,
      changes: result.changes,
      changesTruncated: result.changesTruncated,
    };
  });

  return {
    adminDeleteUserAccount,
    deleteMyAccount,
    grantCommunityAdmin,
    bootstrapAppAdminHttp,
    adminRecalculateSyncStreaks,
    assertAppAdmin,
  };
}

module.exports = { register, APP_ADMINS };
