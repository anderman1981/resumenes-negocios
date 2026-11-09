"""Transcribe audio using faster-whisper with word timestamps.
Converts to WAV first to avoid PyAV compatibility issues.
Output: JSON array of segments.
Usage: python3 transcribe.py <audio_path> [model_size]
"""
import json
import subprocess
import sys
import tempfile
import os
import numpy as np

def load_audio_ffmpeg(audio_path, sr=16000):
    """Load audio using ffmpeg, returning numpy float32 array."""
    cmd = [
        "ffmpeg", "-i", audio_path,
        "-f", "s16le", "-acodec", "pcm_s16le",
        "-ac", "1", "-ar", str(sr),
        "-loglevel", "error",
        "pipe:1"
    ]
    result = subprocess.run(cmd, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg error: {result.stderr.decode()}")
    audio = np.frombuffer(result.stdout, dtype=np.int16).astype(np.float32) / 32768.0
    return audio

def main():
    audio_path = sys.argv[1]
    model_size = sys.argv[2] if len(sys.argv) > 2 else "small"

    from faster_whisper import WhisperModel

    audio = load_audio_ffmpeg(audio_path)

    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        audio,
        language="es",
        word_timestamps=True,
        vad_filter=True,
    )

    result = []
    for seg in segments:
        words = []
        if seg.words:
            for w in seg.words:
                words.append({
                    "word": w.word,
                    "start": round(w.start, 3),
                    "end": round(w.end, 3),
                })
        result.append({
            "start": round(seg.start, 3),
            "end": round(seg.end, 3),
            "text": seg.text.strip(),
            "words": words,
        })

    json.dump(result, sys.stdout, ensure_ascii=False)

if __name__ == "__main__":
    main()
