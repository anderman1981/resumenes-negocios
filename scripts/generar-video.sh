#!/usr/bin/env bash
#
# Genera un vídeo para YouTube a partir de las diapositivas (PDF) y el audio (.m4a)
# de un día de la serie. Las diapositivas se reparten equitativamente a lo largo
# de la duración del audio, a 1920x1080.
#
# Requisitos: ffmpeg, ffprobe y pdftoppm (poppler).
#   brew install ffmpeg poppler
#
# Uso:
#   bash scripts/generar-video.sh 1        # genera el vídeo del día 1
#   bash scripts/generar-video.sh 1 7      # genera del día 1 al 7
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESDE="${1:-1}"
HASTA="${2:-$DESDE}"

# Verificar herramientas
for cmd in ffmpeg ffprobe pdftoppm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Falta '$cmd'. Instala con: brew install ffmpeg poppler"
    exit 1
  fi
done

mkdir -p "$ROOT/videos"

for (( DIA=DESDE; DIA<=HASTA; DIA++ )); do
  SRC="$ROOT/_fuentes/dia-$DIA"
  echo ""
  echo "🎬 Día $DIA ..."

  PDF="$(ls "$SRC"/*.pdf 2>/dev/null | head -1 || true)"
  AUDIO="$(ls "$SRC"/*.m4a "$SRC"/*.mp3 2>/dev/null | head -1 || true)"

  if [[ -z "$PDF" || -z "$AUDIO" ]]; then
    echo "⚠️  Día $DIA: falta el PDF o el audio en $SRC — se omite."
    continue
  fi

  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT

  # 1) PDF -> imágenes PNG (1920 de ancho aprox., a 150 dpi)
  echo "   · Extrayendo diapositivas..."
  pdftoppm -png -r 150 "$PDF" "$TMP/slide" >/dev/null 2>&1
  SLIDES=( "$TMP"/slide-*.png )
  N=${#SLIDES[@]}
  if (( N == 0 )); then echo "⚠️  Sin diapositivas en $PDF"; continue; fi

  # 2) Duración del audio y por diapositiva
  DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AUDIO")"
  PER="$(awk -v d="$DUR" -v n="$N" 'BEGIN{printf "%.4f", d/n}')"
  echo "   · $N diapositivas · audio ${DUR%.*}s · ${PER}s por diapositiva"

  # 3) Lista para ffmpeg (concat demuxer)
  LIST="$TMP/list.txt"
  : > "$LIST"
  for IMG in "${SLIDES[@]}"; do
    echo "file '$IMG'" >> "$LIST"
    echo "duration $PER" >> "$LIST"
  done
  # Repetir la última imagen (requisito del concat demuxer)
  echo "file '${SLIDES[$((N-1))]}'" >> "$LIST"

  OUT="$ROOT/videos/dia-$DIA.mp4"
  echo "   · Renderizando vídeo (esto puede tardar)..."
  ffmpeg -y -f concat -safe 0 -i "$LIST" -i "$AUDIO" \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=white,format=yuv420p" \
    -r 30 -c:v libx264 -preset medium -crf 20 \
    -c:a aac -b:a 192k -shortest \
    "$OUT" >/dev/null 2>&1

  rm -rf "$TMP"; trap - EXIT
  echo "   ✅ $OUT"
done

echo ""
echo "🎉 Listo. Vídeos en: $ROOT/videos/"
