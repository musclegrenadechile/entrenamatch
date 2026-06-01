# Pre-Alpha Real Multi-User Testing Guide (Live GitHub Pages)

**Goal**: Verify that real users on different devices can actually see each other, match, and chat in real time.

**Live Site**: https://musclegrenadechile.github.io/entrenamatch/

**Important about deploys**:
- After every push, GitHub Actions takes 3-8 minutes to build + deploy.
- You **must** do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) to see changes.
- Look for the text with "cambiar cuenta" or the latest FIX in the green top banner. New behavior: Logout now does a clean reload so you reliably see the login/register screen again. There is also a "Cambiar cuenta" button in the banner + a floating "Cambiar cuenta / Salir" button always visible when you are logged in with a real account. This solves the "entra altiro sin poder registrar" issue on hard refresh.

## How to Test Real Cross-Device Interaction (2+ Real Accounts) - Recommended Flow for Testers

**Goal for this phase**: Real people on different phones/computers can:
- See each other's profiles
- Match
- Chat 1:1 in real time
- Create and see sessions created by others (real-time)
- Join sessions and chat in the group in real time

### Recommended Test Flow (do this with 2+ real accounts on different devices/browsers)

1. **Create real accounts** on different devices (use different emails).
2. Complete profiles (name, bio, photo, training types, goals).
3. On Account A: Go to Explorar and look for Account B's real profile (use "Actualizar reales" if needed).
4. Match with each other.
5. Open 1:1 chat and exchange messages (they should appear live on the other device).
6. From Account A: Create a new session (e.g. "Running en la costanera mañana 19:00").
7. On Account B: Go to Sesiones tab → the new session should appear (thanks to real-time listener). No manual refresh needed if the app is open.
8. Join the session from Account B.
9. Open the group chat from the session.
10. Send messages from both accounts in the group chat. They should appear live for everyone in the session.

Use the "Actualizar sesiones reales" button if something doesn't appear immediately during testing.

### Prerequisites
- Use **incognito / different browser / different phone** for Account B (so localStorage doesn't interfere).
- Hard refresh (Ctrl + Shift + R or Cmd + Shift + R) after every major step.

### Step-by-Step Test (Do This After Every Major Push)

1. **Open the live site** on Device/Browser A.
2. **Create a real account** (email + password or Google).
   - Complete minimal onboarding if prompted.
3. **On Device/Browser B** (completely separate):
   - Create a second real account with different email.
   - Complete minimal onboarding.
4. **On Account A**:
   - Go to **Explorar**.
   - Look for the other person's real profile (it may take a refresh or a minute after they create the profile).
   - Swipe right (or tap heart) on the real profile.
   - You should see the "¡Match real con otro usuario!" toast + modal.
5. **On Account B** (after hard refresh):
   - Go to **Matches**.
   - You should see Account A appear as a real match (even if you didn't swipe yet — current Pre-Alpha auto-matches for testing).
6. **Open chat** from the match on either side.
   - You should see a small **"REAL"** badge in the chat header (confirms this is a live cross-device conversation).
   - Send 2–3 messages from A.
   - Hard refresh on B → messages should appear.
   - Send messages from B → they should appear on A (ideally live thanks to onSnapshot).
7. **Hard refresh both sides**:
   - Confirm message history persists.
   - Confirm the match still appears in Matches tab.
8. **Check browser console** (F12) on the live site for errors (especially Firebase permission denied or query failures).

## What "Working" Looks Like Right Now (for real cross-device testing)

- Real accounts persist across refreshes and devices.
- Real profiles from other users appear in Explore (alongside demo seeds). Use the "Actualizar reales" button to pull latest.
- When you swipe right on a real profile, a like + match is written to Firestore. The other person sees it on their Matches tab (after load/refresh).
- Real-time 1:1 chat works: messages appear on the other device (live via listeners or after refresh). "REAL" badge shown in chat header.
- Sessions: Real-time! Sessions created by real users on one device now appear live for other real users on different devices thanks to onSnapshot listener. Create a session on one phone → it should show up on another without manual refresh.
- "Sincronizado con backend real" indicator in Profile tab.
- Logout works cleanly for real users.
- Messages and matches survive hard refresh on both sides.

## Latest Pre-Alpha Improvements (just pushed)

- **Profile tab**: Complete premium redesign — large hero photo, horizontal gallery for multiple photos, stats cards, training/goals chips, "Disponible hoy" toggle, verification flow, and **multiple prominent "Cambiar cuenta / Cerrar sesión" buttons** everywhere (impossible to get trapped).
- **Group Chat modal** (inside sessions): Much more attractive — "REAL EN VIVO" badge, improved message bubbles with timestamps, nicer reactions, premium input with photo support + live sync note.
- **Empty states**: Attractive cards with Pre-Alpha explanations + direct CTAs in Matches, Sessions, Messages.
- **Critical stability**: Fixed long-standing JSX leak that caused black/empty Profile screens. All rich Profile content is now properly self-contained inside the tab.
- Sessions update button more visible. Creator delete in group chat now works cross-device.

**After this push**: Hard refresh (Ctrl+Shift+R) on https://musclegrenadechile.github.io/entrenamatch/ — the Profile tab should look beautiful and you should never see a black screen or missing logout again.

## Known Limitations (as of this push)

- Some rich onboarding data may still be local-only until full sync is hardened.
- You may need to hard refresh or wait 30-60s after creating the second account for the profile to appear in the other person's Explore.
- Squads still mostly demo (focus remains profiles + 1:1 chat + sessions group chat).

## Reporting Issues

Use the "Dar feedback →" link in the top banner (goes to GitHub Issues).

When reporting, please note:
- Exact steps you followed
- Whether it was on the live GitHub Pages or localhost
- Any console errors
- Screenshots if possible

---

**This guide exists because the user asked for explicit testing and verification on the live GitHub deployment.**

Run this full flow after every significant overnight push. Document results in commit messages or this file.