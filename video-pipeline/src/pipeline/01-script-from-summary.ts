// PASO 1-B · Generación de guion desde un resumen de negocio existente.
// Lee un archivo markdown de resumen y genera un Storyboard optimizado
// para shorts verticales 9:16 de 60-90 segundos.
// Uso: yarn script:summary <ruta-resumen.md> <slug>
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { stringify } from 'yaml';
import { nan } from '../lib/nan-client.js';
import { createNanCall } from '../lib/nan-call.js';
import { config } from '../config/index.js';
import type { Storyboard } from '../lib/types.js';
import { extractJson, validateStoryboard } from './storyboard-validation.js';

const summaryPath = process.argv[2];
const slug = process.argv[3];
const SCENE_COUNT = 6;
const MAX_ATTEMPTS = 5;

if (!summaryPath || !slug) {
  console.error('Uso: yarn script:summary <ruta-resumen.md> <slug>');
  process.exit(1);
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error(`ERROR: slug inválido: "${slug}". Usa minúsculas, dígitos y guiones.`);
  process.exit(1);
}

const SYSTEM = `Eres un guionista experto en shorts de negocio para redes sociales (TikTok, YouTube Shorts, Instagram Reels).
Recibes un resumen de negocio en español y produces un storyboard en JSON para un video vertical de 60-90 segundos.

Devuelves SOLO un objeto JSON válido, sin texto adicional, sin markdown y sin comentarios.
Forma exacta:
{
  "channel": "Resúmenes de Negocios",
  "caseNumber": 1,
  "title": string,
  "totalDuration": number (60-90 segundos),
  "artDirection": {
    "medium": "ilustración digital profesional estilo presentación ejecutiva",
    "lineWork": "líneas limpias, iconografía de negocios",
    "palette": "azul corporativo, blanco, acentos naranjas",
    "lighting": "iluminación difusa profesional",
    "texture": "gradientes suaves, fondos limpios",
    "mood": "confianza, profesionalismo, energía",
    "composition": "encuadres centrados, gráficos de datos cuando aplique",
    "humanTreatment": "siluetas profesionales, sin rostros detallados",
    "constraints": "sin texto en imagen, sin logos, sin gore"
  },
  "scenes": [
    {
      "id": "scene-01",
      "block": "GANCHO" | "DESARROLLO" | "CIERRE",
      "start": number,
      "end": number,
      "voiceover": string (español colombiano natural, tildes correctas),
      "onScreenText": string[] (1-2 frases cortas para pantalla),
      "imagePrompt": string (EN INGLÉS, concreto y visual, para buscar/generar imagen),
      "motion": string ("zoom-in", "zoom-out", "pan-left", "pan-right", "shake", "pan-slow")
    }
  ]
}

Reglas:
- Exactamente ${SCENE_COUNT} escenas, con ids "scene-01" a "scene-${String(SCENE_COUNT).padStart(2, '0')}".
- Tiempos contiguos: la primera empieza en 0, cada escena empieza donde acaba la anterior.
- El end de la última escena es igual a totalDuration.
- GANCHO (escena 1): dato impactante o pregunta provocativa del resumen. Captura atención en 3 seg.
- DESARROLLO (escenas 2-5): 3-4 insights clave del resumen. Concretos y accionables.
- CIERRE (escena 6): conclusión + CTA para leer el resumen completo.
- Voiceover: español colombiano, tono profesional pero cercano. Cada escena 8-12 segundos.
- imagePrompt: en inglés, describe una imagen concreta para esa escena (no abstracta).
- Sin gore ni contenido explícito.`;

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function complete(messages: ChatMessage[]): Promise<string> {
  const call = createNanCall(() =>
    nan.chat.completions.create({
      model: config.models.text,
      messages,
    }),
  );
  const res = await call();
  return res.choices[0]?.message?.content ?? '';
}

async function main() {
  const summaryContent = await readFile(resolve(summaryPath), 'utf-8');
  console.log(`Leyendo resumen: ${summaryPath} (${summaryContent.length} chars)`);
  console.log(`Generando storyboard para short: "${slug}"...`);

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Genera un storyboard de short vertical basado en este resumen de negocio:\n\n${summaryContent}`,
    },
  ];

  let storyboard: Storyboard | null = null;
  let lastErrors: string[] = [];
  let lastRaw = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      console.warn(`Reintento ${attempt}/${MAX_ATTEMPTS} con feedback...`);
    }
    lastRaw = await complete(messages);
    const json = extractJson(lastRaw);

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      lastErrors = ['la respuesta no es JSON parseable'];
      messages.push(
        { role: 'assistant', content: lastRaw },
        {
          role: 'user',
          content: 'Tu respuesta no es JSON parseable. Devuelve SOLO el objeto JSON corregido.',
        },
      );
      continue;
    }

    const validation = validateStoryboard(parsed, { sceneCount: SCENE_COUNT });
    if (!validation.valid) {
      lastErrors = validation.errors;
      messages.push(
        { role: 'assistant', content: lastRaw },
        {
          role: 'user',
          content:
            `El JSON no pasa la validación:\n- ${validation.errors.join('\n- ')}\n` +
            'Devuelve SOLO el objeto JSON corregido.',
        },
      );
      continue;
    }

    storyboard = parsed as Storyboard;
    break;
  }

  if (!storyboard) {
    console.error(
      `ERROR: no se obtuvo un Storyboard válido tras ${MAX_ATTEMPTS} intentos\n` +
      `WHY: ${lastErrors.join('; ')}\n` +
      `Última respuesta:\n${lastRaw.slice(0, 500)}`,
    );
    process.exit(1);
  }

  const outPath = resolve(config.paths.cases, `${slug}.yml`);
  const header =
    `# Generado desde resumen: ${summaryPath}\n` +
    `# Slug: ${slug} | ${storyboard.scenes.length} escenas | ${storyboard.totalDuration}s\n`;
  await mkdir(config.paths.cases, { recursive: true });
  await writeFile(outPath, header + stringify(storyboard), 'utf-8');

  console.log(`Guion guardado: ${outPath} (${storyboard.scenes.length} escenas, ${storyboard.totalDuration}s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
