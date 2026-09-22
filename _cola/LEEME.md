# 📥 Carpeta-cola: cómo publicar contenido nuevo

Aquí sueltas el material que generaste en NotebookLM y el script lo convierte en
páginas web, lo programa (goteo por fecha) y lo publica en Vercel automáticamente.

## Cómo se usa

1. Crea una carpeta por cada resumen/libro, con el **slug** como nombre (sin espacios,
   en minúsculas y con guiones). Ejemplo: `_cola/psicologia-del-dinero/`

2. Dentro de esa carpeta coloca:

```
_cola/psicologia-del-dinero/
├── resumen.md        (OBLIGATORIO) el contenido con su frontmatter (ver plantilla abajo)
├── portada.png       (opcional) imagen de portada del resumen
├── guia.pdf          (opcional) PDF descargable para ese día
```

3. Los **audios y vídeos NO van aquí** (son pesados). Los subes tú a Spotify/YouTube
   y pegas los enlaces en el frontmatter (`spotify:` y `youtube:`).

4. Ejecuta:
   ```bash
   npm run publicar
   ```
   El script:
   - copia `resumen.md` → `src/content/resumenes/<slug>.md`
   - copia `portada.png` y `guia.pdf` a `public/` y los enlaza en el frontmatter
   - archiva la carpeta en `_cola/_publicados/`
   - hace `git commit` + `git push` → Vercel despliega solo
   - la página aparece el día indicado en `fecha:` (goteo)

## Plantilla de `resumen.md`

```markdown
---
titulo: "Título llamativo del resumen"
libro: "Nombre del libro/documento"
autor: "Autor original"
categoria: "finanzas-personales"   # marketing-digital | emprendimiento | finanzas-personales | productividad | ventas | ecommerce
descripcion: "Descripción de 150-160 caracteres para Google."
minutosLectura: 7
ideasClave:
  - "Primera idea clave"
  - "Segunda idea clave"
  - "Tercera idea clave"
fecha: 2026-10-05        # el día que quieres que se publique (goteo)
destacado: false
tags: ["finanzas", "inversión"]
spotify: "https://open.spotify.com/episode/XXXX"   # opcional (audio)
youtube: "VIDEO_ID"                                 # opcional (vídeo)
---

## De qué trata
...tu contenido en markdown (análisis ORIGINAL, con tus palabras)...
```

> ⚠️ El contenido debe ser **original y transformador** (tu análisis), no una copia
> del libro/curso. Es lo que mantiene el sitio seguro para AdSense.
