// PASO 3 · Generación de voz con edge-tts (Microsoft free TTS).
// Concatena la narración de todas las escenas, genera el audio en español,
// lo re-codifica a estéreo y mide su duración.
import { writeFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { config } from '../config/index.js';
import { loadStoryboard, currentCaseSlug } from '../content/load.js';
import type { Scene } from '../lib/types.js';
import { getAudioDuration } from '../lib/ffprobe.js';

const exec = promisify(execFile);

const VENV_PYTHON = process.env.VIDEO_PIPELINE_VENV
  ? `${process.env.VIDEO_PIPELINE_VENV}/bin/python3`
  : 'python3';

async function main() {
  const storyboard = await loadStoryboard();
  const slug = currentCaseSlug();
  const text = storyboard.scenes.map((s: Scene) => s.voiceoverTTS ?? s.voiceover).join(' ');

  console.log('\n--- TEXTO A NARRAR ---\n' + text + '\n--- fin ---\n');

  const voice = config.voice.id();
  const rawPath = `${config.paths.audio}/${slug}-raw.mp3`;
  const finalPath = `${config.paths.audio}/${slug}.mp3`;
  await mkdir(config.paths.audio, { recursive: true });

  // Write text to a temp file to avoid shell escaping issues
  const textPath = `${config.paths.audio}/${slug}-text.txt`;
  await writeFile(textPath, text, 'utf-8');

  console.log(`Generando voz con edge-tts (voz: ${voice})...`);
  try {
    const edgeTtsPath = process.env.VIDEO_PIPELINE_VENV
      ? `${process.env.VIDEO_PIPELINE_VENV}/bin/edge-tts`
      : 'edge-tts';
    await exec(edgeTtsPath, [
      '--voice', voice,
      '--file', textPath,
      '--write-media', rawPath,
    ], { timeout: 120_000 });
    console.log(`Audio crudo generado: ${rawPath}`);
  } catch (err) {
    throw new Error(
      `ERROR: edge-tts falló\n` +
      `WHY: ${err instanceof Error ? err.message : String(err)}\n` +
      `FIX: Verifica que edge-tts esté instalado en el venv y haya conexión a internet`,
    );
  }

  // Re-encode to stereo standard
  try {
    await exec('ffmpeg', [
      '-y', '-i', rawPath,
      '-codec:a', 'libmp3lame', '-b:a', '192k', '-ac', '2', '-ar', '44100',
      finalPath,
    ]);
    console.log(`Voz estéreo lista: ${finalPath}`);
  } catch {
    const { copyFile } = await import('node:fs/promises');
    await copyFile(rawPath, finalPath);
    console.warn('ffmpeg falló; se guardó el audio crudo.');
  }

  const duration = await getAudioDuration(finalPath);
  if (duration !== null) {
    console.log(`Duración real: ${duration.toFixed(1)}s`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
