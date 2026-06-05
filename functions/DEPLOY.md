# Deploy Cloud Functions for real background FCM pushes to your Red de EntrenaSync

This enables **true push notifications (even when app is closed or backgrounded)** when someone in your training network (Red) goes live or starts an EntrenaSync.

## Steps (run once)

1. Make sure you have Firebase CLI:
   npm install -g firebase-tools

2. Login:
   firebase login

3. From project root:
   cd functions
   npm install

4. Deploy only functions:
   firebase deploy --only functions --project entrenamatch

   (Or without --project if default is set)

## What it does
- Listens to updates on /profiles/{userId}
- When trainingNow flips to true OR trainingSyncWith is set for a user who has syncBonds (your red)
- Looks up the FCM tokens of all bonded partners (from /userPushTokens/{partnerId})
- Sends high-priority FCM with title/body + data payload
- On receiver device: OS shows the notification (background). Tapping opens the app and the action listener deep-links to the live map + auto-offers the sync.

## Notes
- Tokens are saved by the client on registration (see App.tsx push 'registration' listener).
- The function uses admin SDK so it bypasses Firestore rules.
- If a token is invalid/stale, it is logged but the send continues for others.
- For production, you can add token cleanup on send failure (canonical ids etc).
- Test: toggle "Entrenando ahora" on one account that has a bond with another logged-in device (background or closed). You should get the push.

## If you want more events
You can extend the function to also listen on syncSessions or other collections.

After deploy, rebuild the AAB (the functions are server-side, client AAB is unchanged for this feature).

Sigue con todo.
