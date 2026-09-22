# 🤖 Guía de automatización semanal

Objetivo: los domingos defines el material de la semana, lo generas en NotebookLM,
lo descargas, y con **un comando** el Mac publica todo en la web (Vercel), y de ahí
el podcast (Spotify) y los vídeos (YouTube) se suben de forma automática cada día.

---

## Flujo semanal (resumen)

```
DOMINGO
  1. Generas en NotebookLM: resumen, audio (podcast), y lo descargas.
  2. Por cada tema, creas una carpeta en _cola/<slug>/ con:
       - resumen.md   (contenido + frontmatter; incluye fecha del día que se publica)
       - portada.png  (opcional)
       - guia.pdf     (opcional)
  3. Subes el AUDIO a Spotify y el VÍDEO a YouTube (o dejas que se automatice, ver abajo).
  4. Pegas los enlaces (spotify:, youtube:) en cada resumen.md
  5. Ejecutas:  npm run publicar
       → crea las páginas, hace commit + push → Vercel despliega
       → cada página aparece SOLA en su fecha (goteo)
```

---

## 1) WEB (Vercel) — ✅ totalmente automático

- **Publicar la cola:** `npm run publicar` (o `npm run publicar -- --dry` para previsualizar).
- **Programación (goteo):** el campo `fecha:` de cada `resumen.md` define cuándo aparece.
- **Rebuild diario:** ya configurado en `.github/workflows/rebuild-diario.yml` (reconstruye
  a diario para que el contenido de cada fecha salga solo). No tienes que hacer nada.

### Automatizar `npm run publicar` cada día en el Mac (opcional)
Si quieres que el Mac procese la cola solo (por si dejas material con fechas futuras),
crea un agente de `launchd`:

`~/Library/LaunchAgents/com.resumenes.publicar.plist`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.resumenes.publicar</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string><string>-lc</string>
    <string>cd /Users/andersonmartinezrestrepo/DEV-PROJECTS/01-active/landings/googleads && /opt/homebrew/bin/npm run publicar >> /tmp/publicar.log 2>&1</string>
  </array>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>7</integer><key>Minute</key><integer>0</integer></dict>
</dict></plist>
```
Actívalo:  `launchctl load ~/Library/LaunchAgents/com.resumenes.publicar.plist`
(Corre cada día a las 7:00. Como la cola normalmente está vacía, no hace nada hasta
que dejes material nuevo.)

---

## 2) SPOTIFY (podcast) — 2 opciones

### Opción A — Manual rápido (lo que haces hoy)
Subes el audio a Spotify for Creators, publicas, copias el enlace del episodio
(`https://open.spotify.com/episode/XXXX`) y lo pones en `spotify:` del resumen.md.
Es 1 minuto por episodio.

### Opción B — Automático vía RSS (recomendado a futuro)
El sitio ya genera un **feed de podcast**:
```
https://resumenes-negocios.vercel.app/podcast.xml
```
Cómo funciona:
1. El audio debe estar en una **URL pública**. Dos formas:
   - Súbelo a tu **store Blob PÚBLICO** de Vercel y pon la URL en `audioPublico:` del resumen.md, **o**
   - deja el audio como `/audio/<slug>.mp3` en `public/audio/` (se sirve público solo).
2. Registra `…/podcast.xml` **una sola vez** en un agregador (Apple Podcasts Connect;
   Spotify admite RSS de podcasts alojados fuera).
3. A partir de ahí, **cada episodio nuevo aparece solo** en Spotify/Apple cuando su
   `fecha` llega. Cero trabajo manual.

> Nota: un show que ya creaste subiendo audios a mano no se puede convertir a RSS.
> La Opción B conviene para un show nuevo pensado 100% automático.

---

## 3) YOUTUBE — semiautomático

### Generar el vídeo (local, gratis)
```bash
bash scripts/generar-video.sh 1 7
```
Combina la portada + el audio → `videos/dia-N.mp4`. (Para audio conversacional usa
el que descargaste; colócalo en `_fuentes/dia-N/` como espera el script.)

### Subir a YouTube automáticamente
Necesita configuración **una vez** (OAuth con la YouTube Data API). Opciones:
- **n8n** (que ya usas): nodo *YouTube → Upload*. Un workflow con **Schedule Trigger**
  (diario) que sube el `videos/dia-N.mp4` del día con el título/descripción de
  `youtube/guiones-youtube.md`.
- **Script + `youtube-upload`/API**: OAuth + `videos.insert`.

Pasos de la API (una vez):
1. Google Cloud → crea proyecto → habilita **YouTube Data API v3**.
2. Crea credenciales **OAuth 2.0** (scope `youtube.upload`).
3. Autoriza tu canal y guarda el token (en n8n como *Credential*).
4. En n8n: Schedule (diario) → lee el vídeo del día → *YouTube Upload* → marca como público.

> Límite: la API tiene cuota diaria (subir ~6 vídeos/día en cuota estándar). Suficiente
> para 1 vídeo/día.

---

## Checklist del domingo (tu rutina de 20 min)
- [ ] Genero en NotebookLM el resumen + audio y los descargo.
- [ ] Creo `_cola/<slug>/` con `resumen.md` (con `fecha` del día), `portada.png`, `guia.pdf`.
- [ ] Subo audio a Spotify (o lo pongo en `audioPublico` si uso RSS) y pego `spotify:`.
- [ ] (Si hay vídeo) lo dejo listo para que n8n lo suba, y pego `youtube:`.
- [ ] `npm run publicar` → listo. Todo sale solo en su fecha.
