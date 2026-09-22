#!/usr/bin/env python3
"""
Genera subtítulos en español (.es.srt) e inglés (.en.srt) para cada audio del
podcast usando Whisper (faster-whisper, open-source, local, gratis).

Requisitos:  pip install faster-whisper
Uso:
  python3 scripts/generar-subtitulos.py                 # todos los audios
  python3 scripts/generar-subtitulos.py dia-1-la-arquitectura-de-la-decision
  python3 scripts/generar-subtitulos.py --modelo small  # más calidad (más lento)
"""
import os, sys, glob
from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(ROOT, 'podcast-audio')
OUT = os.path.join(ROOT, 'subtitulos')
os.makedirs(OUT, exist_ok=True)

modelo = 'base'
if '--modelo' in sys.argv:
    modelo = sys.argv[sys.argv.index('--modelo') + 1]

def ts(seg):
    h = int(seg // 3600); m = int((seg % 3600) // 60); s = int(seg % 60); ms = int((seg - int(seg)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def escribir_srt(segmentos, ruta):
    with open(ruta, 'w', encoding='utf-8') as f:
        for i, s in enumerate(segmentos, 1):
            f.write(f"{i}\n{ts(s.start)} --> {ts(s.end)}\n{s.text.strip()}\n\n")

print(f"Cargando modelo Whisper '{modelo}' (se descarga la primera vez)...")
model = WhisperModel(modelo, device='cpu', compute_type='int8')

args = [a for a in sys.argv[1:] if not a.startswith('--') and a != modelo]
if args:
    nombre = args[0]
    audios = [os.path.join(AUDIO, nombre if nombre.endswith('.mp3') else nombre + '.mp3')]
else:
    audios = sorted(glob.glob(os.path.join(AUDIO, '*.mp3')))

if not audios:
    print('No hay audios en podcast-audio/'); sys.exit(0)

for mp3 in audios:
    slug = os.path.splitext(os.path.basename(mp3))[0]
    print(f"\n🎧 {slug}")
    # Español (transcripción)
    print("  · ES ...")
    segs, _ = model.transcribe(mp3, language='es', vad_filter=True)
    escribir_srt(list(segs), os.path.join(OUT, f"{slug}.es.srt"))
    # Inglés (traducción automática)
    print("  · EN ...")
    segs, _ = model.transcribe(mp3, task='translate', vad_filter=True)
    escribir_srt(list(segs), os.path.join(OUT, f"{slug}.en.srt"))
    print(f"  ✅ {slug}.es.srt + {slug}.en.srt")

print(f"\n🎉 Subtítulos en subtitulos/  (sube los .srt a YouTube por idioma)")
