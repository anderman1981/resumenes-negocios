// PASO 0-B · Orquestador para shorts desde resúmenes de negocio.
// Uso: yarn produce:summary <ruta-resumen.md> <slug> [--skip-<stage>]...
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runRender, muxAudio, checkRenderDeps } from './render-runner.js';

const exec = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

const summaryPath = process.argv[2];
const slug = process.argv[3];
if (!summaryPath || !slug) {
  console.error('Uso: yarn produce:summary <ruta-resumen.md> <slug> [--skip-<stage>]...');
  process.exit(1);
}

const skipStages = new Set<string>();
for (const arg of process.argv.slice(4)) {
  if (arg.startsWith('--skip-')) {
    skipStages.add(arg.slice('--skip-'.length));
  }
}

async function step(label: string, args: string[]): Promise<void> {
  console.log(`\n=== ${label} ===`);
  const { stdout, stderr } = await exec('yarn', ['tsx', ...args], {
    cwd: ROOT,
    timeout: 600_000,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
}

async function main() {
  console.log('Verificando dependencias...');
  const deps = await checkRenderDeps();
  if (!deps.hyperframes) {
    console.warn('HyperFrames no instalado — render/mux se saltarán');
    skipStages.add('render');
    skipStages.add('mux');
  }
  if (!deps.ffmpeg) {
    console.warn('ffmpeg no instalado — voice, subtitles y mux fallarán');
  }

  const yamlPath = resolve(ROOT, 'content', `${slug}.yml`);
  console.log(`\nProduciendo short: "${slug}" desde ${summaryPath}\n`);

  // 1. Script from summary
  if (skipStages.has('script')) {
    console.log('\n1/7 · Guion — saltado');
  } else if (existsSync(yamlPath)) {
    console.log(`\n1/7 · Guion — YAML existente (${yamlPath})`);
  } else {
    await step('1/7 · Guion desde resumen', [
      'src/pipeline/01-script-from-summary.ts', summaryPath, slug,
    ]);
  }

  // 2. Vision
  if (!skipStages.has('vision')) {
    await step('2/7 · Visión', ['src/pipeline/02-vision.ts', slug]);
  } else {
    console.log('\n2/7 · Visión — saltado');
  }

  // 3. Voice (edge-tts)
  if (!skipStages.has('voice')) {
    await step('3/7 · Voz', ['src/pipeline/03-voice.ts', slug]);
  } else {
    console.log('\n3/7 · Voz — saltado');
  }

  // 4. Subtitles (faster-whisper)
  if (!skipStages.has('subtitles')) {
    await step('4/7 · Subtítulos', ['src/pipeline/05-subtitles.ts', slug]);
  } else {
    console.log('\n4/7 · Subtítulos — saltado');
  }

  // 5. Compose
  if (!skipStages.has('compose')) {
    await step('5/7 · Composición', ['src/pipeline/04-compose.ts', slug]);
  } else {
    console.log('\n5/7 · Composición — saltado');
  }

  // 6. Render (HyperFrames)
  if (!skipStages.has('render')) {
    console.log('\n=== 6/7 · Render ===');
    await runRender(slug);
  } else {
    console.log('\n6/7 · Render — saltado');
  }

  // 7. Mux audio
  if (!skipStages.has('mux')) {
    console.log('\n=== 7/7 · Mux audio ===');
    await muxAudio(slug);
  } else {
    console.log('\n7/7 · Mux — saltado');
  }

  console.log(`\nVideo completo: assets/output/${slug}.mp4`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
