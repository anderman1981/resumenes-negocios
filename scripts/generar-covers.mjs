#!/usr/bin/env node
// Genera una portada cuadrada (1500x1500) por cada audio en podcast-audio/,
// leyendo el título/serie/día del resumen correspondiente. Genérico para
// cualquier contenido nuevo. Nombre de salida = nombre del audio.
import sharp from 'sharp';
import { mkdirSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const AUDIO = join(ROOT, 'podcast-audio');
const RES = join(ROOT, 'src', 'content', 'resumenes');
const OUT = join(ROOT, 'podcast-covers');
mkdirSync(OUT, { recursive: true });

const NAVY = '#0f1b3d', AZUL = '#1f47f5', TEAL = '#14b8a6';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(t, max) {
  const w = t.split(/\s+/); const l = []; let c = '';
  for (const p of w) { if ((c + ' ' + p).trim().length > max) { if (c) l.push(c.trim()); c = p; } else c = (c + ' ' + p).trim(); }
  if (c) l.push(c.trim());
  return l.slice(0, 3);
}

function leer(contentSlug) {
  const f = join(RES, `${contentSlug}.md`);
  if (!existsSync(f)) return null;
  const fm = (readFileSync(f, 'utf8').match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
  return {
    titulo: (fm.match(/^titulo:\s*"?(.+?)"?\s*$/m) || [])[1] || contentSlug,
    serie: (fm.match(/^serieNombre:\s*"?(.+?)"?\s*$/m) || [])[1] || 'Resúmenes de Negocios',
    dia: (fm.match(/^dia:\s*(\d+)/m) || [])[1] || null,
  };
}

function svg(serie, dia, titulo) {
  const tl = wrap(titulo, 18);
  const ty = 760 - (tl.length - 1) * 60;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1500" viewBox="0 0 1500 1500">
    <rect width="1500" height="1500" fill="${NAVY}"/>
    <g stroke="${AZUL}" stroke-width="4" opacity="0.5"><line x1="1150" y1="150" x2="1330" y2="330"/><line x1="1330" y1="330" x2="1250" y2="520"/></g>
    <g fill="${TEAL}" opacity="0.85"><circle cx="1150" cy="150" r="12"/><circle cx="1330" cy="330" r="12"/><circle cx="1250" cy="520" r="12"/></g>
    <text x="110" y="200" font-family="Arial" font-size="40" font-weight="700" letter-spacing="5" fill="#8eb6ff">${esc((serie || '').toUpperCase()).slice(0, 34)}</text>
    ${dia != null ? `<text x="104" y="560" font-family="Arial" font-size="130" font-weight="800" fill="#ffffff">DÍA ${dia}</text><rect x="120" y="600" width="130" height="9" fill="${TEAL}"/>` : ''}
    ${tl.map((ln, i) => `<text x="110" y="${ty + i * 96}" font-family="Arial" font-size="84" font-weight="800" fill="${i === 0 ? '#ffffff' : '#bcd3ff'}">${esc(ln)}</text>`).join('')}
    <rect x="0" y="1330" width="1500" height="170" fill="${AZUL}"/>
    <text x="110" y="1438" font-family="Arial" font-size="46" font-weight="700" fill="#ffffff">resumenes-negocios.vercel.app</text>
  </svg>`;
}

const audios = existsSync(AUDIO) ? readdirSync(AUDIO).filter((f) => f.endsWith('.mp3')) : [];
if (!audios.length) { console.log('No hay audios en podcast-audio/. (Las portadas se generan por cada audio.)'); process.exit(0); }

for (const a of audios) {
  const slug = a.replace(/\.mp3$/, '');
  const contentSlug = slug.replace(/^dia-?\d+-?/i, '');
  const info = leer(contentSlug) || { titulo: contentSlug.replace(/-/g, ' '), serie: 'Resúmenes de Negocios', dia: (slug.match(/^dia-?(\d+)/i) || [])[1] || null };
  await sharp(Buffer.from(svg(info.serie, info.dia, info.titulo))).png().toFile(join(OUT, `${slug}.png`));
  console.log('OK', slug);
}
console.log(`Portadas en podcast-covers/ (${audios.length})`);
