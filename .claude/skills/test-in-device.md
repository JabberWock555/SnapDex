# Skill: test-in-device

Trigger phrases: "test in device", "test on device", "build and test", "deploy to device"

## What this skill does

Runs the full SnapDex device-testing workflow:
1. Asks permission then pushes uncommitted git changes
2. Builds the web app (`npm run build`)
3. Syncs Capacitor (`npx cap sync android`)
4. Assembles the debug APK (`./gradlew assembleDebug`)
5. Uploads APK to Google Drive "App Testing" folder (deletes old APK first)
6. Installs the APK on the connected ADB device and launches the app
7. Starts `scripts/adb-monitor.sh` in the background to stream and capture crash logs
8. Reports any new issues found into `BUGS.md`

## Instructions for Claude

When the user says "test in device" (or any trigger phrase above):

1. **Check prerequisites** using Bash:
   - `adb devices` — warn if no device connected
   - Confirm `scripts/test-in-device.sh` exists

2. **Ask the user** if they want to push changes first (unless they said --skip-push).

3. **Run the workflow**:
   ```bash
   bash scripts/test-in-device.sh
   ```
   Stream output so the user can see each step live.

4. **If Google Drive credentials are missing** (`scripts/credentials.json` not present and `scripts/.gdrive_token.json` not present):
   - Explain the one-time setup steps below
   - Offer to run with `--skip-upload` flag in the meantime

5. **After the build**, report:
   - APK size and path
   - Whether upload succeeded
   - Whether install succeeded
   - Monitor PID and how to stop it

6. **Check BUGS.md** for any newly appended issues from this session and summarize them to the user.

## Google Drive one-time setup

Tell the user to do this once:

1. Go to https://console.cloud.google.com/
2. Create/select a project → APIs & Services → Enable **Google Drive API**
3. Credentials → Create Credentials → **OAuth 2.0 Client ID** → Desktop app
4. Download JSON → rename to `credentials.json` → place in `scripts/credentials.json`
5. Run: `python3 scripts/gdrive_upload.py --setup`
   - A browser window opens → sign in → grant access
   - Token saved to `scripts/.gdrive_token.json`
6. Also install missing Python dependency if needed:
   `pip3 install google-auth-oauthlib`

## Flags

| Flag | Effect |
|------|--------|
| `--skip-push` | Skip git commit/push step |
| `--skip-upload` | Skip Google Drive upload |

## Key paths

| Item | Path |
|------|------|
| Main script | `scripts/test-in-device.sh` |
| ADB monitor | `scripts/adb-monitor.sh` |
| Drive uploader | `scripts/gdrive_upload.py` |
| Debug APK output | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Raw ADB logs | `logs/adb.log` |
| Bug tracker | `BUGS.md` |
| App package | `com.jabberwockstudio.snapdex` |
