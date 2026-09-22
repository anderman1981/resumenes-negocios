# Imagen COMPLETA: admin + pipeline (audios, portadas, vídeos, subtítulos, PDF).
FROM node:20-slim

# Herramientas del pipeline: git, ffmpeg, python
RUN apt-get update && apt-get install -y --no-install-recommends \
    git ffmpeg python3 python3-pip ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Librerías Python del pipeline (TTS, subtítulos, PDF)
RUN pip3 install --no-cache-dir --break-system-packages edge-tts faster-whisper fpdf2

RUN git config --global --add safe.directory '*'

WORKDIR /admin
COPY package.json ./
RUN npm install --omit=dev
COPY . .

ENV PORT=4322
ENV REPO_DIR=/repo
EXPOSE 4322
CMD ["node", "server.mjs"]
