#!/usr/bin/env bash
# SnapDex — "test in device" workflow
# Usage: bash scripts/test-in-device.sh [--skip-push] [--skip-upload]
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APK_OUTPUT="$PROJECT_ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
LOG_DIR="$PROJECT_ROOT/logs"
BUGS_FILE="$PROJECT_ROOT/BUGS.md"
PACKAGE="com.jabberwockstudio.snapdex"

SKIP_PUSH=false
SKIP_UPLOAD=false

for arg in "$@"; do
  case $arg in
    --skip-push) SKIP_PUSH=true ;;
    --skip-upload) SKIP_UPLOAD=true ;;
  esac
done

# ── helpers ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
step()  { echo -e "\n${BLUE}▶ $1${NC}"; }
ok()    { echo -e "${GREEN}✓ $1${NC}"; }
warn()  { echo -e "${YELLOW}⚠ $1${NC}"; }
fail()  { echo -e "${RED}✗ $1${NC}"; exit 1; }

mkdir -p "$LOG_DIR"

# ── 1. Git push ───────────────────────────────────────────────────────────────
if [ "$SKIP_PUSH" = false ]; then
  step "Checking git status"
  cd "$PROJECT_ROOT"
  STATUS=$(git status --porcelain)
  if [ -z "$STATUS" ]; then
    ok "Working tree clean — nothing to commit"
  else
    echo "$STATUS"
    echo ""
    read -rp "Stage all changes and push? [y/N] " CONFIRM
    if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
      BRANCH=$(git rev-parse --abbrev-ref HEAD)
      git add -A
      git commit -m "chore: device test build $(date '+%Y-%m-%d %H:%M')"
      git push origin "$BRANCH"
      ok "Pushed to $BRANCH"
    else
      warn "Skipping push (uncommitted changes remain)"
    fi
  fi
fi

# ── 2. Web build ──────────────────────────────────────────────────────────────
step "Building web app (npm run build)"
cd "$PROJECT_ROOT"
npm run build 2>&1 | tee "$LOG_DIR/build.log"
ok "Web build complete"

# ── 3. Capacitor sync ─────────────────────────────────────────────────────────
step "Syncing Capacitor to Android"
npx cap sync android 2>&1 | tee -a "$LOG_DIR/build.log"
ok "Capacitor sync complete"

# ── 4. Assemble debug APK ─────────────────────────────────────────────────────
step "Building debug APK (Gradle)"
cd "$PROJECT_ROOT/android"
./gradlew assembleDebug 2>&1 | tee -a "$LOG_DIR/build.log"

if [ ! -f "$APK_OUTPUT" ]; then
  fail "Debug APK not found at expected path: $APK_OUTPUT"
fi
APK_SIZE=$(du -sh "$APK_OUTPUT" | cut -f1)
ok "Debug APK built — $APK_SIZE  →  $APK_OUTPUT"

# ── 5. Google Drive upload ────────────────────────────────────────────────────
if [ "$SKIP_UPLOAD" = false ]; then
  step "Uploading APK to Google Drive 'App Testing'"
  GDRIVE_SCRIPT="$PROJECT_ROOT/scripts/gdrive_upload.py"
  CREDS="$PROJECT_ROOT/scripts/credentials.json"
  TOKEN="$PROJECT_ROOT/scripts/.gdrive_token.json"

  if [ ! -f "$CREDS" ] && [ ! -f "$TOKEN" ]; then
    warn "Google Drive credentials not set up."
    warn "Run: python3 scripts/gdrive_upload.py --setup  (after placing credentials.json)"
    warn "Skipping upload."
  else
    # Check missing dependency
    python3 -c "import google_auth_oauthlib" 2>/dev/null || pip3 install google-auth-oauthlib --quiet
    python3 "$GDRIVE_SCRIPT" "$APK_OUTPUT"
    ok "APK uploaded to Google Drive"
  fi
fi

# ── 6. Install APK on device ──────────────────────────────────────────────────
step "Installing APK on connected device"
DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l | tr -d ' ')
if [ "$DEVICES" -eq 0 ]; then
  warn "No ADB device connected — skipping install"
else
  adb install -r "$APK_OUTPUT" 2>&1
  ok "APK installed on device"

  step "Launching app on device"
  adb shell am start -n "$PACKAGE/.MainActivity" 2>/dev/null || true
fi

# ── 7. Start ADB log monitor ──────────────────────────────────────────────────
step "Starting ADB log monitor (logs → $LOG_DIR/adb.log)"
echo "  Press Ctrl+C to stop monitoring."
echo ""

# Clear logcat buffer so we only see fresh logs
adb logcat -c

# Run monitor in background, writing to file + stdout
bash "$PROJECT_ROOT/scripts/adb-monitor.sh" "$PACKAGE" "$LOG_DIR/adb.log" "$BUGS_FILE" &
MONITOR_PID=$!
echo "  ADB monitor PID: $MONITOR_PID (kill with: kill $MONITOR_PID)"

ok "Workflow complete. Monitor is running."
echo ""
echo -e "${YELLOW}Tip:${NC} Check $BUGS_FILE for captured issues."
