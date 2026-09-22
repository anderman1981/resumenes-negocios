#!/usr/bin/env node
// Genera un vídeo con DIAPOSITIVAS ORIGINALES (portada + ideas clave) sincronizadas
// con el audio del podcast. Seguro para AdSense/YouTube (contenido propio).
//
// Requisitos: sharp (ya instalado), ffmpeg/ffprobe.
// Uso:  node scripts/generar-video-slides.mjs <slug>
//       node scripts/generar-video-slides.mjs           (todos los audios de podcast-audio/)
import sharp from 'sharp';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const AUDIO = join(ROOT, 'podcast-audio');
const RES = join(ROOT, 'src', 'content', 'resumenes');
const OUT = join(ROOT, 'videos-podcast');
mkdirSync(OUT, { recursive: true });

const NAVY = '#0f1b3d', AZUL = '#1f47f5', TEAL = '#14b8a6';

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Envuelve texto en líneas de ~maxCh caracteres
function wrap(texto, maxCh) {
  const palabras = texto.split(/\s+/); const lineas = []; let l = '';
  for (const p of palabras) {
    if ((l + ' ' + p).trim().length > maxCh) { if (l) lineas.push(l.trim()); l = p; }
    else l = (l + ' ' + p).trim();
  }
  if (l) lineas.push(l.trim());
  return lineas;
}

function slidePortada(serie, dia, titulo) {
  const tl = wrap(titulo, 24);
  const ty = 470 - (tl.length - 1) * 45;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="${NAVY}"/>
    <rect x="0" y="900" width="1920" height="14" fill="${AZUL}"/>
    <text x="140" y="230" font-family="Arial" font-size="34" font-weight="700" letter-spacing="6" fill="#8eb6ff">${esc((serie||'').toUpperCase())}</text>
    ${dia!=null?`<text x="140" y="360" font-family="Arial" font-size="90" font-weight="800" fill="#ffffff">DÍA ${dia}</text><rect x="144" y="392" width="130" height="9" fill="${TEAL}"/>`:''}
    ${tl.map((ln,i)=>`<text x="140" y="${ty+i*92}" font-family="Arial" font-size="76" font-weight="800" fill="#ffffff">${esc(ln)}</text>`).join('')}
    <text x="140" y="1000" font-family="Arial" font-size="40" font-weight="700" fill="#bcd3ff">resumenes-negocios.vercel.app</text></svg>`;
}

function slideIdea(n, total, idea) {
  const ls = wrap(idea, 30);
  const y0 = 540 - (ls.length - 1) * 55;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="${NAVY}"/>
    <circle cx="180" cy="180" r="52" fill="${AZUL}"/><text x="180" y="198" font-family="Arial" font-size="48" font-weight="800" fill="#fff" text-anchor="middle">${n}</text>
    <text x="260" y="198" font-family="Arial" font-size="34" font-weight="700" letter-spacing="4" fill="#8eb6ff">IDEA CLAVE ${n} / ${total}</text>
    ${ls.map((ln,i)=>`<text x="180" y="${y0+i*96}" font-family="Arial" font-size="70" font-weight="800" fill="#ffffff">${esc(ln)}</text>`).join('')}
    <rect x="0" y="1060" width="1920" height="20" fill="${TEAL}"/></svg>`;
}

function leerResumen(slug) {
  const f = join(RES, `${slug}.md`);
  if (!existsSync(f)) return null;
  const t = readFileSync(f, 'utf8');
  const fm = (t.match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
  const titulo = (fm.match(/^titulo:\s*"?(.+?)"?\s*$/m) || [])[1] || slug;
  const serie = (fm.match(/^serieNombre:\s*"?(.+?)"?\s*$/m) || [])[1] || 'Resúmenes de Negocios';
  const dia = (fm.match(/^dia:\s*(\d+)/m) || [])[1] || null;
  const ideas = [];
  const bloque = fm.match(/ideasClave:\n([\s\S]*?)(?:\n[a-zA-Z]|$)/);
  if (bloque) for (const l of bloque[1].split('\n')) { const mm = l.match(/^\s*-\s*"?(.+?)"?\s*$/); if (mm) ideas.push(mm[1]); }
  return { titulo, serie, dia, ideas };
}

async function generar(slug) {
  const mp3 = join(AUDIO, `${slug}.mp3`);
  if (!existsSync(mp3)) { console.log(`⚠️  falta audio ${slug}.mp3`); return; }
  // El audio puede venir como "dia-1-<slug-de-contenido>"; quitamos el prefijo para
  // buscar el resumen y sus ideas clave.
  const contentSlug = slug.replace(/^dia-?\d+-?/i, '');
  const info = leerResumen(contentSlug) || { titulo: slug.replace(/^dia-?\d+-?/i,'').replace(/-/g,' '), serie: 'Cómo vender mejor que el 99%', dia: (slug.match(/^dia-?(\d+)/i)||[])[1] || null, ideas: [] };
  const tmp = join(OUT, `_tmp_${slug}`); mkdirSync(tmp, { recursive: true });

  const svgs = [slidePortada(info.serie, info.dia, info.titulo)];
  info.ideas.forEach((idea, i) => svgs.push(slideIdea(i + 1, info.ideas.length, idea)));

  const pngs = [];
  for (let i = 0; i < svgs.length; i++) {
    const p = join(tmp, `s${String(i).padStart(2,'0')}.png`);
    await sharp(Buffer.from(svgs[i])).png().toFile(p);
    pngs.push(p);
  }

  const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${mp3}"`).toString().trim());
  const per = (dur / pngs.length).toFixed(3);
  const lista = join(tmp, 'lista.txt');
  let txt = '';
  for (const p of pngs) txt += `file '${p}'\nduration ${per}\n`;
  txt += `file '${pngs[pngs.length-1]}'\n`;
  writeFileSync(lista, txt);

  const out = join(OUT, `${slug}.mp4`);
  console.log(`🎬 ${slug}: ${pngs.length} diapositivas, ${Math.round(dur)}s`);
  execSync(`ffmpeg -y -f concat -safe 0 -i "${lista}" -i "${mp3}" -c:v libx264 -pix_fmt yuv420p -r 6 -c:a aac -b:a 192k -shortest "${out}"`, { stdio: 'ignore' });
  rmSync(tmp, { recursive: true, force: true });
  console.log(`   ✅ ${out}`);
}

const slug = process.argv[2];
if (slug) { await generar(slug); }
else {
  const audios = existsSync(AUDIO) ? readdirSync(AUDIO).filter(f => f.endsWith('.mp3')) : [];
  if (!audios.length) { console.log('No hay audios en podcast-audio/'); process.exit(0); }
  for (const a of audios) await generar(a.replace(/\.mp3$/, ''));
}
console.log('\n🎉 Vídeos con diapositivas en videos-podcast/');
