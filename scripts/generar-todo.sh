#!/usr/bin/env bash
# ============================================================================
#  ORQUESTADOR SEMANAL — genera TODO y publica la web.
#  Uso:  bash scripts/generar-todo.sh [ruta_del_guion.md]
#  Por defecto usa _semana/guiones.md
# ============================================================================
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
GUION="${1:-_semana/guiones.md}"
log() { echo ""; echo "════════ $1 ════════"; }

log "1/6  AUDIOS (podcast 2 voces)"
if [ -f "$GUION" ]; then
  python3 scripts/generar-podcast.py "$GUION" || echo "⚠️  error en audios"
else
  echo "ℹ️  No hay guion en $GUION — se omite la generación de audio (usa los audios ya existentes en podcast-audio/)."
fi

log "2/6  PORTADAS"
node scripts/generar-covers.mjs || echo "⚠️  error en portadas"

log "3/6  VÍDEOS (diapositivas + audio)"
node scripts/generar-video-slides.mjs || echo "⚠️  error en vídeos"

log "4/6  SUBTÍTULOS ES/EN"
python3 scripts/generar-subtitulos.py --modelo small || echo "⚠️  error en subtítulos"

log "5/6  GUÍA INFOGRAFÍA (PDF)"
python3 scripts/generar-guia-pdf.py || echo "ℹ️  (opcional) sin guía"

log "6/6  PUBLICAR PÁGINAS (cola → git push → Vercel)"
node scripts/publicar-cola.mjs || echo "⚠️  nada en la cola o error de git"

echo ""
echo "🎉 LISTO."
echo "   • Web: publicada; cada artículo aparece en su 'fecha' (goteo diario automático)."
echo "   • Spotify: sube los MP3 de  podcast-audio/  (o usa el feed /podcast.xml)."
echo "   • YouTube: sube los MP4 de  videos-podcast/  + los .srt de  subtitulos/"
echo "   • Portadas para episodios en  podcast-covers/"
