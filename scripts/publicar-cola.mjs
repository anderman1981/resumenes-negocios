#!/usr/bin/env node
// Procesa _cola/<slug>/ → crea las páginas, copia assets, archiva y publica (git push).
// Uso:  npm run publicar         (procesa y publica)
//       npm run publicar -- --dry  (solo muestra qué haría)
import { readdirSync, statSync, existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COLA = join(ROOT, '_cola');
const PUBLICADOS = join(COLA, '_publicados');
const RES = join(ROOT, 'src', 'content', 'resumenes');
const dry = process.argv.includes('--dry');

function frontmatterTiene(fm, clave) {
  return new RegExp(`^${clave}:`, 'm').test(fm);
}

function procesar(slug) {
  const dir = join(COLA, slug);
  const mdPath = join(dir, 'resumen.md');
  if (!existsSync(mdPath)) {
    console.log(`⚠️  ${slug}: falta resumen.md — se omite`);
    return false;
  }
  let contenido = readFileSync(mdPath, 'utf8');
  const m = contenido.match(/^---\n([\s\S]*?)\n---/);
  if (!m) {
    console.log(`⚠️  ${slug}: resumen.md sin frontmatter — se omite`);
    return false;
  }
  let fm = m[1];

  // Portada
  const portada = join(dir, 'portada.png');
  if (existsSync(portada) && !frontmatterTiene(fm, 'portada')) {
    if (!dry) { mkdirSync(join(ROOT, 'public', 'portadas'), { recursive: true }); copyFileSync(portada, join(ROOT, 'public', 'portadas', `${slug}.png`)); }
    fm += `\nportada: "/portadas/${slug}.png"`;
  }
  // Guía PDF
  const guia = join(dir, 'guia.pdf');
  if (existsSync(guia) && !frontmatterTiene(fm, 'pdf')) {
    if (!dry) { mkdirSync(join(ROOT, 'public', 'guias'), { recursive: true }); copyFileSync(guia, join(ROOT, 'public', 'guias', `${slug}.pdf`)); }
    fm += `\npdf: "/guias/${slug}.pdf"\npdfNombre: "Descargar guía (PDF)"`;
  }
  contenido = contenido.replace(m[0], `---\n${fm}\n---`);

  const destino = join(RES, `${slug}.md`);
  console.log(`✅ ${slug} → src/content/resumenes/${slug}.md`);
  if (!dry) {
    writeFileSync(destino, contenido, 'utf8');
    mkdirSync(PUBLICADOS, { recursive: true });
    renameSync(dir, join(PUBLICADOS, slug));
  }
  return true;
}

if (!existsSync(COLA)) { console.log('No existe _cola/'); process.exit(0); }
const slugs = readdirSync(COLA).filter((n) => {
  const p = join(COLA, n);
  return statSync(p).isDirectory() && n !== '_publicados' && !n.startsWith('.');
});

if (slugs.length === 0) { console.log('Cola vacía. Nada que publicar.'); process.exit(0); }

let procesados = 0;
for (const slug of slugs) if (procesar(slug)) procesados++;

if (dry) { console.log(`\n(dry-run) ${procesados} listos. Ejecuta sin --dry para publicar.`); process.exit(0); }

if (procesados > 0) {
  console.log(`\n📦 Publicando ${procesados} en git...`);
  try {
    execSync('git add -A', { cwd: ROOT, stdio: 'inherit' });
    execSync(`git commit -q -m "Publica ${procesados} contenido(s) desde la cola"`, { cwd: ROOT, stdio: 'inherit' });
    execSync('git push origin main', { cwd: ROOT, stdio: 'inherit' });
    console.log('🚀 Push hecho. Vercel desplegará en ~1 min. Cada página aparece en su fecha.');
  } catch (e) {
    console.log('⚠️  Error en git (¿nada que commitear o sin remoto?):', String(e).slice(0, 150));
  }
}
