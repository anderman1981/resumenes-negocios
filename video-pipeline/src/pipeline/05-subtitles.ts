// PASO 5 · Generación de subtítulos con faster-whisper local (GPU).
// Transcribe el audio, alinea con el voiceover canónico, y escribe SRT.
import { existsSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { config } from '../config/index.js';
import { loadStoryboard, currentCaseSlug } from '../content/load.js';
import { alignSegments, chunkSegments, toSRT } from './subtitle-alignment.js';
import type { VoiceoverSegment, TranscriptionSegment } from './subtitle-alignment.js';

const exec = promisify(execFile);

const VENV_PYTHON = process.env.VIDEO_PIPELINE_VENV
  ? `${process.env.VIDEO_PIPELINE_VENV}/bin/python3`
  : 'python3';

async function callWhisperLocal(audioPath: string): Promise<TranscriptionSegment[]> {
  const scriptPath = path.resolve(config.paths.root, 'scripts', 'transcribe.py');

  console.log('Transcribiendo con faster-whisper (GPU)...');
  const { stdout, stderr } = await exec(VENV_PYTHON, ['-I', scriptPath, audioPath], {
    timeout: 300_000,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (stderr) console.warn(stderr);

  const segments: Array<{ start: number; end: number; text: string }> = JSON.parse(stdout);
  return segments.map((s) => ({
    text: s.text.trim(),
    start: s.start,
    end: s.end,
  }));
}

async function main() {
  const storyboard = await loadStoryboard();
  const slug = currentCaseSlug();
  const audioPath = path.resolve(config.paths.audio, `${slug}.mp3`);

  if (!existsSync(audioPath)) {
    throw new Error(
      `ERROR: Audio file not found at ${audioPath}\n` +
      `WHY: Voice stage must run first\n` +
      `FIX: Run \`yarn voice ${slug}\``,
    );
  }
  console.log(`Audio: ${audioPath}`);

  const rawSegments = await callWhisperLocal(audioPath);
  console.log(`Transcripción: ${rawSegments.length} segmentos`);

  const voiceoverSegments: VoiceoverSegment[] = storyboard.scenes.map((s) => ({
    text: s.voiceover,
    start: s.start,
    end: s.end,
  }));

  const aligned = alignSegments(voiceoverSegments, rawSegments);

  if (aligned.length === 0) {
    throw new Error(
      'ERROR: Transcription returned no segments\n' +
      'WHY: faster-whisper produced empty output\n' +
      'FIX: Check audio file quality',
    );
  }

  const chunked = chunkSegments(aligned);

  const srt = toSRT(chunked);
  const srtPath = path.resolve(config.paths.output, `${slug}.srt`);
  await mkdir(config.paths.output, { recursive: true });
  await writeFile(srtPath, srt, 'utf-8');
  console.log(`Subtítulos: ${srtPath} (${chunked.length} bloques cortos)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
