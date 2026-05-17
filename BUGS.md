# SnapDex — Bug & Issue Tracker

Universal list of bugs and issues captured from ADB logs and manual testing.
Automatically appended by `scripts/adb-monitor.sh` during device test sessions.

---

## Open Issues

<!-- Manually tracked bugs go here. Format:
### [BUG-N] Short description
- **Severity:** Critical / High / Medium / Low
- **Reported:** YYYY-MM-DD
- **Repro:** Steps to reproduce
- **Status:** Open / In Progress / Fixed
-->

### [BUG-1] VITE_GEMINI_API_KEY not baked into APK when building from worktree
- **Severity:** Critical
- **Reported:** 2026-05-18
- **Repro:** Build APK from a git worktree; scan any card → "VITE_GEMINI_API_KEY is not set." error, scan fails immediately.
- **Root cause:** `.env.local` is gitignored and only lives in the main project root. Vite bakes env vars at build time, so worktree builds produce an APK with the key missing.
- **Fix:** Copy `.env.local` to worktree before building (added to `test-in-device.sh`).
- **Status:** Fixed

### [BUG-2] Gemini model name mismatch — deprecated model causes API failure
- **Severity:** Critical
- **Reported:** 2026-05-18
- **Repro:** Any card scan → Gemini API returns deprecated/not-found error.
- **Root cause:** `gemini-2.5-flash-lite-preview-06-17` is deprecated. Correct current model is `gemini-3.1-flash-lite`.
- **Status:** Fixed

### [BUG-3] "Save to Contacts" button resets to unsaved state immediately after saving
- **Severity:** High
- **Reported:** 2026-05-18
- **Repro:** Save a contact → button briefly shows "Saving..." then reverts to "Save to Contacts" instead of showing "Saved ✓".
- **Root cause:** `handleSaveContact` called `setCurrentScan(contact)` after save, which changed the `initialData` prop reference. The `useEffect` in `ContactForm` fired on that change and called `setIsSaved(false)`, resetting the saved state before the user could see it.
- **Fix:** Removed `setCurrentScan(contact)` from save path; form stays open naturally since `setCurrentScan(null)` was already removed.
- **Status:** Fixed

### [BUG-4] Device contacts not saving (permission + native API)
- **Severity:** High
- **Reported:** 2026-05-18
- **Repro:** Grant Contacts permission → tap "Save to Contacts" → contact does not appear in phone's Contacts app.
- **Root cause:** `Contacts.requestPermissions()` was called unconditionally, hanging when permission had been previously denied and re-granted via Settings. Fixed by checking `checkPermissions()` first.
- **Status:** In Progress — pending device test after BUG-1/BUG-2 fixes

---

## ADB Session Logs

<!-- Automatically appended by scripts/adb-monitor.sh -->
