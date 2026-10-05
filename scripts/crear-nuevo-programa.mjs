#!/usr/bin/env node
/**
 * Script de automatización para OpenCode / Antigravity:
 * Compila y despliega programas multimodales de 7 Días (+ Día 0) a partir de los artefactos en _cola/
 *
 * Uso:
 *   node scripts/crear-nuevo-programa.mjs <topic_slug>
 *   npm run crear-programa -- crecimiento-e-ingresos-startups
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COLA = join(ROOT, '_cola');

// Obtener slug de los argumentos
const topicSlug = process.argv[2] || 'crecimiento-e-ingresos-startups';

console.log(`\n🚀 Iniciando compilación de programa multimodal: "${topicSlug}"...`);

// Mapeo canónico específico para 'crecimiento-e-ingresos-startups'
const MAPPING_STARTUPS = {
  dia_0: {
    dia: 0,
    titulo: "Día 0: Marco Estructural del Sistema de Escalabilidad",
    descripcion: "Onboarding y diagnóstico inicial de escalabilidad. Por qué el 75% de las startups fracasan y cómo evitar el escalamiento prematuro.",
    resumenFile: ["Dia_0_Resumen_Web_Marco_Estructural-v2.md", "Dia_0_Resumen_Web_Marco_Estructural.md"],
    guionFile: ["Dia_0_Guion_Podcast_Onboarding_Aceleracion_Ventas-v3.md", "Dia_0_Guion_Podcast_Onboarding_Aceleracion_Ventas-v2.md", "Dia_0_Guion_Podcast_Onboarding_Aceleracion_Ventas.md"],
    quizFile: ["Dia_0_Prompts_Quiz_Flashcards-v2.md", "Dia_0_Prompts_Quiz_Flashcards.md"],
    slidesPdf: ["Dia_0_Slides_Marco_Estructural_Sistema_Escalabilidad-v2.pdf", "Dia_0_Slides_Marco_Estructural_Sistema_Escalabilidad.pdf"],
    guiaPdf: ["Dia_0_Guia_Descargable_Onboarding_Sistema_7Dias-v2.pdf", "Dia_0_Guia_Descargable_Onboarding_Sistema_7Dias.pdf"],
    audioSrc: ["El_sistema_de_ventas_de_siete_días.m4a", "dia_0.m4a", "dia_0.mp3"],
    audioDest: "dia_0_onboarding_escalabilidad.mp3",
    slidesDest: "dia_0_slides_marco_estructural.pdf",
    guiaDest: "dia_0_guia_onboarding_sistema.pdf",
  },
  dia_1: {
    dia: 1,
    titulo: "Día 1: Cuantificación del Product-Market Fit e Indicadores Líderes",
    descripcion: "La fórmula matemática del PMF (p% / e / t), selección de eventos y análisis de retención mediante matrices de cohortes.",
    resumenFile: ["Dia_1_Resumen_Web_Cuantificacion_PMF-v2.md", "Dia_1_Resumen_Web_Cuantificacion_PMF.md"],
    guionFile: ["Dia_1_Guion_Podcast_Cuantificacion_PMF_Indicadores_Lideres-v (1).md", "Dia_1_Guion_Podcast_Cuantificacion_PMF_Indicadores_Lideres-v3.md", "Dia_1_Guion_Podcast_Cuantificacion_PMF_Indicadores_Lideres.md"],
    quizFile: ["Dia_1_Prompts_Quiz_Flashcards-v2.md", "Dia_1_Prompts_Quiz_Flashcards.md"],
    slidesPdf: ["Dia_1_Slides_Cuantificacion_Product_Market_Fit-v2.pdf", "Dia_1_Slides_Cuantificacion_Product_Market_Fit.pdf"],
    guiaPdf: ["Dia_1_Guia_Descargable_Matriz_Cohortes_PMF-v2.pdf", "Dia_1_Guia_Descargable_Matriz_Cohortes_PMF.pdf"],
    audioSrc: ["Por_qué_fracasan_las_startups_al_escalar.m4a", "dia_1.m4a", "dia_1.mp3"],
    audioDest: "dia_1_cuantificacion_pmf.mp3",
    slidesDest: "dia_1_slides_cuantificacion_pmf.pdf",
    guiaDest: "dia_1_guia_matriz_cohortes_pmf.pdf",
  },
  dia_2: {
    dia: 2,
    titulo: "Día 2: Go-To-Market Fit y Economía Unitaria (LTV, CAC, Payback)",
    descripcion: "Validación de economía unitaria sostenible: ratio LTV:CAC > 3.0x, periodo de Payback menor a 12 meses y cálculo de CAC Fully Loaded.",
    resumenFile: ["Dia_2_Resumen_Web_Go_To_Market_Fit-v2.md", "Dia_2_Resumen_Web_Go_To_Market_Fit.md"],
    guionFile: ["Dia_2_Guion_Podcast_GTM_Fit_Economia_Unitaria-v3.md", "Dia_2_Guion_Podcast_GTM_Fit_Economia_Unitaria-v2.md", "Dia_2_Guion_Podcast_GTM_Fit_Economia_Unitaria.md"],
    quizFile: ["Dia_2_Prompts_Quiz_Flashcards-v2.md", "Dia_2_Prompts_Quiz_Flashcards.md"],
    slidesPdf: ["Dia_2_Slides_Go_To_Market_Fit_Economia_Unitaria-v2.pdf", "Dia_2_Slides_Go_To_Market_Fit_Economia_Unitaria.pdf"],
    guiaPdf: ["Dia_2_Guia_Descargable_Calculadora_LTV_CAC_Payback-v2.pdf", "Dia_2_Guia_Descargable_Calculadora_LTV_CAC_Payback.pdf"],
    audioSrc: ["Por_qué_escalar_prematuramente_destruye_startups.m4a", "dia_2.m4a", "dia_2.mp3"],
    audioDest: "dia_2_gtm_fit_economia_unitaria.mp3",
    slidesDest: "dia_2_slides_gtm_fit_economia_unitaria.pdf",
    guiaDest: "dia_2_guia_calculadora_ltv_cac.pdf",
  },
  dia_3: {
    dia: 3,
    titulo: "Día 3: El Velocímetro de Escalamiento y Ritmo de Crecimiento",
    descripcion: "El tablero de control del crecimiento: cómo determinar cuántos vendedores contratar sin sobrecargar los canales de adquisición.",
    resumenFile: ["Dia_3_Resumen_Web_Velocimetro_Escalamiento-v2.md", "Dia_3_Resumen_Web_Velocimetro_Escalamiento.md"],
    guionFile: ["Dia_3_Guion_Podcast_Velocimetro_Escalamiento_Ritmo-v3.md", "Dia_3_Guion_Podcast_Velocimetro_Escalamiento_Ritmo-v2.md", "Dia_3_Guion_Podcast_Velocimetro_Escalamiento_Ritmo.md"],
    quizFile: ["Dia_3_Prompts_Quiz_Flashcards-v2.md", "Dia_3_Prompts_Quiz_Flashcards.md"],
    slidesPdf: ["Dia_3_Slides_Velocimetro_Escalamiento_Ritmo_Crecimiento-v2.pdf", "Dia_3_Slides_Velocimetro_Escalamiento_Ritmo_Crecimiento.pdf"],
    guiaPdf: ["Dia_3_Guia_Descargable_Matriz_Segmentacion_Velocimetro-v2.pdf", "Dia_3_Guia_Descargable_Matriz_Segmentacion_Velocimetro.pdf"],
    audioSrc: ["Por_qué_las_startups_mueren_de_éxito.m4a", "dia_3.m4a", "dia_3.mp3"],
    audioDest: "dia_3_velocimetro_escalamiento.mp3",
    slidesDest: "dia_3_slides_velocimetro_escalamiento.pdf",
    guiaDest: "dia_3_guia_matriz_segmentacion.pdf",
  },
  dia_4: {
    dia: 4,
    titulo: "Día 4: Alineación Científica entre Ventas y Marketing (SLA)",
    descripcion: "Contrato de Nivel de Servicio (SLA) basado en puntos de valor de leads en lugar de volumen bruto de MQLs.",
    resumenFile: ["Dia_4_Resumen_Web_Alineacion_Ventas_Marketing-v2.md", "Dia_4_Resumen_Web_Alineacion_Ventas_Marketing.md"],
    guionFile: ["Dia_4_Guion_Podcast_Alineacion_Cientifica_SLA-v3.md", "Dia_4_Guion_Podcast_Alineacion_Cientifica_SLA-v2.md", "Dia_4_Guion_Podcast_Alineacion_Cientifica_SLA.md"],
    quizFile: ["Dia_4_Prompts_Quiz_Flashcards-v2.md", "Dia_4_Prompts_Quiz_Flashcards.md"],
    slidesPdf: ["Dia_4_Slides_Alineacion_Cientifica_Ventas_Marketing-v2.pdf", "Dia_4_Slides_Alineacion_Cientifica_Ventas_Marketing.pdf"],
    guiaPdf: ["Dia_4_Guia_Descargable_SLA_Ventas_Marketing_Playbook-v2.pdf", "Dia_4_Guia_Descargable_SLA_Ventas_Marketing_Playbook.pdf"],
    audioSrc: ["Cómo_alinear_ventas_y_marketing_con_matemáticas.m4a", "dia_4.m4a", "dia_4.mp3"],
    audioDest: "dia_4_alineacion_ventas_marketing.mp3",
    slidesDest: "dia_4_slides_alineacion_ventas_marketing.pdf",
    guiaDest: "dia_4_guia_sla_ventas_marketing.pdf",
  },
  dia_5: {
    dia: 5,
    titulo: "Día 5: La Fórmula de Contratación de Ventas e Ingeniería de Perfil",
    descripcion: "Modelo cuantitativo de contratación: evaluación de coachability, simulación de llamadas en vivo y definición del perfil de vendedor.",
    resumenFile: ["Dia_5_Resumen_Web_Formula_Contratacion_Ventas-v2.md", "Dia_5_Resumen_Web_Formula_Contratacion_Ventas.md"],
    guionFile: ["Dia_5_Guion_Podcast_Formula_Contratacion_Ventas-v3.md", "Dia_5_Guion_Podcast_Formula_Contratacion_Ventas-v2.md", "Dia_5_Guion_Podcast_Formula_Contratacion_Ventas.md"],
    quizFile: ["Dia_5_Prompts_Quiz_Flashcards-v2.md", "Dia_5_Prompts_Quiz_Flashcards.md"],
    slidesPdf: ["Dia_5_Slides_Formula_Contratacion_Ventas_Coachability-v2.pdf", "Dia_5_Slides_Formula_Contratacion_Ventas_Coachability.pdf"],
    guiaPdf: ["Dia_5_Guia_Descargable_Rubrica_Entrevista_Simulacion_Ventas.pdf", "Dia_5_Guia_Descargable_Rubrica_Entrevista_Simulacion_Ventas (1).pdf"],
    audioSrc: ["La_fórmula_de_HubSpot_para_fichar_comerciales.m4a", "dia_5.m4a", "dia_5.mp3"],
    audioDest: "dia_5_formula_contratacion_ventas.mp3",
    slidesDest: "dia_5_slides_formula_contratacion.pdf",
    guiaDest: "dia_5_guia_rubrica_entrevista.pdf",
  },
  dia_6: {
    dia: 6,
    titulo: "Día 6: Coaching Métrico, Film Review y Planes de Compensación",
    descripcion: "Rutina diaria de Film Review a las 5:00 PM, diagnóstico métrico en embudo y estructuración de comisiones ligadas a retención.",
    resumenFile: ["Dia_6_Resumen_Web_Coaching_Metrico_Compensacion-v2.md", "Dia_6_Resumen_Web_Coaching_Metrico_Compensacion.md"],
    guionFile: ["Dia_6_Guion_Podcast_Coaching_Metrico_Compensacion-v3.md", "Dia_6_Guion_Podcast_Coaching_Metrico_Compensacion-v2.md", "Dia_6_Guion_Podcast_Coaching_Metrico_Compensacion.md"],
    quizFile: ["Dia_6_Prompts_Quiz_Flashcards-v2.md", "Dia_6_Prompts_Quiz_Flashcards.md"],
    slidesPdf: ["Dia_6_Slides_Coaching_Metrico_Compensacion_Estructura-v2.pdf", "Dia_6_Slides_Coaching_Metrico_Compensacion_Estructura.pdf"],
    guiaPdf: ["Dia_6_Guia_Descargable_Manual_Film_Review_Planes_Compensaci.pdf", "Dia_6_Guia_Descargable_Manual_Film_Review_Planes_Compensaci (1).pdf"],
    audioSrc: ["La_ciencia_de_escalar_ventas.m4a", "dia_6.m4a", "dia_6.mp3"],
    audioDest: "dia_6_coaching_metrico_compensacion.mp3",
    slidesDest: "dia_6_slides_coaching_metrico.pdf",
    guiaDest: "dia_6_guia_manual_film_review.pdf",
  },
  dia_7: {
    dia: 7,
    titulo: "Día 7: Disrupción de IA en Go-To-Market y Moats Estratégicos",
    descripcion: "Efectos de red de datos propietarios, modelos de cobro por valor ($/outcome), integración profunda (workflow embedding) y estrategia Beachhead.",
    resumenFile: ["Dia_7_Resumen_Web_Disrupcion_IA_GTM_Moats-v2.md", "Dia_7_Resumen_Web_Disrupcion_IA_GTM_Moats.md"],
    guionFile: ["Dia_7_Guion_Podcast_Disrupcion_IA_GTM_Moats_Beachhead-v3.md", "Dia_7_Guion_Podcast_Disrupcion_IA_GTM_Moats_Beachhead-v2.md", "Dia_7_Guion_Podcast_Disrupcion_IA_GTM_Moats_Beachhead.md"],
    quizFile: ["Dia_7_Prompts_Quiz_Flashcards-v2.md", "Dia_7_Prompts_Quiz_Flashcards.md"],
    slidesPdf: ["Dia_7_Slides_Disrupcion_IA_GTM_Moats_Beachhead-v2.pdf", "Dia_7_Slides_Disrupcion_IA_GTM_Moats_Beachhead.pdf"],
    guiaPdf: ["Dia_7_Guia_Descargable_Blueprint_Moats_Estrategia_Beachhead.pdf", "Dia_7_Guia_Descargable_Blueprint_Moats_Estrategia_Beachhead (1).pdf"],
    audioSrc: ["El_fin_del_software_de_ventas_tradicional.m4a", "dia_7.m4a", "dia_7.mp3"],
    audioDest: "dia_7_disrupcion_ia_gtm_moats.mp3",
    slidesDest: "dia_7_slides_disrupcion_ia_gtm.pdf",
    guiaDest: "dia_7_guia_blueprint_moats_beachhead.pdf",
  },
};

// 1. Identificar directorio fuente en _cola/
let sourceDir = join(COLA, topicSlug);
if (!existsSync(sourceDir)) {
  if (topicSlug === 'crecimiento-e-ingresos-startups' && existsSync(join(COLA, 'startups'))) {
    sourceDir = join(COLA, 'startups');
  } else {
    console.error(`❌ No se encontró el directorio fuente: ${sourceDir}`);
    process.exit(1);
  }
}
console.log(`📁 Directorio fuente: ${sourceDir}`);

// 2. Definir rutas destino
const publicProgramas = join(ROOT, 'public', 'assets', 'programas', topicSlug);
const audioDir = join(publicProgramas, 'audio');
const pdfDir = join(publicProgramas, 'pdf');
const coversDir = join(publicProgramas, 'covers');

const contentProgramas = join(ROOT, 'src', 'content', '_programas', topicSlug);

mkdirSync(audioDir, { recursive: true });
mkdirSync(pdfDir, { recursive: true });
mkdirSync(coversDir, { recursive: true });
mkdirSync(contentProgramas, { recursive: true });

// Copiar portada principal si existe
const coverCandidates = [
  'Fórmula_del_Crecimiento_Escalable_B2B.png',
  'portada.png',
  'portada.jpg',
  'cover.png',
  'cover.jpg',
];
let mainCover = '';
for (const cand of coverCandidates) {
  const p = join(sourceDir, cand);
  if (existsSync(p)) {
    const ext = cand.endsWith('.png') ? '.png' : '.jpg';
    const dest = join(coversDir, `portada_principal${ext}`);
    copyFileSync(p, dest);
    mainCover = `/assets/programas/${topicSlug}/covers/portada_principal${ext}`;
    console.log(`🖼️ Portada copiada: ${mainCover}`);
    break;
  }
}

// Función para buscar primer archivo existente de una lista
function findFile(dir, candidates) {
  for (const c of candidates) {
    const p = join(dir, c);
    if (existsSync(p)) return p;
  }
  return null;
}

// Parser de Flashcards y Quiz
function parseQuizFlashcards(content) {
  const flashcards = [];
  const quiz = [];

  // 1. Extraer Flashcards
  // Patrón Front / Back
  const patternA = /(?:^|\n)\s*(\d+)\.\s+\*\*Front\*\*:\s*([\s\S]*?)\n\s*\*\*Back\*\*:\s*([\s\S]*?)(?=\n\s*\d+\.|\n\s*---|\n\s*##|$)/gi;
  let match;
  while ((match = patternA.exec(content)) !== null) {
    flashcards.push({
      front: match[2].trim(),
      back: match[3].trim(),
    });
  }

  // Si no encontró con patrón A, probar patrón Anverso / Reverso
  if (flashcards.length === 0) {
    const patternB = /(?:^|\n)\s*(?:\d+\.\s+\*\*Ficha\s*\d+:\*\*\s*\n)?\s*(?:\*\s*)?\*\*Anverso:\*\*\s*([\s\S]*?)\n\s*(?:\*\s*)?\*\*Reverso:\*\*\s*([\s\S]*?)(?=\n\s*\d+\.|\n\s*---|\n\s*##|$)/gi;
    while ((match = patternB.exec(content)) !== null) {
      flashcards.push({
        front: match[1].trim(),
        back: match[2].trim(),
      });
    }
  }

  // 2. Extraer Preguntas del Quiz
  // Bloque de preguntas numeradas
  const qSectionMatch = content.match(/##\s*📝\s*Quiz Evaluativo[\s\S]*$/i);
  const qText = qSectionMatch ? qSectionMatch[0] : content;

  const qRegex = /(?:^|\n)\s*(\d+)\.\s+\*\*([^\n*]+)\*\*([\s\S]*?)(?=\n\s*\d+\.\s+\*\*|\n\s*---|\n\s*##|$)/g;
  let qMatch;
  while ((qMatch = qRegex.exec(qText)) !== null) {
    const id = parseInt(qMatch[1], 10);
    const question = qMatch[2].trim();
    const body = qMatch[3];

    // Opciones: a) o * A)
    const options = [];
    const optRegex = /(?:^|\n)\s*(?:\*\s*)?([A-Da-d])\)\s*([^\n]+)/g;
    let optMatch;
    while ((optMatch = optRegex.exec(body)) !== null) {
      options.push({
        key: optMatch[1].toLowerCase(),
        text: optMatch[2].trim(),
      });
    }

    // Respuesta correcta
    const ansMatch = body.match(/(?:\*+\s*)?Respuesta Correcta:?\*+\s*:?\s*\*+([A-Da-d])\*+/i);
    const correct = ansMatch ? ansMatch[1].toLowerCase() : (options[0]?.key || 'a');

    // Justificación
    const justMatch = body.match(/(?:\*+\s*)?(?:Justificación|Explicación):?\*+\s*:?\s*([^\n]+)/i);
    const justification = justMatch ? justMatch[1].trim() : '';

    if (options.length > 0) {
      quiz.push({
        id,
        question,
        options,
        correct,
        justification,
      });
    }
  }

  return { flashcards, quiz };
}

// 3. Procesar los Días (0 al 7)
const mapping = topicSlug === 'crecimiento-e-ingresos-startups' ? MAPPING_STARTUPS : {};
const diasResultados = [];

for (let d = 0; d <= 7; d++) {
  const diaKey = `dia_${d}`;
  const conf = mapping[diaKey] || {
    dia: d,
    titulo: `Día ${d}`,
    descripcion: '',
    resumenFile: [`Dia_${d}_Resumen.md`],
    guionFile: [`Dia_${d}_Guion.md`],
    quizFile: [`Dia_${d}_Prompts_Quiz_Flashcards.md`],
    slidesPdf: [`Dia_${d}_Slides.pdf`],
    guiaPdf: [`Dia_${d}_Guia.pdf`],
    audioSrc: [`dia_${d}.m4a`, `dia_${d}.mp3`],
    audioDest: `dia_${d}_podcast.mp3`,
    slidesDest: `dia_${d}_slides.pdf`,
    guiaDest: `dia_${d}_guia.pdf`,
  };

  const targetDiaDir = join(contentProgramas, diaKey);
  mkdirSync(targetDiaDir, { recursive: true });

  console.log(`\n📦 Procesando Día ${d}: ${conf.titulo}...`);

  // A. Resumen Web
  const resumenSource = findFile(sourceDir, conf.resumenFile);
  if (resumenSource) {
    copyFileSync(resumenSource, join(targetDiaDir, 'resumen.md'));
    console.log(`  ✓ Resumen: src/content/programas/${topicSlug}/${diaKey}/resumen.md`);
  } else {
    console.warn(`  ⚠️ Falta resumen para Día ${d}`);
  }

  // B. Guión Podcast
  const guionSource = findFile(sourceDir, conf.guionFile);
  if (guionSource) {
    copyFileSync(guionSource, join(targetDiaDir, 'guion_podcast.md'));
    console.log(`  ✓ Guión: src/content/programas/${topicSlug}/${diaKey}/guion_podcast.md`);
  }

  // C. Quiz & Flashcards
  let flashcardsCount = 0;
  let quizCount = 0;
  const quizSource = findFile(sourceDir, conf.quizFile);
  if (quizSource) {
    const rawQuiz = readFileSync(quizSource, 'utf8');
    const parsed = parseQuizFlashcards(rawQuiz);
    flashcardsCount = parsed.flashcards.length;
    quizCount = parsed.quiz.length;
    writeFileSync(join(targetDiaDir, 'quiz.json'), JSON.stringify(parsed, null, 2), 'utf8');
    console.log(`  ✓ Quiz & Flashcards: ${flashcardsCount} fichas, ${quizCount} preguntas`);
  }

  // D. PDFs: Slides y Guía
  let slidesUrl = '';
  const slidesSource = findFile(sourceDir, conf.slidesPdf);
  if (slidesSource) {
    const slidesDestFile = conf.slidesDest || `dia_${d}_slides.pdf`;
    copyFileSync(slidesSource, join(pdfDir, slidesDestFile));
    slidesUrl = `/assets/programas/${topicSlug}/pdf/${slidesDestFile}`;
    console.log(`  ✓ Slides PDF: ${slidesUrl}`);
  }

  let guiaUrl = '';
  const guiaSource = findFile(sourceDir, conf.guiaPdf);
  if (guiaSource) {
    const guiaDestFile = conf.guiaDest || `dia_${d}_guia.pdf`;
    copyFileSync(guiaSource, join(pdfDir, guiaDestFile));
    guiaUrl = `/assets/programas/${topicSlug}/pdf/${guiaDestFile}`;
    console.log(`  ✓ Guía PDF: ${guiaUrl}`);
  }

  // E. Audio
  let audioUrl = '';
  const audioSource = findFile(sourceDir, conf.audioSrc);
  if (audioSource) {
    const destAudioName = conf.audioDest || `dia_${d}_podcast.mp3`;
    const destAudioPath = join(audioDir, destAudioName);

    if (audioSource.endsWith('.mp3')) {
      copyFileSync(audioSource, destAudioPath);
      audioUrl = `/assets/programas/${topicSlug}/audio/${destAudioName}`;
      console.log(`  ✓ Audio copiado: ${audioUrl}`);
    } else if (audioSource.endsWith('.m4a')) {
      // Intentar convertir con ffmpeg a mp3
      try {
        console.log(`  ⚙️ Convirtiendo m4a a mp3 (${basename(audioSource)})...`);
        execSync(`ffmpeg -y -i "${audioSource}" -vn -codec:a libmp3lame -b:a 128k "${destAudioPath}"`, {
          stdio: 'pipe',
        });
        audioUrl = `/assets/programas/${topicSlug}/audio/${destAudioName}`;
        console.log(`  ✓ Audio convertido a MP3: ${audioUrl}`);
      } catch (err) {
        // Fallback: copiar directo m4a
        const fallbackName = destAudioName.replace(/\.mp3$/, '.m4a');
        copyFileSync(audioSource, join(audioDir, fallbackName));
        audioUrl = `/assets/programas/${topicSlug}/audio/${fallbackName}`;
        console.log(`  ✓ Fallback de audio (copiado directo): ${audioUrl}`);
      }
    }
  }

  diasResultados.push({
    dia: d,
    dirName: diaKey,
    diaSlug: `dia-${d}`,
    titulo: conf.titulo,
    descripcion: conf.descripcion,
    audio: audioUrl,
    slidesPdf: slidesUrl,
    guiaPdf: guiaUrl,
    flashcardsCount,
    quizCount,
  });
}

// 4. Guardar meta.json
const meta = {
  slug: topicSlug,
  nombre: topicSlug === 'crecimiento-e-ingresos-startups'
    ? 'Crecimiento e Ingresos en Startups'
    : topicSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  titulo: 'Programa Maestro Multimodal: Aceleración de Ventas y Escalamiento en 7 Días (+ Día 0)',
  descripcion: 'Sistema científico de go-to-market basado en las metodologías de aceleración comercial de HubSpot y Stage 2 Capital. Incluye podcasts ejecutivos, diapositivas, plantillas de cálculo, fichas mnemotécnicas y quizzes evaluativos diarios.',
  autor: 'Mark Roberge (HubSpot / Stage 2 Capital) & Equipo Editorial',
  categoria: 'emprendimiento',
  portada: mainCover || `/assets/programas/${topicSlug}/covers/portada_principal.png`,
  dias: diasResultados,
};

writeFileSync(join(contentProgramas, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
console.log(`\n📋 Metadatos generados: src/content/programas/${topicSlug}/meta.json`);

console.log(`\n✅ ¡Programa "${topicSlug}" compilado y desplegado con éxito en la app!`);
