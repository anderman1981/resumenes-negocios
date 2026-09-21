# Desplegar en Vercel + goteo diario

## 1. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Sitio de resúmenes de negocios"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

## 2. Conectar con Vercel

1. Entra en https://vercel.com y pulsa **Add New → Project**.
2. Importa el repositorio de GitHub.
3. Vercel detecta Astro automáticamente (Framework: Astro, Build: `astro build`, Output: `dist`). No cambies nada.
4. **Deploy**. En ~1 minuto tendrás una URL `https://tu-proyecto.vercel.app`.

## 3. Poner tu dominio

- En Vercel: **Settings → Domains** → añade tu dominio.
- Edita `src/config.mjs` (`SITE.url`) y `public/robots.txt` con la URL real, y vuelve a hacer commit.

## 4. Activar el goteo diario (publicar 1 módulo por día)

El sitio solo muestra módulos cuya `fecha` ya pasó. Para que cada día aparezca el siguiente, hay que reconstruir el sitio a diario:

1. En Vercel: **Settings → Git → Deploy Hooks** → crea uno (nombre: "rebuild-diario", rama: `main`). Copia la URL.
2. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
   - Nombre: `VERCEL_DEPLOY_HOOK`
   - Valor: la URL del deploy hook.
3. Ya está: el workflow `.github/workflows/rebuild-diario.yml` disparará un redeploy cada día a las 05:10 UTC (~00:10 Colombia). Puedes lanzarlo manualmente desde la pestaña **Actions**.

## 5. AdSense — checklist de aprobación y políticas

El sitio ya incluye TODO lo que Google exige para aprobar AdSense:

- ✅ Política de Privacidad (`/privacidad`) con la cláusula de Google/DoubleClick
- ✅ Política de Cookies (`/cookies`)
- ✅ Términos de Uso (`/terminos`)
- ✅ Página de Contacto (`/contacto`) — pon tu correo real en `SITE.email` (`src/config.mjs`)
- ✅ Aviso de cookies (banner) que **solo carga anuncios tras aceptar**
- ✅ `ads.txt` (falta pegar tu número de editor)
- ✅ Contenido original y navegación clara

**Pasos:**
1. Pon tu **correo real** en `SITE.email` y tu **dominio** en `SITE.url` (`src/config.mjs`).
2. Publica primero **15-25 resúmenes de calidad** (AdSense rechaza sitios con poco contenido).
3. Solicita AdSense en https://adsense.google.com con tu dominio.
4. Al aprobarte:
   - Pon tu `ca-pub-XXXX` en `ADSENSE.client` (`src/config.mjs`) y crea los slots (`ADSENSE.slots`).
   - Actualiza `public/ads.txt` con tu número de editor (descomenta la línea).
   - Commit → se despliega solo.
5. **Tráfico de la UE/EEE/Reino Unido (obligatorio):** activa el **CMP certificado gratuito de Google**
   en AdSense → **Privacidad y mensajes** → *Mensaje de consentimiento de la UE (GDPR)*.
   Google inyecta el consentimiento certificado en todo el sitio automáticamente. El banner propio
   cubre la transparencia y el resto de países.

**Políticas que ya cumples:** contenido propio (resúmenes originales), nada de contenido prohibido,
los anuncios no se cargan sin consentimiento, y hay páginas legales accesibles desde el pie.
⚠️ No hagas clic nunca en tus propios anuncios ni pidas a nadie que lo haga (Google lo detecta y banea).

## 6. Publicación semanal (todos los lunes)

El sitio muestra cada resumen cuando llega su `fecha` (goteo). Para publicar "el contenido de la
semana siguiente cada lunes":

1. Cada lunes, crea los archivos de la próxima serie con fechas en los lunes futuros. Ejemplo:
   ```bash
   npm run nuevo -- --libro "Título" --categoria ventas \
     --serie "nueva-serie" --serieNombre "Nombre visible" --dia 1 --fecha 2026-09-28
   ```
2. El workflow `.github/workflows/rebuild-diario.yml` reconstruye el sitio a diario, así que
   cada contenido aparece exactamente en su fecha (incluidos los lunes) sin que hagas nada.
3. Si prefieres que el rebuild corra solo los lunes, cambia el cron a `10 5 * * 1`.

## 7. Vídeos para YouTube y podcast para Spotify

- **Vídeos:** `bash scripts/generar-video.sh 1 7` genera `videos/dia-N.mp4` (diapositivas + audio).
- **Guiones/metadatos de YouTube:** ver `youtube/guiones-youtube.md` (título, descripción, tags por día).
- **Spotify:** sube los `.m4a` de `public/audio/` en Spotify for Creators.

> Nota: los audios (~50 MB c/u) están en `public/audio/` para que el sitio funcione al desplegar.
> Si el repositorio se hace muy pesado, muévelos a un CDN (Cloudflare R2, Bunny) y actualiza las rutas.

## Nota sobre los audios

Los `.m4a` (~50MB c/u) están en `public/audio/`. Funcionan, pero si añades muchos, conviene moverlos a un almacenamiento/CDN (Cloudflare R2, Bunny, etc.) para no inflar el repositorio.
