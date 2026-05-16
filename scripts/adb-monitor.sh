#!/usr/bin/env bash
# ADB log monitor — streams filtered logs, extracts issues into BUGS.md
# Usage: bash scripts/adb-monitor.sh <package> <log_file> <bugs_file>
#
# Captures: crashes, exceptions, ANRs, fatal errors, permission denials
# Appends de-duplicated entries to BUGS.md under a timestamped session block.

PACKAGE="${1:-com.jabberwockstudio.snapdex}"
LOG_FILE="${2:-logs/adb.log}"
BUGS_FILE="${3:-BUGS.md}"

RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

SESSION_START=$(date '+%Y-%m-%d %H:%M:%S')
SESSION_HEADER="## Session: $SESSION_START"

# Patterns that indicate a bug/issue worth capturing
BUG_PATTERN='(FATAL|AndroidRuntime|E/Capacitor|E/WebView|ANR|CRASH|Exception|Error:|Permission denied|Unhandled|at com\.jabberwockstudio)'

# Temp file to accumulate new bugs for this session
TMP_BUGS=$(mktemp /tmp/snapdex_bugs_XXXX.txt)
LAST_BLOCK=""
BLOCK_LINES=()

cleanup() {
  local bug_count=${#BLOCK_LINES[@]}
  if [ "$bug_count" -gt 0 ]; then
    echo "" >> "$BUGS_FILE"
    echo "$SESSION_HEADER" >> "$BUGS_FILE"
    echo "" >> "$BUGS_FILE"
    for line in "${BLOCK_LINES[@]}"; do
      echo "$line" >> "$BUGS_FILE"
    done
    echo -e "\n${CYAN}Captured $bug_count issue blocks → $BUGS_FILE${NC}"
  fi
  rm -f "$TMP_BUGS"
  exit 0
}
trap cleanup INT TERM

echo -e "${CYAN}ADB Monitor started — filtering: $PACKAGE${NC}"
echo -e "${CYAN}Logging to: $LOG_FILE${NC}"
echo -e "Issues will be appended to: ${YELLOW}$BUGS_FILE${NC}"
echo ""

# Append log header
echo "# ADB Session: $SESSION_START" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

IN_CRASH=false
CRASH_BUFFER=()
LAST_SEEN_HASHES=()

while IFS= read -r line; do
  # Write every line to raw log
  echo "$line" >> "$LOG_FILE"

  # Filter to only app-relevant lines or system crash lines
  if ! echo "$line" | grep -qE "($PACKAGE|AndroidRuntime|ANR|FATAL|ActivityManager)"; then
    continue
  fi

  # Detect crash/error block start
  if echo "$line" | grep -qE "$BUG_PATTERN"; then
    IN_CRASH=true
    CRASH_BUFFER=("$line")
    echo -e "${RED}[ISSUE]${NC} $line"
  elif [ "$IN_CRASH" = true ]; then
    # Continue collecting stack trace lines (lines starting with whitespace or "at ")
    if echo "$line" | grep -qE "^\s+(at |\.\.\.)|Caused by:|^[A-Z].*Exception"; then
      CRASH_BUFFER+=("$line")
    else
      # End of crash block — process it
      IN_CRASH=false
      BLOCK_TEXT=$(printf '%s\n' "${CRASH_BUFFER[@]}")

      # Deduplicate by hashing the first meaningful line
      HASH=$(echo "${CRASH_BUFFER[0]}" | md5 2>/dev/null || echo "${CRASH_BUFFER[0]}" | md5sum | cut -d' ' -f1)
      ALREADY_SEEN=false
      for h in "${LAST_SEEN_HASHES[@]:-}"; do
        [ "$h" = "$HASH" ] && ALREADY_SEEN=true && break
      done

      if [ "$ALREADY_SEEN" = false ]; then
        LAST_SEEN_HASHES+=("$HASH")
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        BLOCK_LINES+=("### Issue at $TIMESTAMP")
        BLOCK_LINES+=("\`\`\`")
        while IFS= read -r bline; do
          BLOCK_LINES+=("$bline")
        done <<< "$BLOCK_TEXT"
        BLOCK_LINES+=("\`\`\`")
        BLOCK_LINES+=("")
      fi

      CRASH_BUFFER=()
    fi
  else
    echo -e "${CYAN}[LOG]${NC} $line"
  fi
done < <(adb logcat -v threadtime 2>/dev/null)

cleanup
