# Panel Admin (local, Docker)

Edita los artículos del sitio, pega enlaces (Spotify/YouTube/PDF), sube documentos
a un Blob **público** (para no cargar el repo) y publica a Vercel con un botón.

## Requisitos
- Docker Desktop
- (Opcional) Token de un store **Blob público** de Vercel para subir archivos.
- (Opcional) Token de GitHub para el botón "Publicar".

## Arranque
```bash
cd /Users/andersonmartinezrestrepo/DEV-PROJECTS/01-active/landings/googleads
cp .env.admin.example .env          # rellena BLOB_READ_WRITE_TOKEN y GH_TOKEN si quieres
docker compose up --build
```
Abre **http://localhost:4322**

## Qué puedes hacer
- **Ver y editar** todos los artículos (todos los campos del frontmatter + el contenido).
- **Crear** artículos nuevos (botón + Nuevo).
- **Programar** su publicación con el campo *Fecha* (goteo).
- **Pegar enlaces**: Spotify, YouTube, Audio público, PDF, Portada.
- **Subir documentos/audios/imágenes** a tu Blob público → te da la URL para pegarla
  (así el repo queda ligero, solo con enlaces).
- **Publicar**: botón "🚀 Publicar" → hace `git commit` + `git push` → Vercel despliega.

## Flujo recomendado
1. Editas/creas contenido en el admin (local) y **Guardas** (escribe los `.md` del repo).
2. Subes documentos pesados con el botón *Subir* → copias la URL a los campos.
3. Cuando esté listo, pulsas **Publicar** (o `git push` desde tu terminal).
4. Vercel despliega y cada artículo aparece en su *Fecha*.

## Notas
- El admin edita los archivos reales del repo (montado en `/repo`), así que puedes
  revisar los cambios con `git diff` antes de publicar.
- Si no pones `GH_TOKEN`, el botón Publicar usa tus credenciales locales de git.
- Los archivos pesados **no** se guardan en el repo: se suben al Blob público y solo
  se guarda el enlace.
