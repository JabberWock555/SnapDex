# SnapDex

Business card scanner → Gemini AI extracts contact fields → saved to Firestore + written directly to phone's Contacts app.

**Current goal:** Publish to Google Play Store.

## Stack

- React 19 + TypeScript + Vite + Tailwind CSS v4
- Capacitor v8 (`@capacitor/android`) — app ID: `com.jabberwockstudio.snapdex`
- Gemini AI (`@google/genai`) — model `gemini-3.1-flash-lite`, called directly from client using `VITE_GEMINI_API_KEY`
- Firebase Auth (`firebase`) — Google Sign-In via `@capacitor-firebase/authentication` (native on Android, popup on web)
- Firestore (`firebase/firestore`) — contact storage at `users/{uid}/contacts/{contactId}`
- Firebase Analytics (`@capacitor-community/firebase-analytics`)
- Contact saving: `@capacitor-community/contacts` writes directly to phone address book on native
- Contact export: vCard 3.0 `.vcf` download on web fallback via `src/lib/vcard.ts`

## Key files

| File | Purpose |
|---|---|
| `src/App.tsx` | Root state: auth, scan flow, Firestore load/save, error handling |
| `src/components/AuthGate.tsx` | Google Sign-In screen (shown when unauthenticated) |
| `src/components/Scanner.tsx` | Camera capture UI |
| `src/components/ContactForm.tsx` | Review/edit extracted fields; async onSave with isSubmitting guard |
| `src/components/Sidebar.tsx` | Scan history grouped by tag |
| `src/lib/firebase.ts` | Firebase app init — exports `auth` and `db` |
| `src/lib/db.ts` | Firestore helpers: `loadContacts`, `saveContact`, `deleteContact` |
| `src/lib/gemini.ts` | Direct Gemini API call, returns structured `Contact` |
| `src/lib/vcard.ts` | `saveToDeviceContacts` (native) + `downloadVCard` (web fallback) |
| `src/lib/analytics.ts` | Firebase Analytics wrapper |
| `src/types.ts` | `Contact` interface |
| `capacitor.config.ts` | Capacitor config — includes FirebaseAuthentication plugin with `providers: ['google.com']` |
| `server/index.ts` | Express backend (unused for Gemini now; kept for future proxy use) |

## Contact fields

`id`, `firstName`, `lastName`, `company`, `jobTitle`, `phone`, `email`, `website`, `address`, `scanDate`, `imageUrl?`, `tag?`

## Environment (`.env.local` — never commit)

```
VITE_GEMINI_API_KEY=...   # get from aistudio.google.com/apikey
```

Firebase config is hardcoded in `src/lib/firebase.ts` (safe — public identifiers).

## Build & run

```bash
npm run dev          # web dev server (port 3000)
npm run build        # production build → dist/
npx cap sync android # copy dist/ to Android project
# Then build APK in Android Studio or:
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
cd android && ./gradlew assembleDebug
```

## Android notes

- `google-services.json` must be in `android/app/` (download from Firebase Console)
- SHA-1 debug fingerprint must be registered in Firebase Console for Google Sign-In
- `READ_CONTACTS` + `WRITE_CONTACTS` permissions declared in `AndroidManifest.xml`
- Two node_modules patches applied via `patches/` folder (proguard fix for `@capacitor-community/contacts` and `@capacitor-community/firebase-analytics`)
- `postinstall: patch-package` in `package.json` auto-applies patches after `npm install`

## Play Store checklist

- [x] Capacitor Android project synced
- [x] Firebase Auth (Google Sign-In) working on Android
- [x] Firestore contact storage with security rules
- [x] Contacts permission + direct save to phone address book
- [ ] Signing keystore for release build
- [ ] `VITE_GEMINI_API_KEY` — move to backend proxy before Play Store release (key is currently in APK)
- [ ] App icon, splash screen
- [ ] Play Console listing (screenshots, description, privacy policy)
