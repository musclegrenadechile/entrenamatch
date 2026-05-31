# Pre-Alpha Real Multi-User Testing Guide (Live GitHub Pages)

**Goal**: Verify that real users on different devices can actually see each other, match, and chat in real time.

**Live Site**: https://musclegrenadechile.github.io/entrenamatch/

**Important about deploys**:
- After every push, GitHub Actions takes 3-8 minutes to build + deploy.
- You **must** do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) to see changes.
- Look for the text "FIX 2026-04-26" in the green top banner to confirm you have the latest version (including the startup crash fix).

## How to Test Real Cross-Device Interaction (2 Accounts)

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

## What "Working" Looks Like Right Now (Overnight State - as of ~2 AM pushes)

- Real accounts persist across refreshes and devices.
- Real profiles from other users appear in Explore (alongside demo seeds). Use the "Actualizar reales" button to pull latest.
- When you swipe right on a real profile, a like + match is written to Firestore. The other person sees it on their Matches tab (after load/refresh).
- Real-time 1:1 chat works: messages appear on the other device (live via listeners or after refresh). "REAL" badge shown in chat header.
- "Sincronizado con backend real" indicator in Profile tab.
- Logout works cleanly for real users.
- Messages and matches survive hard refresh on both sides.

## Known Limitations (as of last overnight push)

- Some rich onboarding data may still be local-only until full sync is hardened.
- You may need to hard refresh or wait 30-60s after creating the second account for the profile to appear in the other person's Explore.
- Squads and Sessions are still mostly demo/local for now (focus was on profiles + matching + 1:1 chat).

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