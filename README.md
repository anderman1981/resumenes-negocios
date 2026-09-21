# Resúmenes de Negocios Online

Sitio de contenido en **Astro** para publicar resúmenes de libros y documentos de negocios online, optimizado para **SEO** y monetizable con **Google AdSense**.

> 💡 **La realidad del modelo de negocio:** el dinero llega cuando hay **tráfico real** (visitantes que ven los anuncios). Lo automatizable es la *producción de contenido*, no los ingresos. No existe forma legítima de generar dinero "en piloto automático" sin audiencia.

## Cómo funciona

1. Escribes resúmenes (o los generas con IA a partir de tus fuentes) → carpeta `src/content/resumenes/`.
2. Astro genera un sitio estático ultrarrápido → ideal para posicionar en Google.
3. Con tráfico, AdSense y enlaces de afiliado generan ingresos.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # desarrollo en http://localhost:4321
npm run build      # generar sitio para producción (carpeta dist/)
npm run preview    # previsualizar el build
npm run nuevo -- --libro "Título" --autor "Autor" --categoria ventas   # crear plantilla de resumen
```

## Puesta en marcha (checklist)

- [ ] Cambiar `SITE.url` y `SITE.name` en `src/config.mjs`
- [ ] Actualizar el dominio en `public/robots.txt`
- [ ] Publicar el sitio (Netlify / Vercel / Cloudflare Pages — gratis para estático)
- [ ] Solicitar Google AdSense en https://adsense.google.com
- [ ] Al aprobarte: poner tu `ca-pub-XXXX` en `src/config.mjs` y en `public/ads.txt`
- [ ] Crear los "slots" de anuncios en AdSense y pegarlos en `src/config.mjs`
- [ ] Registrar el sitio en Google Search Console y enviar el sitemap
- [ ] Publicar 15-25 resúmenes de calidad ANTES de pedir AdSense (les gusta ver contenido)

## Regla de oro (legal + AdSense)

Cada resumen debe ser un **análisis original con tus palabras**: ideas clave, contexto y aplicación.
**Nunca copies el texto del libro.** Copiar = riesgo de baneo de AdSense y problemas de copyright.

## Estructura

```
src/
  config.mjs              ← configuración central (nombre, dominio, AdSense, categorías)
  content/resumenes/      ← aquí van los resúmenes (.md)
  components/             ← Header, Footer, SEO, AdSlot, SummaryCard
  layouts/BaseLayout.astro
  pages/                  ← index, resumenes/, categorias/, sobre, rss
public/                   ← robots.txt, ads.txt, favicon
scripts/generar-resumen.mjs  ← crea plantillas de resúmenes
```
