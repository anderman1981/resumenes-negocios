#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIPELINE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_DIR="$(cd "$PIPELINE_DIR/.." && pwd)"

export PATH="$HOME/.local/bin:$PATH"
export VIDEO_PIPELINE_VENV="$HOME/video-pipeline-env"

SUMMARIES=(
  "Dia_0_Resumen_Web_Marco_Estructural-v2.md:crecimiento-dia-0"
  "Dia_1_Resumen_Web_Cuantificacion_PMF-v2.md:crecimiento-dia-1"
  "Dia_2_Resumen_Web_Go_To_Market_Fit-v2.md:crecimiento-dia-2"
  "Dia_3_Resumen_Web_Velocimetro_Escalamiento-v2.md:crecimiento-dia-3"
  "Dia_4_Resumen_Web_Alineacion_Ventas_Marketing-v2.md:crecimiento-dia-4"
  "Dia_5_Resumen_Web_Formula_Contratacion_Ventas-v2.md:crecimiento-dia-5"
  "Dia_6_Resumen_Web_Coaching_Metrico_Compensacion-v2.md:crecimiento-dia-6"
  "Dia_7_Resumen_Web_Disrupcion_IA_GTM_Moats-v2.md:crecimiento-dia-7"
)

echo "=========================================="
echo "Generando ${#SUMMARIES[@]} shorts..."
echo "=========================================="

cd "$PIPELINE_DIR"
FAILED=0

for entry in "${SUMMARIES[@]}"; do
  IFS=: read -r FILE SLUG <<< "$entry"
  SUMMARY_PATH="$PROJECT_DIR/_cola/startups/$FILE"

  echo ""
  echo "=========================================="
  echo "[$SLUG] Procesando..."
  echo "=========================================="

  if [ ! -f "$SUMMARY_PATH" ]; then
    echo "WARN: $SUMMARY_PATH no existe, saltando"
    continue
  fi

  yarn produce:summary "$SUMMARY_PATH" "$SLUG" || {
    echo "ERROR: $SLUG falló"
    FAILED=$((FAILED + 1))
    continue
  }
done

echo ""
echo "=========================================="
echo "Completado. Fallidos: $FAILED/${#SUMMARIES[@]}"
echo "=========================================="
