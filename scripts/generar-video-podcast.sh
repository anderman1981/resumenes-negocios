#!/usr/bin/env bash
# Crea un vídeo (1920x1080) por episodio: portada fija + audio → MP4 para YouTube.
# Requiere: los audios en podcast-audio/<slug>.mp3 y las portadas en podcast-covers/<slug>.png
# Uso:  bash scripts/generar-video-podcast.sh            (todos)
#       bash scripts/generar-video-podcast.sh la-arquitectura-de-la-decision   (uno)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AUDIO_DIR="$ROOT/podcast-audio"
COVER_DIR="$ROOT/podcast-covers"
OUT="$ROOT/videos-podcast"
mkdir -p "$OUT"

uno="${1:-}"

for mp3 in "$AUDIO_DIR"/*.mp3; do
  [ -e "$mp3" ] || { echo "No hay audios en podcast-audio/"; exit 1; }
  slug="$(basename "$mp3" .mp3)"
  if [ -n "$uno" ] && [ "$uno" != "$slug" ]; then continue; fi
  cover="$COVER_DIR/$slug.png"
  if [ ! -f "$cover" ]; then echo "⚠️  falta portada $cover — se omite $slug"; continue; fi
  out="$OUT/$slug.mp4"
  echo "🎬 $slug ..."
  ffmpeg -y -loop 1 -i "$cover" -i "$mp3" \
    -c:v libx264 -tune stillimage -pix_fmt yuv420p -r 2 \
    -vf "scale=1000:1000,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0f1b3d" \
    -c:a aac -b:a 192k -shortest "$out" >/dev/null 2>&1
  echo "   ✅ $out"
done
echo "🎉 Vídeos en videos-podcast/  (súbelos a YouTube)"
