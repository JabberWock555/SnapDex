# SnapDex

Business card scanner that converts cards to phone contacts. User photographs a card → Gemini AI extracts contact fields → user reviews/edits → `.vcf` file is downloaded (importable by Android/iOS as a contact).

**Current goal:** Publish to Google Play Store.

## Stack

- React 19 + TypeScript + Vite + Tailwind CSS v4
- Capacitor v8 for Android packaging (`@capacitor/android`)
- Gemini AI (`@google/genai`) — model `gemini-3.1-flash-lite-preview` for card OCR
- Firebase Analytics (`@capacitor-community/firebase-analytics`, `firebase`)
- Contact storage: `localStorage` (key `bizcard_history`)
- Contact export: vCard 3.0 `.vcf` download via `src/lib/vcard.ts`

## Key files

| File | Purpose |
|---|---|
| `src/App.tsx` | Root state: scan flow, history, error handling |
| `src/components/Scanner.tsx` | Camera capture UI |
| `src/components/ContactForm.tsx` | Review/edit extracted fields before saving |
| `src/components/Sidebar.tsx` | Scan history list |
| `src/lib/gemini.ts` | Calls Gemini API, returns structured `Contact` |
| `src/lib/vcard.ts` | Generates and triggers `.vcf` download |
| `src/lib/analytics.ts` | Firebase Analytics wrapper (`logEvent`, `setScreenName`) |
| `src/types.ts` | `Contact` interface |

## Contact fields

`id`, `firstName`, `lastName`, `company`, `jobTitle`, `phone`, `email`, `website`, `address`, `scanDate`, `imageUrl?`, `tag?`

## Environment

- `GEMINI_API_KEY` — required, injected at build time via `vite.config.ts`
- Dev server: `npm run dev` (port 3000)
- Build: `npm run build`

## Play Store checklist (in progress)

- Capacitor Android project must be synced: `npx cap sync android`
- App ID, version, signing config live in `android/app/build.gradle`
- Firebase config (`google-services.json`) must be placed in `android/app/`
- `GEMINI_API_KEY` must not be hard-coded in the APK — use a backend proxy or Android-specific secret handling before release
