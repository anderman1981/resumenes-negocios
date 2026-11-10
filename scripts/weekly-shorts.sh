#!/bin/bash
set -euo pipefail

# Weekly shorts generator — finds published summaries without shorts and generates them
# Runs on the AMR server via crontab

PROJ_DIR="$HOME/projects/googleads"
PIPELINE_DIR="$PROJ_DIR/video-pipeline"
COLA_DIR="$PROJ_DIR/_cola"
SHORTS_DIR="$PROJ_DIR/public/shorts"
LOG_FILE="$HOME/logs/weekly-shorts-$(date +%Y%m%d-%H%M%S).log"

export PATH="$HOME/.local/bin:$PATH"
export VIDEO_PIPELINE_VENV="$HOME/video-pipeline-env"

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

log "=== Weekly shorts generation started ==="

cd "$PROJ_DIR"
git checkout dev
git pull origin dev

# Find summaries that have no short field or short is empty
GENERATED=0
FAILED=0
SKIPPED=0

for resumen in src/content/resumenes/*.md; do
  slug=$(basename "$resumen" .md)

  # Check if short field exists and is non-empty
  if grep -q '^short:.*\.mp4' "$resumen" 2>/dev/null; then
    # Already has a short — check the MP4 actually exists
    if [ -f "$SHORTS_DIR/${slug}.mp4" ] || ls "$SHORTS_DIR/"*"${slug}"*.mp4 &>/dev/null; then
      continue
    fi
    log "WARN: $slug has short field but MP4 missing, will regenerate"
  fi

  # Try to find a matching _cola source file (Resumen_Web pattern)
  SOURCE=""
  for candidate in "$COLA_DIR"/*/Dia_*Resumen_Web*-v2.md "$COLA_DIR"/*/*.md; do
    if [ -f "$candidate" ]; then
      # Match by checking if the summary title appears in the source
      titulo=$(grep '^titulo:' "$resumen" | head -1 | sed 's/^titulo: *//' | tr -d '"')
      if grep -qi "$(echo "$titulo" | cut -c1-30)" "$candidate" 2>/dev/null; then
        SOURCE="$candidate"
        break
      fi
    fi
  done

  if [ -z "$SOURCE" ]; then
    log "SKIP: $slug — no matching _cola source found"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  # Determine the short slug (use the resumen slug as-is)
  SHORT_SLUG="$slug"
  SHORT_MP4="$SHORTS_DIR/${SHORT_SLUG}.mp4"

  if [ -f "$SHORT_MP4" ]; then
    log "SKIP: $slug — MP4 already exists at $SHORT_MP4"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  log "GENERATE: $slug from $(basename "$SOURCE")"

  cd "$PIPELINE_DIR"
  if yarn produce:summary "$SOURCE" "$SHORT_SLUG" >> "$LOG_FILE" 2>&1; then
    # Copy output to public/shorts/
    if [ -f "assets/output/${SHORT_SLUG}.mp4" ]; then
      cp "assets/output/${SHORT_SLUG}.mp4" "$SHORT_MP4"
      log "OK: $slug — MP4 generated ($(du -h "$SHORT_MP4" | cut -f1))"

      # Add short field to frontmatter if not present
      cd "$PROJ_DIR"
      if ! grep -q '^short:' "$resumen"; then
        sed -i "/^youtube:/a short: \"/shorts/${SHORT_SLUG}.mp4\"" "$resumen"
        log "OK: $slug — frontmatter updated with short field"
      fi

      GENERATED=$((GENERATED + 1))
    else
      log "FAIL: $slug — pipeline ran but no MP4 output"
      FAILED=$((FAILED + 1))
    fi
  else
    log "FAIL: $slug — pipeline error (see log for details)"
    FAILED=$((FAILED + 1))
  fi

  cd "$PROJ_DIR"
done

# Commit and push if anything was generated
if [ "$GENERATED" -gt 0 ]; then
  cd "$PROJ_DIR"
  git add public/shorts/*.mp4 src/content/resumenes/*.md
  git commit -m "feat(shorts): weekly auto-generate $GENERATED new video shorts

Co-Authored-By: weekly-shorts.sh <noreply@amr-server>"
  git push origin dev
  log "Committed and pushed $GENERATED new shorts to dev"
fi

log "=== Done: $GENERATED generated, $FAILED failed, $SKIPPED skipped ==="
