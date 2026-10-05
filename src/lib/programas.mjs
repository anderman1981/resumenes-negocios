import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const PROGRAMAS_DIR = existsSync(join(ROOT, 'src', 'content', '_programas'))
  ? join(ROOT, 'src', 'content', '_programas')
  : join(ROOT, 'src', 'content', 'programas');

/**
 * Devuelve la lista de todos los programas disponibles
 */
export async function getProgramas() {
  if (!existsSync(PROGRAMAS_DIR)) return [];

  const dirs = readdirSync(PROGRAMAS_DIR).filter((n) => {
    const full = join(PROGRAMAS_DIR, n);
    return statSync(full).isDirectory() && !n.startsWith('.');
  });

  const list = [];
  for (const slug of dirs) {
    const p = await getPrograma(slug);
    if (p) list.push(p);
  }
  return list;
}

/**
 * Devuelve la información completa de un programa por su slug
 */
export async function getPrograma(slug) {
  const dir = join(PROGRAMAS_DIR, slug);
  if (!existsSync(dir)) return null;

  const metaPath = join(dir, 'meta.json');
  let meta = {};
  if (existsSync(metaPath)) {
    try {
      meta = JSON.parse(readFileSync(metaPath, 'utf8'));
    } catch (e) {
      console.error(`Error al leer ${metaPath}:`, e);
    }
  }

  // Buscar carpetas dia_0, dia_1, etc.
  const subdirs = readdirSync(dir).filter((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() && (n.startsWith('dia_') || n.startsWith('dia-'));
  });

  const dias = [];
  for (const d of subdirs) {
    const m = d.match(/dia[_-](\d+)/i);
    const num = m ? parseInt(m[1], 10) : 0;
    const diaInfo = meta.dias?.find((item) => item.dia === num) || {
      dia: num,
      titulo: `Día ${num}`,
      descripcion: '',
    };

    dias.push({
      dirName: d,
      diaSlug: `dia-${num}`,
      ...diaInfo,
    });
  }

  dias.sort((a, b) => a.dia - b.dia);

  return {
    slug,
    nombre: meta.nombre || slug,
    titulo: meta.titulo || meta.nombre || slug,
    descripcion: meta.descripcion || '',
    autor: meta.autor || 'Equipo Editorial',
    portada: meta.portada || `/assets/programas/${slug}/covers/portada_principal.png`,
    meta,
    dias,
    totalDias: dias.length,
  };
}

/**
 * Devuelve la información detallada de un día específico de un programa
 */
export async function getDia(slug, diaParam) {
  const programa = await getPrograma(slug);
  if (!programa) return null;

  // Normalizar diaParam (ej: "dia-0", "dia_0", "0")
  const m = String(diaParam).match(/\d+/);
  const diaNum = m ? parseInt(m[0], 10) : 0;

  const diaMeta = programa.dias.find((d) => d.dia === diaNum);
  if (!diaMeta) return null;

  const diaDir = join(PROGRAMAS_DIR, slug, diaMeta.dirName);

  // Leer resumen.md
  let resumenMd = '';
  let resumenHtml = '';
  const resumenPath = join(diaDir, 'resumen.md');
  if (existsSync(resumenPath)) {
    resumenMd = readFileSync(resumenPath, 'utf8');
    // Limpiar frontmatter si tiene
    const cleanMd = resumenMd.replace(/^---\n[\s\S]*?\n---\n?/, '');
    resumenHtml = marked.parse(cleanMd);
  }

  // Leer guion_podcast.md
  let guionMd = '';
  let guionHtml = '';
  const guionPath = join(diaDir, 'guion_podcast.md');
  if (existsSync(guionPath)) {
    guionMd = readFileSync(guionPath, 'utf8');
    const cleanGuion = guionMd.replace(/^---\n[\s\S]*?\n---\n?/, '');
    guionHtml = marked.parse(cleanGuion);
  }

  // Leer quiz.json
  let quizData = { flashcards: [], quiz: [] };
  const quizPath = join(diaDir, 'quiz.json');
  if (existsSync(quizPath)) {
    try {
      quizData = JSON.parse(readFileSync(quizPath, 'utf8'));
    } catch (e) {
      console.error(`Error al parsear ${quizPath}:`, e);
    }
  }

  // Rutas de assets
  const audioUrl = diaMeta.audio || `/assets/programas/${slug}/audio/dia_${diaNum}_podcast.mp3`;
  const slidesUrl = diaMeta.slidesPdf || `/assets/programas/${slug}/pdf/dia_${diaNum}_slides.pdf`;
  const guiaUrl = diaMeta.guiaPdf || `/assets/programas/${slug}/pdf/dia_${diaNum}_guia.pdf`;

  // Navegación
  const idx = programa.dias.findIndex((d) => d.dia === diaNum);
  const anterior = idx > 0 ? programa.dias[idx - 1] : null;
  const siguiente = idx < programa.dias.length - 1 ? programa.dias[idx + 1] : null;

  return {
    programa,
    dia: diaNum,
    diaSlug: `dia-${diaNum}`,
    titulo: diaMeta.titulo,
    descripcion: diaMeta.descripcion,
    duracion: diaMeta.duracion || '10 min',
    resumenMd,
    resumenHtml,
    guionMd,
    guionHtml,
    quizData,
    audioUrl,
    slidesUrl,
    guiaUrl,
    nav: {
      anterior: anterior ? { dia: anterior.dia, slug: `dia-${anterior.dia}`, titulo: anterior.titulo } : null,
      siguiente: siguiente ? { dia: siguiente.dia, slug: `dia-${siguiente.dia}`, titulo: siguiente.titulo } : null,
    },
  };
}
