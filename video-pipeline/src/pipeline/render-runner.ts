import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, mkdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(execFile);

export async function checkRenderDeps(): Promise<{ hyperframes: boolean; ffmpeg: boolean }> {
  let hyperframes = false;
  let ffmpeg = false;

  try {
    await execAsync('hyperframes', ['render', '--help']);
    hyperframes = true;
  } catch {
    // not installed or not in PATH
  }

  try {
    await execAsync('ffmpeg', ['-version']);
    ffmpeg = true;
  } catch {
    // not installed
  }

  return { hyperframes, ffmpeg };
}

export async function runRender(slug: string): Promise<void> {
  const renderDir = resolve(process.cwd(), 'renders', slug);

  if (!existsSync(resolve(renderDir, 'index.html'))) {
    throw new Error(
      `ERROR: No se encuentra renders/${slug}/index.html\n` +
      'WHY: La etapa de composición no generó el workspace HTML\n' +
      `FIX: Ejecuta: yarn compose ${slug}`,
    );
  }

  try {
    await execAsync('hyperframes', [
      'render',
      renderDir,
      '--output', resolve(renderDir, 'video-silent.mp4'),
      '--workers', '1',
      '--quality', 'draft',
      '--fps', '24',
    ], { timeout: 600_000, maxBuffer: 10 * 1024 * 1024 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `ERROR: HyperFrames falló al renderizar renders/${slug}\n` +
      `WHY: ${detail}\n` +
      'FIX: Verifica que hyperframes esté en PATH; instala con: npm install -g hyperframes',
    );
  }
}

export async function muxAudio(slug: string): Promise<void> {
  const renderDir = resolve(process.cwd(), 'renders', slug);
  const manifestPath = resolve(renderDir, 'manifest.json');

  if (!existsSync(manifestPath)) {
    throw new Error(
      `ERROR: No se encuentra renders/${slug}/manifest.json\n` +
      'WHY: La etapa de composición no generó el manifiesto\n' +
      `FIX: Ejecuta: yarn compose ${slug}`,
    );
  }

  const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
  const audioPath = resolve(renderDir, manifest.audio.path);
  const videoPath = resolve(renderDir, 'video-silent.mp4');
  const outDir = resolve(process.cwd(), 'assets', 'output');
  const outputPath = resolve(outDir, `${slug}.mp4`);

  if (!existsSync(videoPath)) {
    throw new Error(
      `ERROR: renders/${slug}/video-silent.mp4 no encontrado\n` +
      'WHY: La etapa de render no produjo el video\n' +
      'FIX: Revisa que HyperFrames esté funcionando correctamente',
    );
  }

  await mkdir(outDir, { recursive: true });

  try {
    await execAsync('ffmpeg', [
      '-i', audioPath,
      '-i', videoPath,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-map', '1:v:0',
      '-map', '0:a:0',
      '-shortest',
      '-y',
      outputPath,
    ], { timeout: 120_000 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `ERROR: ffmpeg falló al mezclar audio y video\n` +
      `WHY: ${detail}\n` +
      'FIX: Verifica que ffmpeg esté instalado',
    );
  }

  await unlink(videoPath);
  console.log(`✅ Mux completado: ${outputPath}`);
}
