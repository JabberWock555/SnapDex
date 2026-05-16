# SnapDex — Session Memory

Quick-reference for new Claude sessions. Read this + CLAUDE.md before starting work.

---

## Current state (as of 2026-05-17)

App is functional on Android for testing. Core features work:
- Google Sign-In (native Android)
- Business card scanning via Gemini AI
- Contacts saved to Firestore + phone address book
- Scan history in sidebar

Not yet done for Play Store: release signing, app icon/splash, privacy policy, move Gemini key to backend.

---

## Architecture decisions made

| Decision | Why |
|---|---|
| Gemini called directly from client (`VITE_GEMINI_API_KEY`) | Railway backend was unreliable; direct call is simpler for MVP. Key must move to backend before Play Store. |
| `@capacitor-firebase/authentication` for Google Sign-In | `signInWithPopup` fails in Android WebView; native plugin uses OS account picker |
| `@capacitor-community/contacts` for saving | VCF share-sheet was unreliable; direct write to address book is cleaner |
| Firebase config hardcoded in `firebase.ts` | Firebase config values are public identifiers, not secrets |
| `VITE_` prefix for Gemini key | Vite's native env injection — more reliable than `process.env` define hack |

---

## Known issues / next steps

1. **Gemini key in APK** — `VITE_GEMINI_API_KEY` is baked into the JS bundle. Must be moved to a backend proxy before Play Store release. Express server exists at `server/index.ts` but is unused.
2. **Firestore security rules** — must be set in Firebase Console (see CLAUDE.md). Database must be created first.
3. **Release signing** — need to create a keystore for signed release APK / AAB.
4. **App icon + splash** — not yet customised.
5. **Privacy policy** — required by Play Store.

---

## Key bugs fixed (history)

| Bug | Fix |
|---|---|
| `MainActivity` ClassNotFoundException | Wrong package `com.yourname.snapdex` → fixed to `com.jabberwockstudio.snapdex` |
| Google Sign-In "The requested action failed" | Replaced `signInWithPopup` with `@capacitor-firebase/authentication` native plugin |
| "Google sign-in provider not enabled" | Added `FirebaseAuthentication: { providers: ['google.com'] }` to `capacitor.config.ts` |
| Gemini returns `<!doctype html>` | Old build used `APP_URL` backend proxy; new build calls Gemini directly |
| API key leaked / 403 | Key was committed to `.env.example`; rotated and now only in `.env.local` (gitignored) |
| Gemini 404 model not found | Updated model from `gemini-2.0-flash` → `gemini-2.5-flash-lite-preview-06-17` |
| Duplicate contacts in sidebar | `ContactForm` now uses stable `contactId` via `useRef`; `onSave` is async with `finally` |
| Button stuck at "Saving…" | `onSave` prop typed as `Promise<void>`, awaited in `handleSubmit` with `try/finally` |
| `proguard-android.txt` build error | Patched `@capacitor-community/contacts` and `@capacitor-community/firebase-analytics` via `patches/` |
| Contacts not saving to phone | Replaced VCF share-sheet with `@capacitor-community/contacts` direct write |

---

## Firebase project

- **Project ID:** `gen-lang-client-0680043177`
- **App ID:** `com.jabberwockstudio.snapdex`
- **Auth domain:** `gen-lang-client-0680043177.firebaseapp.com`
- Config hardcoded in `src/lib/firebase.ts`
- `google-services.json` must be in `android/app/` (not committed)

---

## Patches (auto-applied via `postinstall`)

| Package | Fix |
|---|---|
| `@capacitor-community/contacts@7.2.0` | `proguard-android.txt` → `proguard-android-optimize.txt` |
| `@capacitor-community/firebase-analytics@8.0.0` | same proguard fix |

---

## How to retain context in future sessions

1. **Read `CLAUDE.md`** — stack, key files, build commands, Play Store checklist
2. **Read `memory.md`** — this file; decisions, bugs, current state
3. **Use `@CLAUDE.md @memory.md`** at the start of your message to load both into context
4. **Update `memory.md`** at the end of each session with new bugs fixed and decisions made
