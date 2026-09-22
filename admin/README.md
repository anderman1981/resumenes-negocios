# Panel Admin + Pipeline (local)

Edita los artículos del sitio, pega enlaces (Spotify/YouTube/PDF), sube documentos
a un Blob **público** (para no cargar el repo), **ejecuta el pipeline** (podcast,
portadas, vídeos, subtítulos, PDF) y publica a Vercel con un botón.

## Dos formas de arrancarlo

### A) Nativo en el Mac — **recomendado para el pipeline** ⭐
Es el modo más rápido y ya probado: tu Mac tiene instalado `python3`, `ffmpeg`,
`edge-tts`, `faster-whisper`, `sharp`, etc. No hay que reconstruir nada.

```bash
cd /Users/andersonmartinezrestrepo/DEV-PROJECTS/01-active/landings/googleads
npm install                              # deps del repo (sharp, etc.) — una vez
cd admin && npm install                  # deps del admin — una vez
# variables opcionales para subir al Blob y para publicar:
export BLOB_READ_WRITE_TOKEN=...         # store Blob público de Vercel
export GH_TOKEN=...                      # token de GitHub (botón Publicar)
node server.mjs
```
Abre **http://localhost:4322**. El pipeline corre con las herramientas del Mac.

### B) Docker — todo-en-uno (más pesado)
Imagen con `git`, `ffmpeg`, `python3`, `edge-tts`, `faster-whisper`, `fpdf2`. Útil
si no quieres instalar nada en el Mac. La **primera** vez instala dependencias
dentro del contenedor (tarda un poco) y descarga el modelo de Whisper al usar
subtítulos.

```bash
cd /Users/andersonmartinezrestrepo/DEV-PROJECTS/01-active/landings/googleads
cp .env.admin.example .env               # rellena BLOB_READ_WRITE_TOKEN y GH_TOKEN si quieres
docker compose up --build
```
Abre **http://localhost:4322**

> Nota Docker: el repo se monta en `/repo`, pero `node_modules` usa un volumen
> propio del contenedor (`repo_node_modules`) porque los binarios nativos del Mac
> (p. ej. `sharp`) no funcionan en Linux. Se instalan solos al arrancar.

## Requisitos
- Modo A: Node 20+, Python 3, ffmpeg, y los paquetes del pipeline en el Mac.
- Modo B: Docker Desktop.
- (Opcional) Token de un store **Blob público** de Vercel para subir archivos.
- (Opcional) Token de GitHub para el botón "Publicar".

## Qué puedes hacer
- **Ver y editar** todos los artículos (todos los campos del frontmatter + el contenido).
- **Crear** artículos nuevos (botón + Nuevo).
- **Programar** su publicación con el campo *Fecha* (goteo).
- **Pegar enlaces**: Spotify, YouTube, Audio público, PDF, Portada.
- **Subir documentos/audios/imágenes** a tu Blob público → te da la URL para pegarla
  (así el repo queda ligero, solo con enlaces).
- **Pipeline** (botón "⚙️ Pipeline"): ejecuta los scripts de generación y ves el log
  en vivo. Botones disponibles:
  - **todo** → orquestador completo (`scripts/generar-todo.sh`).
  - **podcast** → audios de 2 voces (edge-tts) desde `_semana/guiones.md`.
  - **covers** → portadas de cada episodio.
  - **videos** → vídeos con diapositivas + audio.
  - **subtitulos** → `.srt` ES/EN (faster-whisper, modelo `small`).
  - **guia** → PDF de la infografía.
  - **publicar** → mueve la cola (`_cola`) a páginas y hace push.
- **Publicar**: botón "🚀 Publicar" → hace `git commit` + `git push` → Vercel despliega.

## Flujo semanal recomendado
1. Vie–Sáb: generas los contenidos en NotebookLM y dejas `_semana/guiones.md`
   y los artículos en `_cola/<slug>/resumen.md`.
2. Editas/creas contenido en el admin y **Guardas** (escribe los `.md` del repo).
3. Botón **⚙️ Pipeline** → *podcast* → *covers* → *videos* → *subtitulos* (o *todo*).
4. Subes lo pesado con **Subir** → copias las URLs a los campos.
5. Pulsas **Publicar**. Vercel despliega y cada artículo aparece en su *Fecha*.

## Notas
- El admin edita los archivos reales del repo, así que puedes revisar los cambios
  con `git diff` antes de publicar.
- Solo corre un proceso de pipeline a la vez; el log se ve en vivo en el modal.
- Si no pones `GH_TOKEN`, el botón Publicar usa tus credenciales locales de git.
- Los archivos pesados **no** se guardan en el repo: se suben al Blob público y solo
  se guarda el enlace.
