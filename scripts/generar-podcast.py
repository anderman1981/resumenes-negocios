#!/usr/bin/env python3
"""
Genera podcast de 2 voces (Host A / Host B) desde un guion en markdown, con voces
neuronales de edge-tts (gratis, sin API key). Un MP3 por episodio (Día 0..7).

Requisitos:  pip install edge-tts   (y ffmpeg instalado)

Uso:
  python3 scripts/generar-podcast.py RUTA_DEL_GUION.md
  python3 scripts/generar-podcast.py RUTA.md --dia 1          # solo un día
  python3 scripts/generar-podcast.py RUTA.md --voz-a es-CO-GonzaloNeural --voz-b es-CO-SalomeNeural
"""
import asyncio, re, sys, os, subprocess, tempfile
import edge_tts

VOZ_A = 'es-MX-JorgeNeural'   # Host A (masculina)
VOZ_B = 'es-MX-DaliaNeural'   # Host B (femenina)
SALIDA = 'podcast-audio'
NOMBRE_A = 'Andrés'           # reemplaza [Nombre Host A]
NOMBRE_B = 'Valentina'        # reemplaza [Nombre Host B]

# Mapa día -> nombre de archivo de salida
SLUGS = {
    '0': 'dia-0-introduccion',
    '1': 'la-arquitectura-de-la-decision',
    '2': 'psicologia-tactica-de-la-venta',
    '3': 'desarmar-barreras-tiempo-dinero',
    '4': 'reencuadrar-ajuste-y-autoridad',
    '5': 'neutralizar-el-necesito-pensarlo',
    '6': 'el-marco-closer',
    '7': 'practica-tonalidad-y-game-tape',
}

def limpiar(texto):
    t = texto
    t = re.sub(r'\*\*(.*?)\*\*', r'\1', t)      # **negrita**
    t = re.sub(r'\*(.*?)\*', r'\1', t)          # *cursiva*
    t = t.replace('`', '')                       # backticks
    t = t.replace('[Nombre Host A]', NOMBRE_A).replace('[Nombre Host B]', NOMBRE_B)
    t = re.sub(r'[👉✅🎯▶️🎧📄📊📥🚀🔒📝•]', '', t)  # emojis/bullets
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def parsear(md):
    """Devuelve {dia: [(voz, texto), ...]}"""
    dias = {}
    actual = None
    for linea in md.splitlines():
        h = re.match(r'^#\s*D[IÍ]A\s*(\d+)', linea, re.IGNORECASE)
        if h:
            actual = h.group(1)
            dias[actual] = []
            continue
        if actual is None:
            continue
        mA = re.match(r'^\*\*Host A:\*\*\s*(.*)', linea)
        mB = re.match(r'^\*\*Host B:\*\*\s*(.*)', linea)
        if mA:
            txt = limpiar(mA.group(1))
            if txt: dias[actual].append((VOZ_A, txt))
        elif mB:
            txt = limpiar(mB.group(1))
            if txt: dias[actual].append((VOZ_B, txt))
    return dias

async def sintetizar(voz, texto, ruta):
    com = edge_tts.Communicate(texto, voz, rate='+6%')
    await com.save(ruta)

async def generar_dia(dia, segmentos):
    os.makedirs(SALIDA, exist_ok=True)
    tmp = tempfile.mkdtemp()
    partes = []
    print(f'  Día {dia}: {len(segmentos)} intervenciones...')
    for i, (voz, texto) in enumerate(segmentos):
        p = os.path.join(tmp, f'{i:03d}.mp3')
        try:
            await sintetizar(voz, texto, p)
            partes.append(p)
        except Exception as e:
            print(f'    ! error seg {i}: {str(e)[:80]}')
    if not partes:
        print(f'  Día {dia}: sin audio'); return
    lista = os.path.join(tmp, 'lista.txt')
    with open(lista, 'w') as f:
        for p in partes: f.write(f"file '{p}'\n")
    slug = SLUGS.get(dia, f'dia-{dia}')
    out = os.path.join(SALIDA, f'{slug}.mp3')
    subprocess.run(['ffmpeg','-y','-f','concat','-safe','0','-i',lista,'-c','copy',out],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    mb = os.path.getsize(out)/1024/1024
    print(f'  ✅ {out} ({mb:.1f} MB)')

async def main():
    if len(sys.argv) < 2:
        print('Uso: python3 scripts/generar-podcast.py GUION.md [--dia N]'); sys.exit(1)
    ruta = sys.argv[1]
    solo = None
    if '--dia' in sys.argv: solo = sys.argv[sys.argv.index('--dia')+1]
    if '--voz-a' in sys.argv:
        global VOZ_A; VOZ_A = sys.argv[sys.argv.index('--voz-a')+1]
    if '--voz-b' in sys.argv:
        global VOZ_B; VOZ_B = sys.argv[sys.argv.index('--voz-b')+1]
    with open(ruta, encoding='utf-8') as f:
        dias = parsear(f.read())
    print(f'Episodios detectados: {sorted(dias.keys())}  |  Voces: A={VOZ_A}, B={VOZ_B}')
    for dia in sorted(dias.keys(), key=lambda x: int(x)):
        if solo and dia != solo: continue
        await generar_dia(dia, dias[dia])
    print(f'\nListo. Audios en {SALIDA}/  (súbelos a Spotify; no van al repo)')

if __name__ == '__main__':
    asyncio.run(main())
